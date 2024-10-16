const path = require('node:path');
const fs = require('node:fs');
const Sequelize = require('sequelize');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const { DataTypes } = require('sequelize');

// Создание клиента Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// Подключение к базе данных
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

// Загрузка моделей с передачей DataTypes
const User = require('./models/User')(sequelize, DataTypes);
const Settings = require('./models/Settings')(sequelize, DataTypes);
const RoleShop = require('./models/RoleShop')(sequelize, DataTypes);
const Pet = require('./models/Pet')(sequelize, DataTypes);
const PetShop = require('./models/PetShop')(sequelize, DataTypes);
const AccessoryShop = require('./models/AccessoryShop')(sequelize, DataTypes);

// Добавление всех моделей в client.sequelize.models
client.sequelize = sequelize;
client.sequelize.models = {
    User,
    Settings,
    RoleShop,
    Pet,
    PetShop,
    AccessoryShop
};

// Синхронизация базы данных
sequelize.sync()
    .then(() => {
        console.log('Database & tables created/updated!');
    })
    .catch(error => {
        console.error('Unable to synchronize the database:', error);
    });

// Инициализация коллекции команд
client.commands = new Collection();
client.events = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Загрузка команд из всех файлов и папок в папке "commands"
const commandFiles = fs.readdirSync(commandsPath);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    if (fs.statSync(filePath).isDirectory()) {
        const nestedCommandFiles = fs.readdirSync(filePath).filter(nestedFile => nestedFile.endsWith('.js'));
        for (const nestedFile of nestedCommandFiles) {
            const nestedFilePath = path.join(filePath, nestedFile);
            const command = require(nestedFilePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${nestedFilePath} is missing a required "data" or "execute" property.`);
            }
        }
    } else if (file.endsWith('.js')) {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Загрузка событий
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Функция для добавления участника в базу данных, если он отсутствует
async function addMemberToDatabase(member, client) {
    const User = client.sequelize.models.User;
    try {
        const [user, created] = await User.findOrCreate({
            where: { id: member.id, guildId: member.guild.id },
            defaults: { username: member.user.username },
        });
        if (created) {
            console.log(`Добавлен новый пользователь ${member.user.username} на сервере ${member.guild.name}`);
        }
    } catch (error) {
        console.error(`Ошибка при добавлении пользователя ${member.user.username}:`, error);
    }
}

// Обработка событий на разных серверах
client.on('guildCreate', async (guild) => {
    console.log(`Bot has joined a new server: ${guild.name} (id: ${guild.id})`);
    
    try {
        const members = await guild.members.fetch();
        for (const member of members.values()) {
            await addMemberToDatabase(member, client);
        }
        console.log(`Initialized users in server ${guild.name}`);
    } catch (error) {
        console.error('Error initializing users:', error);
    }
});
const prankMessages = [
    "Я скучаю! Почему ты меня игнорируешь?",
    "Эй, хозяин, я только что скинул что-то со стола!",
    "Если ты не поиграешь со мной, я устрою беспорядок!",
    "Мне скучно... может, я съем твой любимый тапок?",
    "Хозяин, тебе стоит обратить на меня внимание, иначе я стану ещё более надоедливым!",
    "Ты не заметил? Я только что разбросал твои вещи!",
    "Я тут подумал... а что будет, если я переверну всё в комнате?",
    "Может, поиграем? Или мне придётся развлекаться самому...",
    "Если ты не поторопишься, я устрою вечеринку с беспорядком!",
    "Почему так тихо? Пора навести шум!",
    "Пора мне немного порезвиться. Ты даже не представляешь, что я задумал!",
    "Я съел что-то, что, наверное, не стоило есть... Придётся тебе узнать, что это!",
    "Твой диван выглядит как отличное место для того, чтобы его подрать!",
    "Знаешь, твоя клавиатура такая вкусная! Может, попробую её на зуб?",
    "Я нашел новую игрушку! О, кажется, это была твоя зарядка...",
    "Как же весело мне ронять твои вещи на пол! А тебе, хозяин?",
    "Кажется, я нашел отличное место для пряток — это твой шкаф, верно?",
    "Ты где? Я уже начинаю что-то крушить, если что.",
    "Эй, хозяин, я только что съел что-то, что ты не оставлял для меня...",
    "Ты не скучаешь по мне? Потому что я по тебе скучаю и хочу устроить беспорядок!"
];

const hungerMessages = [
    "Хозяин, я очень голоден! Мне нужно поесть!",
    "Если ты меня не покормишь, я найду что-то сам!",
    "Я бы не отказался от еды... очень скоро!",
    "Кажется, пора перекусить... когда ты меня покормишь?",
    "Мой желудок урчит, хозяин, пора меня накормить!"
];

const happinessMessages = [
    "Я чувствую себя немного одиноко... можно поиграть?",
    "Почему ты меня игнорируешь? Я так хочу поиграть!",
    "Мне немного скучно, не хочешь уделить мне внимание?",
    "Хозяин, можно мне немного больше счастья? Я скучаю!",
    "Ты совсем про меня забыл? Мне нужно больше внимания!"
];

const energyMessages = [
    "Я чувствую себя немного усталым... может, отдохнём?",
    "Мне нужно немного энергии, можно отдохнуть?",
    "Я так устал, давай найдём время для сна.",
    "Кажется, у меня заканчивается энергия... время поспать!",
    "Я слишком устал, мне нужно восстановиться."
];



// Объект для отслеживания последних отправленных сообщений для каждого питомца
const petLastMessageTimes = {};

async function autoUpdatePets() {
    const { Pet, Settings } = client.sequelize.models;

    const pets = await Pet.findAll();

    pets.forEach(async pet => {
        const timeElapsed = (new Date() - new Date(pet.lastInteractedAt)) / (1000 * 60 * 60); // прошедшее время в часах

        pet.hunger += Math.floor(timeElapsed * 5); // 5 ед. голода за час
        if (pet.hunger > 100) pet.hunger = 100;

        pet.energy -= Math.floor(timeElapsed * 2); // теряет 2 ед. энергии за час
        if (pet.energy < 0) pet.energy = 0;

        pet.happiness -= Math.floor(timeElapsed * 2); // теряет 2 ед. счастья за час
        if (pet.happiness < 0) pet.happiness = 0;

        pet.lastInteractedAt = new Date();

        // Получаем настройки гильдии
        const settings = await Settings.findOne({ where: { guildId: pet.guildId } });
        if (!settings || !settings.petChannelId) return; // Убедимся, что канал установлен

        const channel = client.channels.cache.get(settings.petChannelId);
        if (!channel) return;

        const now = Date.now();
        const lastMessageTime = petLastMessageTimes[pet.userId] || 0;

        // Ограничиваем отправку сообщений каждые 5 часов (18000000 миллисекунд)
        if (now - lastMessageTime < 18000000) return;

        // Проказничество питомца в зависимости от его состояний
        if (pet.hunger >= 60) {
            const hungerMessage = hungerMessages[Math.floor(Math.random() * hungerMessages.length)];
            await channel.send(`<@${pet.userId}>, твой питомец "${pet.name}" сообщает: ${hungerMessage}`);
        }

        if (pet.happiness <= 40) {
            const happinessMessage = happinessMessages[Math.floor(Math.random() * happinessMessages.length)];
            await channel.send(`<@${pet.userId}>, твой питомец "${pet.name}" сообщает: ${happinessMessage}`);
        }

        if (pet.energy <= 40) {
            const energyMessage = energyMessages[Math.floor(Math.random() * energyMessages.length)];
            await channel.send(`<@${pet.userId}>, твой питомец "${pet.name}" сообщает: ${energyMessage}`);
        }

        // Если показатели питомца очень плохие, он проказничает
        if (pet.happiness <= 20 || pet.energy <= 20) {
            const prankMessage = prankMessages[Math.floor(Math.random() * prankMessages.length)];
            await channel.send(`<@${pet.userId}>, твой питомец "${pet.name}" начинает проказничать: ${prankMessage}`);
        }

        // Отключение микрофона владельца, если показатели критические
        if (pet.happiness <= 10 && pet.energy <= 10) {
            const guild = client.guilds.cache.get(pet.guildId);
            if (guild) {
                const member = await guild.members.fetch(pet.userId);
                if (member.voice.channel) {
                    await member.voice.setMute(true, 'Питомец отключил микрофон');
                    await channel.send(`<@${pet.userId}>, ваш питомец отключил ваш микрофон за игнорирование!`);
                }
            }
        }

        // Проверка на смерть питомца
        if (pet.hunger >= 100 && pet.energy <= 0 && pet.happiness <= 0) {
            await channel.send(`<@${pet.userId}>, к сожалению, ваш питомец "${pet.name}" умер.`);
            await pet.destroy();
        }

        // Обновляем время последнего отправленного сообщения
        petLastMessageTimes[pet.userId] = now;

        await pet.save();
    });
}

// Обновление состояния питомца теперь раз в час (3600000 миллисекунд)
setInterval(autoUpdatePets, 3600000); // 1 час

// Логируем все гильдии, к которым подключен бот
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.guilds.cache.forEach(guild => {
        console.log(`Connected to server: ${guild.name} (id: ${guild.id})`);
    });

    // Устанавливаем статус бота
    client.user.setActivity('/help', { type: ActivityType.Watching });

    // Сканирование участников на каждом сервере
    for (const guild of client.guilds.cache.values()) {
        try {
            const members = await guild.members.fetch();
            for (const member of members.values()) {
                // Добавление участников в базу данных, если их там нет
                await addMemberToDatabase(member, client);
            }
            console.log(`Сканирование участников сервера ${guild.name} завершено.`);
        } catch (error) {
            console.error(`Ошибка при сканировании участников на сервере ${guild.name}:`, error);
        }
    }
});

// Запуск клиента
client.login(token);
