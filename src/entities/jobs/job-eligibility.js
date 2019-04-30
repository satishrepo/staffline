/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define ClientJobMaster model -------------
 */
const jobEligibility = dbContext.define('Job_Eligibility', {
    jobEligibilityId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "JobEligibility_Id"
    },
    jobId: {
        type: Sequelize.INTEGER,
        field: "Job_Id"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },
    isEligible: {
        type: Sequelize.INTEGER,
        field: "isEligible"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },

});


module.exports = {
    jobEligibility: jobEligibility
}