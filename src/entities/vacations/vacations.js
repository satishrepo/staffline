/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Country_Master model -------------
 */
const VacationRequests = dbContext.define('VacationRequests', {
    FromDate: {
        type: Sequelize.DATE,
        primaryKey: true,
        autoIncrement: false
    },
    ToDate: {
        type: Sequelize.DATE
    },
    Reason: {
        type: Sequelize.STRING
    },
    APPROVE_REJECT_COMMENTS: {
        type: Sequelize.STRING
    },
    ContactInfo: {
        type: Sequelize.STRING
    },

    JoinSameClient: {
        type: Sequelize.BOOLEAN
    },
    CREATED_BY: {
        type: Sequelize.STRING
    },
    CREATED_DATE: {
        type: Sequelize.DATE
    },
    MODIFIED_BY: {
        type: Sequelize.STRING
    },
    MODIFIED_DATE: {
        type: Sequelize.DATE
    }
});

module.exports = {
    VacationRequests: VacationRequests
}