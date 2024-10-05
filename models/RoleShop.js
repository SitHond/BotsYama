// models/RoleShop.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('RoleShop', {
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        roleName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
};
