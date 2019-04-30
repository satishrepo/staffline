/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import SupportController from '../../controllers/support/support-controller-v2';

/**
 * -------Initialize global variables-------------
 */
let app = express();
let router = express.Router();
let supportController = new SupportController();

/**
 *  -------Declare all routes-------------
 */

router.get('/support-contacts', supportController.getContacts);
router.post('/reportabug', supportController.reportABug);
router.get('/apilist', supportController.apiList);



module.exports=router;