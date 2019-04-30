
/**
 *  -------Import all classes and packages -------------
 */
import accountsRoutes from '../api/accounts/accounts-api';
import usersRoutes from '../api/profileManagement/profile-management-api';
import immigrationsRoutes from '../api/immigrations/immigrations-api';
import dashboardRoutes from '../api/dashboard/dashboard-api';
import regionsRoutes from '../api/regions/regions-api';
import myProjectsRoutes from '../api/myProjects/my-projects-api';
import vacationsRoutes from '../api/vacations/vacations-api';
import benefitsRoutes from '../api/benefits/benefits-api';
import interviewTipsRoutes from '../api/interviewTips/interview-tips-api';
import payrollRoutes from '../api/payrolls/payrolls-api';
import hrRoutes from '../api/hr/hr-api';
import timecardRoutes from '../api/timecards/timecards-api';
import faqRoutes from '../api/faqs/faqs-api';
import holidayRoutes from '../api/holidays/holidays-api';
import newsRoutes from '../api/news/news-api';
import formsRoutes from '../api/forms/forms-api';
import lcaRoutes from '../api/lca/lca-api';
import contactUsRoutes from '../api/contactUs/contact-us-api';
import staffContactsRoutes from '../api/staffContacts/staf-contacts-api';
import jobsRoutes from '../api/jobs/jobs-api';
import expensesRoutes from '../api/expenses/expenses-api';
import referralsRoutes from '../api/referrals/referrals-api';
import settingsRoutes from '../api/settings/settings-api';
import summaryRoutes from '../api/summary/summary-api';
import supportRoutes from '../api/support/support-api';
import chatRoutes from '../api/chat/chat-api';
import employeeonboardingRoutes from '../api/employeeonboarding/employeeonboarding-api';

import lodash from 'lodash';
import CoreUtils from './core-utils';



import configContainer from '../config/localhost';


let config = configContainer.loadConfig();


/**
 *  Handle Exclude path which will only check Authorization key not Auth token 
 */
let excludeJwtPaths_base = [
    { url: '/accounts/signin', methods: ['POST'] },
    { url: '/accounts/signup', methods: ['POST'] },
    { url: '/accounts/sendotp', methods: ['POST'] },
    { url: '/accounts/forgotpassword', methods: ['POST'] },
    { url: '/accounts/resetpassword', methods: ['POST'] },
    { url: '/accounts/linkedinsignin', methods: ['POST'] },
    { url: '/accounts/facebooksignin', methods: ['GET', 'POST'] },
    { url: '/accounts/googlesignin', methods: ['GET', 'POST'] },
    { url: '/users/lookup/clear', methods: ['GET'] },
    { url: '/accounts/activate', methods: ['POST'] },
    { url: '/accounts/createpassword', methods: ['POST'] },
    { url: '/accounts/resendemail', methods: ['POST'] },
    { url: '/holidays/schedule', methods: ['GET'] },
    { url: '/faqs', methods: ['POST'] },
    { url: '/news', methods: ['GET'] },
    { url: '/timecards/contentpage', methods: ['GET'] },
    { url: '/interviewtips', methods: ['GET'] },
    { url: '/immigrationfiling', methods: ['GET'] },
    { url: '/benefits', methods: ['GET'] },
    { url: '/hr/abouthr', methods: ['GET'] },
    { url: '/contactus', methods: ['POST'] },
    { url: '/accounts/verifycode', methods: ['POST'] },
    { url: '/accounts/createcode', methods: ['POST'] },
    { url: '/accounts/loginwithcode', methods: ['POST'] },
    { url: '/accounts/privilege-access', methods: ['POST'] },
    { url: '/accounts/notinterested', methods: ['POST']},
    { url: '/mailprovider/sgcallback', methods: ['POST'] },
];

/**
 *  Handle API Path which can be access before login and after login  
 */

