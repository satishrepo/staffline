/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import HolidayController from '../../controllers/holidays/holidays-controller';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let holidayController=new HolidayController();

/**
 *  -------Declare all routes-------------
 */

let routerGetHolidaySchedule=router.route('/holidays/schedule');

/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetHolidaySchedule
    .get(holidayController.getHolidaySchedule.bind(holidayController));

module.exports=router;