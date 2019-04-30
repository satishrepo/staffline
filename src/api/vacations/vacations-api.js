/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import VacationsController from '../../controllers/vacations/vacations-controller.js';
import DemoController from '../../controllers/demo/demo-controller.js';

/**
 *  -------Initialize global variables-------------
 */
let app = express();
let router = express.Router();
let vacationsController = new VacationsController(),
    demoController=new DemoController();

/**
 *  -------Declare all routes-------------
 */
let routerGetVacationsRequest = router.route('/vacations');
let routerPostVacationsRequest =router.route('/vacations');
// test API
let routerPostEditDemoRequest= router.route('/demo');

/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetVacationsRequest
    .get(vacationsController.getVacationsRequest.bind(vacationsController));

routerPostVacationsRequest
    .post(vacationsController.postAddVacations.bind(vacationsController));

// for test
routerPostEditDemoRequest
    .post(demoController.editDemo.bind(demoController));


module.exports = router;
