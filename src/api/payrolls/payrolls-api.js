/* -------Import all classes and packages -------------*/
import express from 'express';
import PayrollsController from '../../controllers/payrolls/payrolls-controller';

/* -------Initialize global variabls-------------*/
let app = express();
let router = express.Router();
let payrollsController = new PayrollsController();

/* -------Declare all routes-------------*/
let routerGetPayrollsInfo = router.route('/payrolls/info');
let routerGetPayrollsCalender = router.route('/payrolls/calendar/:payrollCalenderType');

/* ------ Bind all routes with related controller method-------------*/
routerGetPayrollsInfo
    .get(payrollsController.getPayrollsInfo.bind(payrollsController));

routerGetPayrollsCalender
    .get(payrollsController.getPayrollsCalender.bind(payrollsController));

module.exports = router;