/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import InterviewTipsController from '../../controllers/interviewTips/interview-tips-controller';

/**
 *  -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let interviewTipsController = new InterviewTipsController();

/**
 *  -------Declare all routes-------------
 */
let routerGetInterviewTips = router.route('/interviewtips');


/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetInterviewTips
    .get(interviewTipsController.getInterviewTips.bind(interviewTipsController));

module.exports = router;