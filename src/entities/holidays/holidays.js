/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define FAQMaster model -------------
 */

const HolidayMaster = dbContext.define('HOLIDAY_MASTER', {
    HOLIDAY_ID: {
        type: Sequelize.INTEGER
    },
    HOLIDAY_DATE: {
        type: Sequelize.DATE
    },
    HOLIDAY_DETAIL : {
        type:Sequelize.STRING
    }
});

module.exports={
    HolidayMaster :HolidayMaster
};