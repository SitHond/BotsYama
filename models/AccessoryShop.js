module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AccessoryShop', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING, // Категория аксессуара (шляпы, очки и т.д.)
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER, // Стоимость аксессуара
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING, // URL для изображения аксессуара
            allowNull: false,
        }
    });
};
