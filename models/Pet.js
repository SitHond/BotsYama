// models/Pet.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Pet', {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guildId: { // Добавьте это поле, если его нет
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        hunger: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            allowNull: false,
        },
        energy: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            allowNull: false,
        },
        happiness: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            allowNull: false,
        },
        lastInteractedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        accessories: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {},
        },
    });
};
