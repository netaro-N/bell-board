'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Post = loader.database.define('posts', {
  postId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fixtureId: {
    type:Sequelize.INTEGER,
    allowNull: false
  },
  postedBy: {
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