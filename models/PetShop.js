module.exports = (sequelize, DataTypes) => {
    return sequelize.define('PetShop', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING, // Тип питомца (например, "dog", "cat")
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER, // Стоимость питомца
            allowNull: false,
        }
    });
};
