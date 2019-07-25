'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/bell_board'
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};