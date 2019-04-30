/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define ATS_JobActivity model -------------
 */
const ATS_JobActivity = dbContext.define('ATS_JobActivity', {
    jobactivityId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "Job_ActivityId"
    },
    clientJobId: {
        type: Sequelize.INTEGER,
        field: "Client_JobId"
    },
    jrResumeId: {
        type: Sequelize.INTEGER,
        field: "JR_ResumeId"
    },
    candidateId: {
        type: Sequelize.INTEGER,
        field: "Candidate_Id"
    },
    interviewId: {
        type: Sequelize.INTEGER,
        field: "Interview_Id"
    },
    activityLog: {
        type: Sequelize.STRING,
        field: "Activity_Log"
    },
    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdOn: {
        type: Sequelize.DATE,
        field: "Created_On"
    },
    hotlistId: {
        type: Sequelize.INTEGER,
        field: "Hotlist_Id"
    },
    dataComeFrom: {
        type: Sequelize.INTEGER,
        field: "DataComeFrom"
    },
    jobResumeId: {
        type: Sequelize.INTEGER,
        field: "Job_Resume_Id"
    },
    activityType: {
        type: Sequelize.INTEGER,
        field: "ActivityType"
    },


});


module.exports = {
    ATS_JobActivity: ATS_JobActivity,
}