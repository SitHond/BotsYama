module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Accessory', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING, // категория аксессуара (шляпы, очки и т.д.)
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING, // URL для изображения аксессуара
            allowNull: false,
        }
    });
};
