/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import TimecardsController from '../../controllers/timecards/timecards-controller.js';

/**
 *  -------Initialize global variables-------------
 */
let app = express();
let router = express.Router();
let timecardsController = new TimecardsController();

/**
 *  -------Declare all routes-------------
 */
let routerGetTimecardsLookup = router.route('/timecards/lookupdata');
let routerPostListAllTimecards = router.route('/timecards/getlist');
let routerPostListMissingTimecards = router.route('/timecards/missing');
let routerGetTimecardContentPage = router.route('/timecards/contentpage');
router.post('/timecards', timecardsController.postListSavedTimecards);
router.put('/timecards', timecardsController.putSaveTimecards);
// router.get('/timecards/:tsEntryId', timecardsController.getTimeCardByTSEntryId);
// router.delete('/timecards/:uploadedTimeSheetId', timecardsController.deleteClientTimesheetInvoice);
router.post('/timecards/client', timecardsController.uploadClientApprovedTimecard.bind(timecardsController));

router.post('/timecards/getdetail-client', timecardsController.getClientApprovedTimecardDetails);
router.post('/timecards/getlist-client', timecardsController.getClientApprovedTimecardList);
router.post('/timecards/activeprojects', timecardsController.getActiveProjects);
router.post('/timecards/getprojecthours', timecardsController.getActiveProjectsWithHours);
router.get('/timecards/pendinghours', timecardsController.getPendingHours);

router.post('/timecards/convert', timecardsController.convert);
router.post('/timecards/get-timecard', timecardsController.getAllTimecards_New);


// test
// router.post('/timecards/testrange', timecardsController.getRange_TEST_Method);
//new timesheet api
router.post('/timecards/timesheet', timecardsController.getPendingTimeSheet);
router.post('/timecards/hours', timecardsController.getTimecardHoursDetail);
router.post('/timecards/savehours', timecardsController.saveTimecardHours);
router.post('/timecards/createpdf', timecardsController.createMannualTimecardPdf);
router.post('/timecards/payroll', timecardsController.getPayrollInfo);



/**
 *  ------ Bind all routes with related controller method-------------
 */

/**
 * Get timecards Lookup
 */
routerGetTimecardsLookup
    .get(timecardsController.getTimecardsLookup.bind(timecardsController));
/**
 * Get all timecards list
 */
routerPostListAllTimecards
    .post(timecardsController.postListAllTimecards.bind(timecardsController));

/**
 * Get missing timecards list
 */
routerPostListMissingTimecards
    .post(timecardsController.postListMissingTimecards.bind(timecardsController));

/**
 * get timecard content page
 */
routerGetTimecardContentPage
    .get(timecardsController.getTimecardContentPage.bind(timecardsController));


module.exports = router;
