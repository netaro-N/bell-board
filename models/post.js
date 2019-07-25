'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Post = loader.database.define('posts', {
  postId: { // foreignkey
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fixtureId: { // 日程ID はインデックスとして利用するので外部キーにしない
    type:Sequelize.INTEGER,
    allowNull: false
  },
  postedBy: { // foreignkey
    type:Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT
  }
}, {
  freezeTableName: true,
  timestamps: true
});

module.exports = Post;