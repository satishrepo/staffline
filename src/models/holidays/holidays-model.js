/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from "../../core/db";
import configContainer from "../../config/localhost";
import logger from "../../core/logger";
import { HolidayMaster } from '../../entities/holidays/holidays';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class HolidayModel {

    constructor() {
        //
    }

    getHolidayScheduleByCurrentYear(currentYear) {
        let query = "SELECT HOLIDAY_ID AS holidayId,HOLIDAY_DATE AS holidayDate, DATENAME(weekday, HOLIDAY_DATE) AS holidayDay,HOLIDAY_DETAIL AS holidayDetail FROM Holiday_Master WHERE YEAR(HOLIDAY_DATE)=YEAR(GETDATE()) ORDER BY HOLIDAY_DATE ASC";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    }
}