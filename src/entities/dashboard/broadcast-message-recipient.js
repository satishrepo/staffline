/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define BMsg_BroadcastMessage model -------------
 */
const BMsgRecipient = dbContext.define('BMsg_Recipient', {
    msgRecipientId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field : "BMRecipient_Id"
    },
    messageId: {
        type: Sequelize.INTEGER,
        field: "Message_Id"
    },
    recipientId: {
        type: Sequelize.INTEGER,
        field: "RecipientId"
    },
    readStatus: {
        type: Sequelize.INTEGER,
        field: "ReadStatus"
    },
    readDate: {
        type: Sequelize.DATE,
        field: "ReadDate"
    }
});


module.exports = {
    BMsgRecipient: BMsgRecipient,
}