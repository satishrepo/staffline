import express from 'express';
import responseFormat from '../core/response-format';

let app = express();
let router = express.Router();


router.use(function(req, res, next)
{   
    next();
})


// router.use('/', require('../api/support/support-api-v2'));


router.use('/', require('../api/accounts/accounts-api')),
router.use('/', require('../api/benefits/benefits-api')),
router.use('/', require('../api/contactUs/contact-us-api')),
router.use('/', require('../api/chat/chat-api')),
router.use('/', require('../api/dashboard/dashboard-api')),
router.use('/', require('../api/expenses/expenses-api')),
router.use('/', require('../api/faqs/faqs-api')),
router.use('/', require('../api/forms/forms-api')),
router.use('/', require('../api/holidays/holidays-api')),
router.use('/', require('../api/hr/hr-api')),
router.use('/', require('../api/immigrations/immigrations-api')),
router.use('/', require('../api/interviewTips/interview-tips-api')),
// router.use('/', require('../api/jobs/jobs-api')),
// router.use('/', require('../api/jobs/jobs-api-v2')),
router.use('/', require('../api/jobs/jobs-api-v3')),
router.use('/', require('../api/lca/lca-api')),
router.use('/', require('../api/myProjects/my-projects-api')),
router.use('/', require('../api/news/news-api')),
router.use('/', require('../api/onboarding/onboarding-api')),
router.use('/', require('../api/payrolls/payrolls-api')),
router.use('/', require('../api/profileManagement/profile-management-api')),
router.use('/', require('../api/referrals/referrals-api')),
router.use('/', require('../api/regions/regions-api')),
router.use('/', require('../api/settings/settings-api')),
router.use('/', require('../api/sme/sme-api')),
router.use('/', require('../api/staffContacts/staf-contacts-api')),
router.use('/', require('../api/summary/summary-api')),
router.use('/', require('../api/support/support-api')),
router.use('/', require('../api/timecards/timecards-api')),
router.use('/', require('../api/vacations/vacations-api'))



router.use('*', function(req, res){
  
	let response = responseFormat.createResponseTemplate();
	response = responseFormat.getResponseMessageByCodes(['common404'], { code: 404 });
	res.status(404).json(response);

});



module.exports = router;