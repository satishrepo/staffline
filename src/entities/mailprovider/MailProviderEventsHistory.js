/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobSearchAlert model -------------
 */
const mailProviderEventsHistory = dbContext.define('MailProviderEventsHistory', {
    
    historyId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "MailProviderEventsHistory_Id"
    },
    messageId: {
        type: Sequelize.INTEGER,
        field: "MailServiceProviderMessageId"
    },
    eventType: {
        type: Sequelize.STRING,
        field: "MailServiceProviderEventType"
    },
    rawResponse: {
        type: Sequelize.STRING,
        field: "MailServiceProviderRawResponse"
    },
    createdOn: {
        type: Sequelize.DATE,
        field: "CreatedOn",
        defaultValue: new Date()
    }
    
});

module.exports = {
    mailProviderEventsHistory: mailProviderEventsHistory
}