/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import HrController from '../../controllers/hr/hr-controller';

/**
 *  -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let hrController = new HrController();

/**
 *  -------Declare all routes-------------
 */
let routerGetAboutHr = router.route('/hr/abouthr');

let routerGetErrorResponse = router.route('/test/error');


/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetAboutHr
    .get(hrController.getAboutHr.bind(hrController));

routerGetErrorResponse
    .get(hrController.getErrorResponse.bind(hrController));

module.exports = router;