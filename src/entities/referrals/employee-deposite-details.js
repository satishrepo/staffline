/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define EmployeeDepositeDetails model -------------
 */
const EmployeeDepositeDetails = dbContext.define('EmployeeDepositeDetails', {
    employeeDepositeDetailsID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field : "EmployeeDepositeDetailsID"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetetails_ID"
    },
    bankName: {
        type: Sequelize.STRING,
        field: "Bank_Name"
    },
    bankAddress: {
        type: Sequelize.STRING,
        field: "Bank_Address"
    },
    abaNumber: {
        type: Sequelize.STRING,
        field: "ABA_Number"
    },
    accountNumber: {
        type: Sequelize.STRING,
        field: "Account_number"
    },
    accountTypeId: {
        type: Sequelize.INTEGER,
        field: "Account_Type"
    },
    chequeAttachmentName: {
        type: Sequelize.STRING,
        field: "ChequeAttachmentName"
    },
    chequeUploadAttachmentName: {
        type: Sequelize.STRING,
        field: "ChequeUploadAttachmentName"
    },
    paymentUserId: {
        type: Sequelize.STRING,
        field: "PaymentUserId"
    },
    
});


module.exports = {
    EmployeeDepositeDetails: EmployeeDepositeDetails,
}