/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobSearchAlert model -------------
 */
const messageTransaction = dbContext.define('IM_MessageTransaction', {
    transactionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "MessageTransaction_Id"
    },
    chatId: {
        type: Sequelize.INTEGER,
        field: "MessageHeader_Id"
    },
    responseTimeInHours: {
        type: Sequelize.INTEGER,
        field: "ResponseTimeInHours"
    },    
    responsiblePerson: {
        type: Sequelize.INTEGER,
        field: "ResponsiblePerson"
    },
    responseLevel: {
        type: Sequelize.INTEGER,
        field: "ResponseLevel"
    }
});

module.exports = {
    messageTransaction: messageTransaction
}