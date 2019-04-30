/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define LEGALDOC model -------------
 */
const LegalDoc = dbContext.define('LEGALDOC', {
    LEGALAPPID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    LEGALDOCID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    LEGALDOC_NAME: {
        type: Sequelize.STRING
    },
    LEGALDOC_FILEPATH: {
        type: Sequelize.STRING
    },
    LEGALDOC_FILENAME: {
        type: Sequelize.STRING
    },
    LEGALDOC_FILEEXT: {
        type: Sequelize.STRING
    },
    LEGALDOC_CREATEDATE: {
        type: Sequelize.DATE
    },
    LEGALDOC_SHOWTOCONSLT: {
        type: Sequelize.BOOLEAN
    }
});

module.exports = {
    LegalDoc: LegalDoc,
}