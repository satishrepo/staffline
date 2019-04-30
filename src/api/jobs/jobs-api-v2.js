/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import JobsController from '../../controllers/jobs/jobs-controller';
import JobsReferralController from '../../controllers/jobs/jobsreferral-controller-v2';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let jobsController = new JobsController();
let jobsReferralController = new JobsReferralController();


/**
 *  -------Declare all routes-------------
 */

let routerGetJobStatistics = router.route('/jobs/statistics');
let routerSearchJobs = router.route('/jobs/search');
let routerGetJobsById = router.route('/jobs/:cjmJobId([0-9]+)');
let routerGetSimilarJobs = router.route('/jobs/similarjobs/:cjmJobId([0-9]+)');
let routerPostMatchingJobs = router.route('/jobs/matchingjobs');
let routerPostJobTitleSuggestion = router.route('/jobs/suggestions');
let routerPostJobsAlert = router.route('/jobs/alert');
let routerDeleteJobsAlert = router.route('/jobs/alert/:jobSearchAlertId');
// let routerGetClearHistory = router.route('/jobs/clearHistory');
let routerDeleteJobSearchHistory = router.route('/jobs/search');


router.post('/jobs/notfit', jobsController.jobNotFit.bind(jobsController));
router.post('/jobs/refer-user', jobsReferralController.referJobToRegisteredUser.bind(jobsReferralController));
router.get('/jobs/refer', jobsReferralController.getReferrals);
router.post('/jobs/jobrefer', jobsReferralController.postJobRefer); //test paging
router.post('/jobs/isreferred', jobsReferralController.checkReferredByEmail);
router.get('/jobs/resume', jobsReferralController.getResumeList);
router.post('/jobs/applications', jobsReferralController.getApplications);
router.post('/jobs/apply', jobsReferralController.applyJob.bind(jobsReferralController));
router.post('/jobs/share', jobsReferralController.postShareJob.bind(jobsReferralController));
router.post('/jobs/scheduledinterviewslist', jobsReferralController.getScheduledInterviewsList.bind(jobsReferralController));
router.post('/jobs/refer', jobsReferralController.referJob.bind(jobsReferralController)); 

// router.post('/jobs/alert', jobsController.saveJobAlert.bind(jobsReferralController)); 
// router.delete('/jobs/alert/:jobSearchAlertId', jobsController.deleteJobsAlert.bind(jobsReferralController)); 
// router.post('/jobs/statistics', jobsController.getStatistics.bind(jobsController)); 


// ***************************** NEW API *************************************** //

router.post('/jobs/referjob', jobsReferralController.referJobToCandidate.bind(jobsReferralController)); 
router.post('/jobs/referjobaction', jobsReferralController.jobReferralLoggedInAction.bind(jobsReferralController)); 
router.post('/jobs/checkjobrefer', jobsReferralController.getUserJobReferInfoByEmail.bind(jobsReferralController)); 
router.post('/jobs/invitevaimail', jobsReferralController.sendInviteVaiMail.bind(jobsReferralController)); 
router.post('/jobs/invitations', jobsReferralController.getInvitationActivity.bind(jobsReferralController)); 

// router.post('/jobs/sharecontent', jobsReferralController.getJobShareContent.bind(jobsReferralController)); 




/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetJobsById.get(jobsController.getJobsById.bind(jobsController));

routerGetJobStatistics.get(jobsController.getStatistics.bind(jobsController));

routerPostMatchingJobs.post(jobsController.getMatchingJobs.bind(jobsController));

routerPostJobTitleSuggestion.post(jobsController.getJobTitleSuggestion.bind(jobsController));

routerGetSimilarJobs.get(jobsController.getSimilarJobs.bind(jobsController));

routerSearchJobs.post(jobsController.getJobs.bind(jobsController));

routerPostJobsAlert.post(jobsController.postJobsAlert.bind(jobsController));

routerDeleteJobsAlert.delete(jobsController.deleteJobsAlert.bind(jobsController));

routerDeleteJobSearchHistory.delete(jobsController.clearJobSearchHistory.bind(jobsController));

module.exports = router;