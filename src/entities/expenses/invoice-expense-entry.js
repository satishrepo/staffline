/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Invoice_UploadedClientTimeSheets model -------------
 */
const InvoiceExpenseEntry = dbContext.define('Invoice_ExpenseEntry', {
    expenseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "Expense_Id"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },
    projectDetailId: {
        type: Sequelize.INTEGER,
        field: "ProjectDetail_Id"
    },
    expenseFromDate: {
        type: Sequelize.DATE,
        field: "ExpenseFromDate"
    },
    expenseToDate: {
        type: Sequelize.DATE,
        field: "ExpenseToDate"
    },
    billTo: {
        type: Sequelize.INTEGER,
        field: "BillTo"
    },
    expenseAmount: {
        type: Sequelize.DECIMAL(10, 2),
        field: "ExpenseAmount"
    },
    rejectReason: {
        type: Sequelize.STRING(300),
        field: "RejectReason"
    },
    documentExpenseName: {
        type: Sequelize.STRING(200),
        field: "DocumentExpenseName"
    },
    documentExpenseLocation: {
        type: Sequelize.STRING(200),
        field: "DocumentExpenseLocation"
    },
    originalFileName :{
        type: Sequelize.STRING(500),
        field: "OriginalFileName"
    },
    expenseDescription: {
        type: Sequelize.STRING(500),
        field: "ExpenseDescription"
    },
    status: {
        type: Sequelize.INTEGER,
        field: "Status",
        defaultValue: 3601 //Pending
    },
    approvedReason: {
        type: Sequelize.STRING(300),
        field: "ApprovedReason"
    },
    createdBy: {
        type: Sequelize.STRING(20),
        field: "Created_By"
    },
    createdDate: {
        type: Sequelize.DATE,
        field: "Created_Date",
        defaultValue: new Date()
    },

});

module.exports = {
    InvoiceExpenseEntry: InvoiceExpenseEntry
}