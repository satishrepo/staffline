/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Resume_Master model -------------
 */
const ResumeMaster = dbContext.define('Resume_Master', {
    resumeId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field : "Resume_Id"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "FromEmployeeDetails_Id"
    },

    firstName: {
        type: Sequelize.STRING,
        field: "First_Name"
    },
    lastName: {
        type: Sequelize.STRING,
        field: "Last_Name"
    },
    emailId: {
        type: Sequelize.STRING,
        field: "Email_Id"
    },
    // phone: {
    //     type: Sequelize.STRING,
    //     field: "Phone"
    // },
    contactNumber: {
        type: Sequelize.STRING,
        field: "Phone"
    },
    resumeFile: {
        type: Sequelize.STRING,
        field: "Resume_File"
    },
    
    totalExp: {
        type: Sequelize.STRING,
        field: "Total_Exp"
    },
    totalUsExp: {
        type: Sequelize.INTEGER,
        field: "TotalUSExp"
    },
    linkedIn: {
        type: Sequelize.STRING,
        field: "LinkedIn"
    },
    facebook: {
        type: Sequelize.STRING,
        field: "Facebook"
    },
    twitter: {
        type: Sequelize.STRING,
        field: "Twitter"
    },
    googlePlus: {
        type: Sequelize.STRING,
        field: "GooglePlus"
    },
    // careerProfile: {
    //     type: Sequelize.STRING,
    //     field: "Comments"
    // },
    careerProfile: {
        type: Sequelize.TEXT,
        field: "IndustyExp"
    },
    // jobSearchStatus: {
    //     type: Sequelize.INTEGER,
    //     field: "JobSearchStatus"
    // },
    modifiedBy: {
        type: Sequelize.INTEGER,
        field: "Modified_By"
    },
    modifiedOn: {
        type: Sequelize.DATE,
        field: "Modified_On"
    },

    createdBy: {
        type: Sequelize.INTEGER,
        field: "Created_By"
    },
    createdOn: {
        type: Sequelize.DATE,
        field: "Created_On"
    },

    availabilityId: {
        type: Sequelize.STRING,
        field: "Availability"
    },
    jobSearchStatusId: {
        type: Sequelize.INTEGER,
        field: "JobSearchStatus",
        allowNull : true
    },
    annualSalary: {
        type: Sequelize.DECIMAL,
        field: "Annual_Salary"
    },
    interestedSme: {
        type: Sequelize.INTEGER,
        field: "InterestedSME"
    },
    interestedCounsellor: {
        type: Sequelize.INTEGER,
        field: "InterestedCounsellor"
    },
    prefferedCity: {
        type: Sequelize.STRING,
        field: "PrefferedCity"
    },
    contractRate: {
        type: Sequelize.STRING,
        field: "Rate"
    },
    contractRateTypeId: {
        type: Sequelize.STRING,
        field: "RateType",
        allowNull: null
    },
    publicProfile: {
        type: Sequelize.STRING,
        field: "PublicProfile"
    },
    desiredEmployementKey: {
        type: Sequelize.STRING,
        field: "Assignment_Type"
    },
    industryVerticalId: {
        type: Sequelize.INTEGER,
        field: "IndustryVertical"
     },
    countryId: {
        type: Sequelize.INTEGER,
        field: "Country_Id"
    },
    stateId: {
        type: Sequelize.INTEGER,
        field: "State_Id"
    },
    cityId: {
        type: Sequelize.INTEGER,
        field: "City_Id"
    },
    currentLocation: {
        type: Sequelize.STRING(500),
        field: "Address1"
    },
    employeeReferrerId: {
        type: Sequelize.INTEGER,
        field: "EmployeeReferreal_Id"
    },
    checkConfirm: {
        type: Sequelize.INTEGER,
        field: "CheckConfirm"
    },
    openToRelocate: {
        type: Sequelize.INTEGER,
        field: "Relocation"
    },
    status: {
        type: Sequelize.INTEGER,
        field: "status"
    },
    recruiter: {
        type: Sequelize.INTEGER,
        field: "RecruiterId"
    },
    authorisationStatusId: {
        type: Sequelize.STRING,
        field: "Work_Status",
        allowNull: true
    },
    currentJobTitle: {
        type: Sequelize.TEXT,
        field: "Resume_title"
    },
    availableDate: {
        type: Sequelize.DATE,
        field: "AvailableDate"
    },
    skillSummary: {
        type: Sequelize.TEXT,
        field: "Skill_Summary"
    },
    domainId: {
        type: Sequelize.INTEGER,
        field: "CandidateDomainType"
    },
    pastSmeInterviews: {
        type: Sequelize.INTEGER,
        field: "PastSMEInterviews"
    },
    smeStatusId: {
        type: Sequelize.INTEGER,
        field: "SME_Status"
    },
    companyMasterId:{
        type: Sequelize.INTEGER,
        field: "CompanyMaster_Id"
    }

},{
    hasTrigger : true
});


module.exports = {
    ResumeMaster: ResumeMaster,
}