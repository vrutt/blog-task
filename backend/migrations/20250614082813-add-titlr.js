'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('ArticleRevisions', 'title', {
      type: Sequelize.STRING,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.dropColumn('ArticleRevisions', 'title', {
      type: Sequelize.STRING,
      allowNull: true
    })
  }
};
