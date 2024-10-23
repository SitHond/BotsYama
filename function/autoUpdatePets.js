// function/petAutoUpdate.js
async function autoUpdatePets(client) {
    const { Pet } = client.sequelize.models;
    
    const pets = await Pet.findAll(); // Получаем всех питомцев из базы данных

    pets.forEach(async pet => {
        const timeElapsed = 1; // Время прошло в минутах для теста (потом изменишь на 3-4 часа)
        
        // Уменьшение показателей питомца
        pet.hunger += Math.floor(timeElapsed * 2); // 2 ед. голода за минуту (уменьшение)
        if (pet.hunger > 100) pet.hunger = 100;

        pet.energy -= Math.floor(timeElapsed * 1); // теряет 1 ед. энергии за минуту
        if (pet.energy < 0) pet.energy = 0;

        pet.happiness -= Math.floor(timeElapsed * 1); // теряет 1 ед. счастья за минуту
        if (pet.happiness < 0) pet.happiness = 0;

        pet.lastInteractedAt = new Date(); // Обновляем время последнего взаимодействия

        // Сохраняем изменения
        await pet.save();
    });
}

// Экспорт функции для использования в других файлах
module.exports = { autoUpdatePets };
