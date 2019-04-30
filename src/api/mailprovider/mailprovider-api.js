/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import MailProviderController from '../../controllers/mailprovider/mailprovider-controller.js';

/**
 *  -------Initialize global variables-------------
 */
let app = express();
let router = express.Router();
let mailproviderController = new MailProviderController();

// routes 

router.post('/mailprovider/sgcallback', mailproviderController.saveResponse.bind(mailproviderController));


module.exports = router;

