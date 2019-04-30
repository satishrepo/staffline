/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define UserSession model -------------
 */
const Invoice_TimesheetEntrySummary = dbContext.define('Invoice_TimesheetEntrySummary', {
    TSEntery_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },    
    EmployeeID: {
        type: Sequelize.INTEGER
    },
    TimesheetCycleId: {
        type: Sequelize.INTEGER
    },
    WeekNumber: {
        type: Sequelize.INTEGER
    },
    FromDate: {
        type: Sequelize.DATE        
    },   
    ToDate: {
        type: Sequelize.DATE
     },   
    BillingCycleID: {
        type: Sequelize.INTEGER
     }, 
    EmployeeType: {
        type: Sequelize.INTEGER
    },  

    RegHrs: {
        type: Sequelize.DECIMAL(5,2)
    }, 
    OTHrs: {
        type: Sequelize.DECIMAL(5,2)
    },
    OT2Hrs: {
        type: Sequelize.DECIMAL(5,2)
    }, 
    TotalHrs: {
        type: Sequelize.DECIMAL(5,2)
    }, 

    WeekEnd_Date: {
        type: Sequelize.DATEONLY
    },
    SpecialComments: {
        type: Sequelize.TEXT(5000)
    },
    SummaryComments: {
        type: Sequelize.TEXT(5000)
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
    ProjectDetailId: {
        type: Sequelize.INTEGER
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
    InsertedSP_Name: {
        type: Sequelize.STRING,
        defaultValue: "Staffline-API-ORM"
    }

});


module.exports = {
    Invoice_TimesheetEntrySummary: Invoice_TimesheetEntrySummary,
}