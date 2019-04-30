/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define JobSearchAlert model -------------
 */
const mailTemplateReqestDataTemp = dbContext.define('MailTemplateReqestDataTemp', {

    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id"
    },
    mailTemplateCode: {
        type: Sequelize.STRING,
        field: "MailTemplateCode"
    },
    requestData: {
        type: Sequelize.STRING,
        field: "RequestData"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetailsId"
    },
    mailServiceProviderMessageId: {
        type: Sequelize.INTEGER,
        field: "MailServiceProviderMessageId"
    },
    companyMaster_Id: {
        type: Sequelize.INTEGER,
        field: "CompanyMaster_Id"
    },
    mailProviderJson: {
        type: Sequelize.STRING,
        field: "MailProviderJson"
    },
    isHardBounce: {
        type: Sequelize.BOOLEAN,
        field: "IsHardBounce"
    },
    createddate: {
        type: Sequelize.DATE,
        field: "createddate",
        defaultValue: new Date()
    },
    
});

module.exports = {
    mailTemplateReqestDataTemp: mailTemplateReqestDataTemp
}