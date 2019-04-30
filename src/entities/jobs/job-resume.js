/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JOB_RESUME model -------------
 */
const JobResume = dbContext.define('JOB_RESUME', {
    jobResumeId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field : "Job_Resume_Id"
    },
    cjmJobId: {
        type: Sequelize.INTEGER,
        field: "CJM_JOB_ID"
    },    
    jrResumeId: {
        type: Sequelize.INTEGER,
        field: "JR_RESUME_ID"
    },
    applicantName: {
        type: Sequelize.STRING,
        field: "APPLICANT_NAME"
    },    
    phone: {
        type: Sequelize.STRING,
        field: "Phone"
    },    
    email: {
        type: Sequelize.STRING,
        field: "Email"
    }, 
    candidateResumeId : {
        type: Sequelize.INTEGER,
        field: "CandidateResume_Id"
    },
    jrUpdatedOn: {
        type: Sequelize.DATE,
        field: "JR_UPDATED_ON"
    },
    jrStatusId: {
        type: Sequelize.INTEGER,
        field: "JR_STATUS_ID"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id_PostedBy"
    },
    recruiterId: {
        type: Sequelize.INTEGER,
        field: "RecruiterId"
    },
    placementTrackerId: {
        type: Sequelize.INTEGER,
        field: "placementTracker_id"
    },
    insertedSPName: {
        type: Sequelize.STRING,
        field: "InsertedSP_Name",
        defaultValue: 'StaffLine-API-ORM'
    },
    companyMasterId:{
        type: Sequelize.INTEGER,
        field: "CompanyMaster_Id"
    }    
    
    
    

    
});


module.exports = {
    JobResume: JobResume,
}