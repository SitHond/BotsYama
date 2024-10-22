// Получение питомцев пользователя
const { Pet } = require('../models/Pet'); // Путь к модели Pet

async function getUserPets(userId, guildId) {
    try {
        // Ищем всех питомцев пользователя в конкретной гильдии
        const pets = await Pet.findAll({
            where: {
                userId: userId,
                guildId: guildId
            }
        });

        if (pets.length === 0) {
            return null; // У пользователя нет питомцев
        }

        return pets; // Возвращаем список питомцев
    } catch (error) {
        console.error('Ошибка при получении питомцев:', error);
        return null;
    }
}

async function savePetName(userId, guildId, petId, newName) {
    try {
        // Находим питомца по userId, guildId и ID питомца (если у вас есть petId)
        const pet = await Pet.findOne({
            where: {
                userId: userId,
                guildId: guildId,
                id: petId // Если у вас есть идентификатор питомца
            }
        });

        if (!pet) {
            return false; // Питомец не найден
        }

        // Обновляем имя питомца
        pet.name = newName;
        await pet.save(); // Сохраняем изменения

        return true; // Успех
    } catch (error) {
        console.error('Ошибка при сохранении имени питомца:', error);
        return false;
    }
}

module.exports = {getUserPets, savePetName};