let accessAndAuthUrl_base = [
    {url : '/timecards/test',methods : ['POST'], regex : 0},
    {url : '/jobs/statistics',methods : ['GET'], regex : 0},
    {url : '/jobs/search',methods : ['POST'], regex : 0},
    {url : '/jobs/apply',methods : ['POST'], regex : 0},
    {url : '/jobs/alert',methods : ['POST'], regex : 0},
    {url : '/test/error',methods : ['GET'], regex : 0},
    {url : '/jobs/:cjmJobId([0-9]+)',methods : ['GET'],  regex : 1, pattern: /api\/jobs\/([0-9]+)/ },
    {url : '/reportabug',methods : ['POST'], regex : 0 },
    {url : '/support-contacts',methods : ['GET'], regex : 0 },
    {url : '/jobs/suggestions',methods : ['POST'], regex : 0 },
    {url : '/jobs/similarjobs/:cjmJobId([0-9]+)',methods : ['GET'], regex : 1, pattern: /api\/jobs\/similarjobs\/([0-9]+)/ },
    {url : '/regions/location/search',methods : ['POST'], regex : 0 },
    {url : '/accounts/verifycode',methods : ['POST'], regex : 0 },
    {url : '/accounts/createcode',methods : ['POST'], regex : 0 },
    {url : '/accounts/activate', methods: ['POST'], regex : 0 },
    {url : '/accounts/jobsearchstatus', methods: ['POST'], regex : 0 },
    {url : '/users/lookupdata', methods: ['GET'], regex : 0 },
    {url : '/accounts/checkapiupdate', methods: ['GET'], regex : 0 },
    {url : '/accounts/login', methods: ['POST'], regex : 0 },
    {url : '/chatbot/users/profile', methods: ['POST'], regex : 0 },
    {url : '/chatbot/benefits/all', methods: ['POST'], regex : 0 },
    {url : '/chatbot/benefits/401k', methods: ['POST'], regex : 0 },
    {url : '/chatbot/immigrationlist', methods: ['POST'], regex : 0 },
    {url : '/employee/hscallback', methods: ['POST'], regex : 0 }, 
    {url : '/employee/templates', methods: ['GET','POST'], regex : 0 }, 
    {url : '/employee/documents/:templateId', methods: ['GET'], regex : 1, pattern: /api\/employee\/documents\/[0-9a-z]/ },
    {url : '/employee/createenvelope', methods: ['POST'], regex : 0 },
    {url : '/employee/filesurl', methods: ['POST'], regex : 0 },
    {url : '/employee/getsignurl', methods: ['POST'], regex : 0 },
    {url : '/employee/envelopefiles', methods: ['POST'], regex : 0 },
    {url : '/employee/signers', methods: ['POST'], regex : 0 },
    {url : '/employee/signersinfo', methods: ['POST'], regex : 0 },
    {url : '/employee/sendsignaturemail', methods: ['POST'], regex : 0 },
    {url : '/employee/createcode', methods: ['POST'], regex : 0 },
    {url : '/employee/downloadenvelope', methods: ['POST'], regex : 0 },
    { url: '/mailprovider/sgcallback', methods: ['POST'], regex : 0 },
    
    
];


var api_versions = config.api_versions;


let accessAndAuthUrl = [];
let excludeJwtPaths = [];

for(let i in api_versions)
{ 
    let accessAndAuthUrl_f = accessAndAuthUrl_base.map(item => {
        return {url:(i+item.url), methods : item.methods, regex: item.regex, pattern : item.pattern} ;
    })
    Array.prototype.push.apply(accessAndAuthUrl,accessAndAuthUrl_f);

    let excludeJwtPaths_f = excludeJwtPaths_base.map(item => {
        return {url:(i+item.url), methods : item.methods} ;
    })
    Array.prototype.push.apply(excludeJwtPaths,excludeJwtPaths_f);
}

    // console.log(excludeJwtPaths)

/**
 * All routes will be register here to validate url and request method
 */
let coreUtils = new CoreUtils(),
    prefix = "/api",
	
    expressRoutes = [
        /*
        accountsRoutes,
        usersRoutes,
        usersRoutes,
        dashboardRoutes,
        immigrationsRoutes,
        regionsRoutes,
        myProjectsRoutes,
        vacationsRoutes,
        benefitsRoutes,
        hrRoutes,
        payrollRoutes,
        timecardRoutes,
        staffContactsRoutes,
        faqRoutes,
        holidayRoutes,
        interviewTipsRoutes,
        newsRoutes,
        formsRoutes,
        lcaRoutes,
        contactUsRoutes,
        jobsRoutes,
        expensesRoutes,
        referralsRoutes,
        settingsRoutes,
        summaryRoutes,
        supportRoutes,
        chatRoutes,
	
		*/
    ],
    apiRoutes = coreUtils.parseRegisteredRoutes(expressRoutes);
	

/**
 * Return all routes with prefix
 */
function getRoutes() {

    return {
        prefix: prefix,
        apiRoutes: apiRoutes
    };
}



/**
 * Check route exists or not
 * @param {*} originalUrl 
 */
function routeExists(originalAPIUrl, reqMethod) {
    let originalUrl = originalAPIUrl.split('/api')[1];
    let appRoutes = getRoutes();
    const exists = lodash.find(appRoutes.apiRoutes, (route) => { 
        let index = route.path.indexOf(":");
        let pathToCheck = route.path;
        
        if (index >= 0) 
        {
            pathToCheck = route.path.substr(0, (index - 1)); 
            return ((originalUrl.indexOf(pathToCheck) >= 0) && (route.method == reqMethod));
        }
        return ((prefix + originalUrl == prefix + pathToCheck) && (route.method == reqMethod));
    });
    return exists;
}

module.exports = {
    // initRoutes: initRoutes,
    // router: router,
    getRoutes: getRoutes,
    routeExists: routeExists,
    excludeJwtPaths: excludeJwtPaths,
    accessAndAuthUrl: accessAndAuthUrl
}
