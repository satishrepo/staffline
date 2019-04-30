/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';


/**
 *  -------Define ProjectProfile model -------------
 */
const ProjectProfile = dbContext.define('ProjectProfile', {
    projectId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "ProjectId"
    },
    assignmentid: {
        type: Sequelize.STRING,
        field: "Assignmentid"
    },
    projectDuration: {
        type: Sequelize.STRING,
        field: "ProjectDuration"
    },
    projectDescription: {
        type: Sequelize.STRING,
        field: "ProjectDescription"
    },
    managerName: {
        type: Sequelize.STRING,
        field: "ManagerName"
    },
    managerTitle: {
        type: Sequelize.STRING,
        field: "ManagerTitle"
    },
    managerEmail: {
        type: Sequelize.STRING,
        field: "ManagerEmail"
    },
    managerOffPhone: {
        type: Sequelize.STRING,
        field: "ManagerOffPhone"
    },
    specialComments: {
        type: Sequelize.STRING,
        field: "SpecialComments"
    },
    createdBy: {
        type: Sequelize.STRING,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date",
        defaultValue: new Date()
    },
    modifiedBy: {
        type: Sequelize.STRING,
        field: "Modified_By"
    },
    modifiedDate: {
        type: Sequelize.DATE,
        field: "Modified_Date",
        defaultValue: new Date()
    },
    technologyId: {
        type: Sequelize.INTEGER,
        field: "Technology"
    },
    roleId: {
        type: Sequelize.INTEGER,
        field: "Role"
    },
    projectEndDate: {
        type: Sequelize.DATE,
        field: "ProjectEndDate"
    },
    projectEndReason: {
        type: Sequelize.INTEGER,
        field: "ProjectEndReason"
    },
    projectEndComments: {
        type: Sequelize.STRING,
        field: "ProjectEndComments"
    }


});

module.exports = {
    ProjectProfile: ProjectProfile
}

