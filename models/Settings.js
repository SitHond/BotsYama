// models/Settings.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Settings', {
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        petChannelId: { // Поле для хранения канала для питомцев
            type: DataTypes.STRING,
            allowNull: true,
        },
        afkChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        notificationChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        welcomeChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        farewellChannelId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        welcomeMessage: { // Новое поле для сообщения приветствия
            type: DataTypes.TEXT,
            allowNull: true,
        },
        farewellMessage: { // Новое поле для сообщения прощания
            type: DataTypes.TEXT,
            allowNull: true,
        },
        auditLogChannelId: { // Новое поле для канала журнала аудита
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });
};
