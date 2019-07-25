'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Evaluation = loader.database.define('evaluations', {
  postId: { // foreignkey
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  userId: { // foreignkey
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  evaluation: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  fixtureId: { // 日程ID はインデックスとして利用するので外部キーにしない
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  }
}, {
  freezeTableName: true,
  timestamps: false
});

module.exports = Evaluation;
