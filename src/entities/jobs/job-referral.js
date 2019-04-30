/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobReferral model -------------
 */
const JobReferral = dbContext.define('JobReferral', {
    jobReferralId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field : "JobReferral_Id"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },
    jobId: {
        type: Sequelize.INTEGER,
        field: "Job_Id"
    },
    resumeId: {
        type: Sequelize.INTEGER,
        field: "Resume_Id"
    },    
    jobResumeId: {
        type: Sequelize.INTEGER,
        field: "Job_Resume_Id"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_date"
    },
    referrerResumeId: {
        type: Sequelize.INTEGER,
        field: "Referrer_ResumeId"
    },
    referralResumeId: {
        type: Sequelize.INTEGER,
        field: "Referral_ResumeId"
    },
    candidateEmail: {
        type: Sequelize.STRING(250),
        field: "CandidateEmail"
    },
    candidateName: {
        type: Sequelize.STRING(250),
        field: "CandidateName"
    },
    candidateRelation: {
        type: Sequelize.INTEGER,
        field: "CandidateRelationship"
    },
    candidateRequirement: {
        type: Sequelize.INTEGER,
        field: "CandidateRequirement"
    },
    candidateKnowReferrer: {
        type: Sequelize.INTEGER,
        field: "CandidateKnowsReferrer"
    },
    applicableBonus: {
        type: Sequelize.DECIMAL(10,2),
        field: "ReferrerBonus"
    },
    referrerBonusPaid: {
        type: Sequelize.INTEGER,
        field: "ReferrerBonusPaid"
    },
    referrerBonusPaidDate: {
        type: Sequelize.DATE,
        field: "ReferrerBonusPaidDate"
    },
    referrerComments: {
        type: Sequelize.STRING,
        field: "ReferrerComments"
    },
    candidateComments: {
        type: Sequelize.STRING,
        field: "CandidateComments"
    },
    status: {
        type: Sequelize.INTEGER,
        field: "Status"
    },
    modifiedDate: {
        type: Sequelize.DATE,
        field: "Modified_Date"
    },
    isSocialShare: {
        type: Sequelize.INTEGER,
        field: "isSocialShare"
    },
    // applicableBonus: {
    //     type: Sequelize.DECIMAL(10,2),
    //     field: "ApplicableBonus"
    // },

    
    

    
});


module.exports = {
    JobReferral: JobReferral,
}