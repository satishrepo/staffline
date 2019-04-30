/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Faq model -------------
 */

const Faq = dbContext.define('FAQ', {
    faqId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        field: "FAQ_Id"
    },
    category: {
        type: Sequelize.INTEGER,
        field: "Category"
    },
    title: {
        type: Sequelize.STRING,
        field: "Title"
    },
    contents: {
        type: Sequelize.STRING,
        field: "Contents"
    },
    fileName: {
        type: Sequelize.STRING,
        field: "File_Name"
    },
    displayOrder: {
        type: Sequelize.INTEGER,
        field: "DisplayOrder"
    },
    status: {
        type: Sequelize.BOOLEAN,
        field: "Status"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    modifiedDate: {
        type: Sequelize.DATE,
        field: "Modified_Date"
    },
    modifiedBy: {
        type: Sequelize.INTEGER,
        field: "Modified_By"
    }

});

module.exports = {
    Faq: Faq
}