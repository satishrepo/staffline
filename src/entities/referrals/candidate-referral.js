/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define CandidateReferral model -------------
 */
const CandidateReferral = dbContext.define('CandidateReferral', {
    referralId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field : "Referral_Id"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },       
    resumeId: {
        type: Sequelize.INTEGER,
        field: "Resume_Id"
    },  
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_date"
    }
});


module.exports = {
    CandidateReferral: CandidateReferral,
}