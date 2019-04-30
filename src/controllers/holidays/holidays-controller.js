/**
 * -------Import all classes and packages -------------
 */
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import HolidayModel from '../../models/holidays/holidays-model';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    holidayModel = new HolidayModel();


class HolidayController {

    /**
    * Get Holiday Schedule of current year 
   * @param {*} req : HTTP request argument
   * @param {*} res : HTTP response argument
   * @param {*} next : Callback argument
   */

    getHolidaySchedule(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            msgCode = [];

        let date = new Date();
        let currentYear = date.getFullYear();
        holidayModel.getHolidayScheduleByCurrentYear(currentYear)
            .then((details) => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: details } });
                res.status(200).json(response);
            }).catch((error) => {
                let resp = commonMethods.catchError('holidays-controller/getHolidaySchedule', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
    }

}

module.exports = HolidayController;