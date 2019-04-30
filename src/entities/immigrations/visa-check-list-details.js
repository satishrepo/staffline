/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define VISACHECKLISTDETAILS model -------------
 */
const VisaCheckListDetails = dbContext.define('VISACHECKLISTDETAILS', {
    CHECKLISTID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    LEGALAPPID: {
        type: Sequelize.INTEGER
    },
    DOCUMENTID: {
        type: Sequelize.INTEGER
    },
    STATUS: {
        type: Sequelize.INTEGER
    },  
    CREATED_BY: {
        type: Sequelize.STRING
    },
    CREATED_DATE: {
        type: Sequelize.DATE
    },
    REMARKS: {
        type: Sequelize.STRING
    },
    LEGALDOCID: {
        type: Sequelize.INTEGER
    }
});

module.exports = {
    VisaCheckListDetails: VisaCheckListDetails,
}