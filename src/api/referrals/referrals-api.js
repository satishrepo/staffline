/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import ReferralsController from '../../controllers/referrals/referrals-controller.js';

/**
 *  -------Initialize global variables-------------
 */

let router = express.Router();
let referralsController = new ReferralsController();

/**
 *  -------Declare all routes-------------
 */


router.get('/referrals/lookupdata', referralsController.lookupData);
router.post('/referrals', referralsController.referCandidate);
router.get('/referrals', referralsController.myReferrals);
router.get('/referrals/bankdetails', referralsController.myBankDetails);
router.post('/referrals/bankdetails', referralsController.addBankDetails);
router.post('/referrals/applications', referralsController.activeApplications);
router.post('/referrals/isreferred', referralsController.checkReferredByEmail);

router.post('/referrals/client', referralsController.referClient);

router.post('/referrals/contactreferrals', referralsController.contactreferrals);// testing paging


module.exports = router;
