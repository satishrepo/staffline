/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define ProjectDetails model -------------
 */
const ProjectDetails = dbContext.define('ProjectDetails', {
    projectDetailId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "ProjectDetail_Id"
    },
    projectId: {
        type: Sequelize.STRING,
        field: "Project_Id",
        readonly: true
    },
    projectName: {
        type: Sequelize.STRING,
        field: "Project_Description",
        readonly: true
    },
    customerId: {
        type: Sequelize.STRING,
        field: "Customer_Id",
        readonly: true
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "Employee_Id"
    },
    startDate: {
        type: Sequelize.DATE,
        field: "Start_Date"
    },
    endDate: {
        type: Sequelize.DATE,
        field: "End_Date"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date",
        defaultValue: new Date()
    },
    createdBy: {
        type: Sequelize.STRING,
        field: "Created_By"
    },
    modifiedDate: {
        type: Sequelize.DATE,
        field: "Modified_Date",
        defaultValue: new Date()
    },
    modifiedBy: {
        type: Sequelize.STRING,
        field: "Modified_By"
    }
});

module.exports = {
    ProjectDetails: ProjectDetails
}