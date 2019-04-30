/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define LegalRequest model -------------
 */
const LegalRequest = dbContext.define('LegalRequest', {
    legalAppId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field:"LEGALAPPID"
    },
    APPLICANTID: {
        type: Sequelize.INTEGER
    },
    APP_FOR: {
        type: Sequelize.STRING
    },
    APP_TYPE: {
        type: Sequelize.STRING
    },
    APP_PRIORITY: {
        type: Sequelize.STRING
    },
    APP_STATUS: {
        type: Sequelize.STRING
    },
    APP_EACNUM: {
        type: Sequelize.STRING
    },
    APP_COMMENT: {
        type: Sequelize.STRING
    },
    APP_EMAIL: {
        type: Sequelize.INTEGER
    },
    HOME_PHONE: {
        type: Sequelize.STRING
    },
    CURRENT_STATUS: {
        type: Sequelize.STRING
    },
    EmployeeDetail_id: {
        type: Sequelize.INTEGER
    },
    SkillCategoryId: {
        type: Sequelize.INTEGER
    },
    INACTIVE: {
        type: Sequelize.STRING
    },
    Created_By: {
        type: Sequelize.INTEGER
    },
    CreatedDate: {
        type: Sequelize.DATE
    },
    Modified_By: {
        type: Sequelize.INTEGER
    },
    ModifiedDate: {
        type: Sequelize.DATE
    },
    EmployeeDetailsId_LegalRep: {
        type: Sequelize.INTEGER
    },
    EmployeeDetailsId_Recruiter: {
        type: Sequelize.INTEGER
    },
    FIRSTNAME : {
        type: Sequelize.STRING
    },
    LASTNAME : {
        type : Sequelize.STRING
    }
});

module.exports = {
    LegalRequest: LegalRequest,
}