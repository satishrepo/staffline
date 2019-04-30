/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobSearchAlert model -------------
 */
const messageDetails = dbContext.define('IM_MessageDetails', {
    messageId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "MessageDetails_Id"
    },
    chatId: {
        type: Sequelize.INTEGER,
        field: "MessageHeader_Id"
    },
    isForwardedMessage: {
        type: Sequelize.BOOLEAN,
        field: "IsForwardedMessage"
    },
    postedBy: {
        type: Sequelize.INTEGER,
        field: "postedBy"
    },    
    posterType: {
        type: Sequelize.INTEGER,
        field: "posterType"
    },
    messageBody: {
        type: Sequelize.STRING,
        field: "MessageBody"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    },
    ip: {
        type: Sequelize.STRING,
        field: "UserIp"
    },
    
});

module.exports = {
    messageDetails: messageDetails
}