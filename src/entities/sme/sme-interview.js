/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define SME_Interview model -------------
 */
const SMEInterview = dbContext.define('SME_Interview', {
    smeInterviewId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "SMEInterview_Id"
    },
    intervieweeResumeId: {
        type: Sequelize.INTEGER,       
        field: "IntervieweeResume_Id"
    },
    interviewerResumeId: {
        type: Sequelize.INTEGER,       
        field: "InterviewerResume_Id"
    },
    jobResumeId: {
        type: Sequelize.INTEGER,
        field: "Job_Resume_Id"
    },
    interviewTitle: {
        type: Sequelize.STRING,
        field: "Interview_Title"
    },
    interviewType: {
        type: Sequelize.STRING,
        field: "Interview_Type"
    },
    interviewDate: {
        type: Sequelize.DATE,
        field: "Interview_Date"
    },
    interviewWeekDay: {
        type: Sequelize.INTEGER,
        field: "Interview_WeekDay"      
    },
    interviewFrom: {
        type: Sequelize.INTEGER,
        field: "Interview_From"      
    },
    interviewTo: {
        type: Sequelize.INTEGER,
        field: 'Interview_To'
    },
    interviewInstructions: {
        type: Sequelize.TEXT,
        field: 'Interview_Instructions'
    },
    interviewFeedback: {
        type: Sequelize.STRING,
        field: 'Interview_Feedback'
    },
    isRecommended: {
        type: Sequelize.INTEGER,
        field: 'isRecommended'
    },
    interviewStatus: {
        type: Sequelize.INTEGER,
        field: 'Interview_Status'
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
    SMEInterview: SMEInterview,
}