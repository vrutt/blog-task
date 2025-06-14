'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('Articles', 'summary', {
      type: Sequelize.TEXT,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.dropColumn('Articles', 'summary', {
      type: Sequelize.TEXT,
      allowNull: true
    })
  }
};
