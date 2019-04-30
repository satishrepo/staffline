/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define ReferralClient model -------------
 */
const ReferralClient = dbContext.define('Referral_Client', {
    referralClientId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field : "ReferralClientId"
    },
    referrerId: {
        type: Sequelize.INTEGER,
        field: "Referrer_EmployeeDetails_Id"
    },
    companyName: {
        type: Sequelize.STRING,
        field: "CompanyName"
    },
    jobPosition: {
        type: Sequelize.STRING,
        field: "ClientJobPosition"
    },
    address: {
        type: Sequelize.STRING,
        field: "ClientAddress"
    },
    countryId: {
        type: Sequelize.INTEGER,
        field: "ClientCountryId"
    },       
    stateId: {
        type: Sequelize.INTEGER,
        field: "ClientStateId"
    },
    cityId: {
        type: Sequelize.INTEGER,
        field: "ClientCityId"
    },
    contactName: {
        type: Sequelize.STRING,
        field: "Contact_Name"
    },
    contactJobTitle: {
        type: Sequelize.STRING,
        field: "Contact_JobTitle"
    },
    contactEmailId: {
        type: Sequelize.STRING,
        field: "Contact_EmailId"
    },
    contactPhone: {
        type: Sequelize.STRING,
        field: "Contact_Phone"
    },
    status: {
        type: Sequelize.INTEGER,
        field: "Status"
    },
    customerProfileId: {
        type: Sequelize.INTEGER,
        field: "CustomerProfile_Id"
    },
    actionBy: {
        type: Sequelize.INTEGER,
        field: "Action_By"
    },
    actionDate: {
        type: Sequelize.DATE,
        field: "Action_Date"
    },
    comment: {
        type: Sequelize.STRING,
        field: "comments"
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
    ReferralClient: ReferralClient,
}