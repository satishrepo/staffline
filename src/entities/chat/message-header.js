/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobSearchAlert model -------------
 */
const messageHeader = dbContext.define('IM_MessageHeader', {
    chatId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "MessageHeader_Id"
    },
    startedOn: {
        type: Sequelize.DATE,
        field: "StartDate",
        defaultValue: new Date()
    },
    ownerType: {
        type: Sequelize.INTEGER,
        field: "OwnerType"
    },
    ownerId: {
        type: Sequelize.INTEGER,
        field: "ChatInitiatedBy"
    },
    title: {
        type: Sequelize.STRING,
        field: "Title"
    },
    groupId: {
        type: Sequelize.INTEGER,
        field: "SupportGroupId"
    },
    refId: {
        type: Sequelize.INTEGER,
        field: "RefId"
    },
    severity: {
        type: Sequelize.INTEGER,
        field: "severity"
    },
    issueType: {
        type: Sequelize.INTEGER,
        field: "MessageSupportIssue_id"
    },
    isComplete: {
        type: Sequelize.INTEGER,
        field: "IsComplete",
        default: 0
    },
    
});

module.exports = {
    messageHeader: messageHeader
}