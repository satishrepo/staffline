/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import ContactUsController from '../../controllers/contactUs/contact-us-controller';

/**
 *  -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let contactUsController = new ContactUsController();

/**
 *  -------Declare all routes-------------
 */
let routerPostContactUs = router.route('/contactus');

/**
 *  ------ Bind all routes with related controller method-------------
 */

routerPostContactUs
    .post(contactUsController.postContactUs.bind(contactUsController));

module.exports = router;

