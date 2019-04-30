/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Candidate_SME_Availability model -------------
 */
const CandidateSMEAvailability = dbContext.define('Candidate_SME_Availability', {
    smeAvailabilityId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "CandidateSMEAvailability_Id"
    },
    resumeId: {
        type: Sequelize.INTEGER,       
        field: "Resume_Id"
    },
    jobResumeId: {
        type: Sequelize.INTEGER,
        field: "Job_Resume_Id"
    },
    weekDay: {
        type: Sequelize.INTEGER,
        field: "WeekDay"      
    },
    fromTime: {
        type: Sequelize.INTEGER,
        field: "FromTime"      
    },
    toTime: {
        type: Sequelize.INTEGER,
        field: 'ToTime'
    },
    availableDate: {
        type: Sequelize.DATE,
        field: 'AvlDate'
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
    CandidateSMEAvailability: CandidateSMEAvailability,
}