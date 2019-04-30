/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobSearchAlert model -------------
 */
const messageSupportIssueType = dbContext.define('IM_MessageSupportIssueType', {
    supportId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "MessageSupportIssue_Id"
    },
    issueName: {
        type: Sequelize.STRING,
        field: "SupportGroupIssueType_Name"
    },
    description: {
        type: Sequelize.STRING,
        field: "Description"
    },    
    parentId: {
        type: Sequelize.INTEGER,
        field: "ParentMessageSupportIssue_Id"
    },
    responseTime: {
        type: Sequelize.INTEGER,
        field: "Level1_ResponseTimeInHours"
    },
    responsiblePerson: {
        type: Sequelize.INTEGER,
        field: "Level1_ResponsiblePerson"
    }
});

module.exports = {
    messageSupportIssueType: messageSupportIssueType
}