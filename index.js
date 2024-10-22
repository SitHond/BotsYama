const path = require('node:path');
const fs = require('node:fs');
const Sequelize = require('sequelize');
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const { DataTypes } = require('sequelize');
const { autoUpdatePets } = require('./function/autoUpdatePets');

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
// Обновдение всех таблиц без перезаписи данных
    sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database & tables created/updated with altered structure!');
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


// Логируем все гильдии, к которым подключен бот
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.guilds.cache.forEach(guild => {
        console.log(`Connected to server: ${guild.name} (id: ${guild.id})`);
    });

    // Устанавливаем статус бота
    client.user.setActivity('/help', { type: ActivityType.Watching });


    // Запускаем автоматическое обновление состояния питомцев
    setInterval(() => {
        autoUpdatePets(client); // Передаём клиента в функцию для обновления
    }, 60000); // 1 минута для теста (позже изменим на 3-4 часа)

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
