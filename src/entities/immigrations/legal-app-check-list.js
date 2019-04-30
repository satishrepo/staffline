/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define LEGALAPPCHECKLIST model -------------
 */
const Legalappchecklist = dbContext.define('LEGALAPPCHECKLIST', {
    documentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    },
    documentName: {
        type: Sequelize.STRING
    }
});

module.exports = {
    Legalappchecklist: Legalappchecklist
}