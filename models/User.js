const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('User', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,  // Указываем, что это часть составного первичного ключа
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,  // Указываем, что это часть составного первичного ключа
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        balance: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        exp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        donatCoins: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lastWork: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        reputation: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lastRepGivenTo: {
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
        activity: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['id', 'guildId'] // Уникальная комбинация полей id и guildId
            }
        ]
    });
};
