/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import FormsController from '../../controllers/forms/forms-controller';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let formsController=new FormsController();

/**
 *  -------Declare all routes-------------
 */

let routerGetForms=router.route('/forms');

/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetForms
    .post(formsController.getForms.bind(formsController));

module.exports=router;