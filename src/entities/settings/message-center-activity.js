/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define MessageCenterActivity model -------------
 */
const MessageCenterActivity = dbContext.define('MessageCenterActivity', {
    messageCenterActivityId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "MessageCenterActivity_Id"
    },    
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },
    messageId: {
        type: Sequelize.INTEGER,
        field: "Message_Id"
    },    
    isRead: {
        type: Sequelize.INTEGER,
        field: "IsRead"
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
    isRecipient: {
        type: Sequelize.INTEGER,
        field: "IsRecipient"
    }
});

module.exports = {
    MessageCenterActivity: MessageCenterActivity,
}