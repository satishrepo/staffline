/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define ClientJobMaster model -------------
 */
const CandidateContact = dbContext.define('CandidateContact', {
    CandidateContactId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "CandidateContact_Id"
    },
    candidateResumeId: {
        type: Sequelize.INTEGER,
        field: "CandidateResume_Id"
    },
    contactName: {
        type: Sequelize.STRING,
        field: "ContactName"
    },
    contactEmail: {
        type: Sequelize.STRING,
        field: "ContactEmail"
    },
    invitationDate: {
        type: Sequelize.DATE,
        field: "InvitationDate"
    },
    status: {
        type: Sequelize.INTEGER,
        field: "Status"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date"
    },
    isSocialShare: {
        type: Sequelize.INTEGER,
        field: "IsSocialShare"
    },
    jobId: {
        type: Sequelize.INTEGER,
        field: "CJM_JOB_ID"
    },
    applicableBonus: {
        type: Sequelize.INTEGER,
        field: "ApplicableBonus"
    },

});


module.exports = {
    CandidateContact: CandidateContact,
}