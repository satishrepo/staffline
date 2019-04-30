/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define NotificationCenter model -------------
 */
const NotificationCenter = dbContext.define('NotificationCenter', {
    messageId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "Message_Id"
    },
    userId: {
        type: Sequelize.INTEGER,
        field: "User_Id"
    },
    subject: {
        type: Sequelize.STRING,
        field: "Subject"       
    },
    messageBody: {
        type: Sequelize.STRING,
        field: 'MessageBody'        
    },
    messageType: {
        type: Sequelize.INTEGER,
        field: 'MessageType'        
    },
    typeRefId: {
        type: Sequelize.INTEGER,
        field: 'TypeRef_Id',
    },
    isRead: {
        type: Sequelize.INTEGER,
        field: "isRead"
    },
    isFlag: {
        type: Sequelize.INTEGER,
        field: "IsFlag"
    },
    isPriority: {
        type: Sequelize.INTEGER,
        field: "IsPriority"
    },
    isArchive: {
        type: Sequelize.INTEGER,
        field: "IsArchive"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    }

});

module.exports = {
    NotificationCenter: NotificationCenter,
}