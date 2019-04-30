/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define UserSession model -------------
 */
const Invoice_TimesheetEntryDetails = dbContext.define('Invoice_TimesheetEntryDetails', {
    TSEnteryDetail_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    TSEntery_ID: {
        type: Sequelize.INTEGER
    },
    EmployeeID: {
        type: Sequelize.INTEGER
    },
    ProjectID: {
        type: Sequelize.INTEGER
    },
    EntryDate: {
        type: Sequelize.DATEONLY
    },
    RegHrs: {
        type: Sequelize.DECIMAL(5,2)
    },   
    OT1Hrs: {
        type: Sequelize.DECIMAL(5,2)
    }, 
    OT2Hrs: {
        type: Sequelize.DECIMAL(5,2)
    },    
    TotalHrs: {
        type: Sequelize.DECIMAL(5,2)
    },   
    TSEntryStatus: {
        type: Sequelize.INTEGER
    },   
    Created_Date: {
        type: Sequelize.DATE
    },
    Created_By: {
        type: Sequelize.INTEGER
    },
    IsDeleted: {
        type: Sequelize.INTEGER
    },
    RowGUIID: {
        type: 'UNIQUEIDENTIFIER',
        allowNull: false,
        defaultValue: Sequelize.UUIDV1,
    },

    InsertFromPage: {
        type: Sequelize.INTEGER,
        defaultValue : 1
    },
    Modified_Date: {
        type: Sequelize.DATE
    },
    Modified_By: {
        type: Sequelize.INTEGER
    },
    ModifiedFromPage: {
        type: Sequelize.INTEGER
    },

    EarlyTSEntry: {
        type: Sequelize.INTEGER
    },
    OnlineTimesheetApproval: {
        type: Sequelize.INTEGER
    },     
     
});


module.exports = {
    Invoice_TimesheetEntryDetails: Invoice_TimesheetEntryDetails,
}