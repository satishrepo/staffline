/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import SummaryController from '../../controllers/summary/summary-controller';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let summaryController = new SummaryController();


/**
 *  -------Declare all routes-------------
 */

router.get('/summary/matchingjobs', summaryController.matchingJobs);
router.get('/summary/recruiterdetails', summaryController.recruiterDetails);
router.get('/summary/jobsactivities', summaryController.jobsActivities);
router.get('/summary/referrals', summaryController.getReferrals);
router.get('/summary/pendinglegalrequest', summaryController.getLegalRequest);



module.exports = router;