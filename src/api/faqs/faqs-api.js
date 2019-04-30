/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import FaqController from '../../controllers/faqs/faqs-controller';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let faqsController=new FaqController();

/**
 *  -------Declare all routes-------------
 */
let routerGetFaqsLookupData=router.route('/faqs/lookupdata');
let routerGetFaqs=router.route('/faqs');

/**
 *  ------ Bind all routes with related controller method-------------
 */

routerGetFaqsLookupData
    .get(faqsController.getFaqsLookupData.bind(faqsController));

routerGetFaqs
    .post(faqsController.getFaqs.bind(faqsController));

module.exports=router;
