/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define FAQMaster model -------------
 */
const NewsMaster = dbContext.define('News', {
    NewsID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "newsId"
    },
    newsName: {
        type: Sequelize.STRING,
        field: "NewsName"
    },
    newsDate: {
        type: Sequelize.DATE,
        field: "newsDate"
    },
    newsDetails: {
        type: Sequelize.STRING,
        field: "newsDetails"
    },
    moreDetails: {
        type: Sequelize.STRING,
        field: "MoreDetails"
    },
    active: {
        type: Sequelize.CHAR,
        field: "Active"
    },
    newsType: {
        type: Sequelize.INTEGER,
        field: "NewsType"
    },
    newsCategory: {
        type: Sequelize.INTEGER,
        field: "NEWSCATEGORY"
    }
});

module.exports = {
    NewsMaster: NewsMaster
}