module.exports = {

    /**
    * port setting
    */
    PORT: process.env.PORT || 9003,

    /**
     * redis cache configuration
     */
    redisConfig: {
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: 6379
    },

    /**
     * authentication token key for
     */
    jwtSecretKey: 'jwtStaffLineSecretKey',

    /**
     * authorization key for api access permission
     */
    apiAccessToken: 'StaffLine@2017',

    /**
   * API hostUrl
   */
    apiHostUrl: 'http://staffline-qa.compunnel.com',

    /**
     * ui hostUrl
     */
    uiHostUrl: 'http://pre.stafflinepro.com',


    /**
     * file upload hostUrl
     */
    uploadHostUrl: 'http://pre-sapphire.compunnel.com/Upload/',

    /**
     *  account activation url on sign up welcome email
     */
    accountActivationUrl: '/verify-account',

    /**
    * password reset link on social media welcome email
    */
    socialMediaPasswordChange: '/set-password',

    /**
     * image folder path
     */
    imageFolder: 'stafflineDocuments',

    /**
     * contactUs To email-address
     */
    contactUsToEmail: 'passport@compunnel.net',//'sam.handa@compunnel.com',
    /**
    * Email will be received on following email when error occurred 
    */
    errorReportEmail: 'satish.purohit@compunnel.in',

    /**
     * thirt party api url domain name (to upload document and get matching jobs)
     */
    thirdPartyApiUrl: 'http://stafflineapi-beta.compunnel.com',
     thirdPartyMatchingJobsApiUrl: 'http://stafflineapi-beta.compunnel.com',//'http://638d8ecc.ngrok.io',
    uploadEndpoint: '/document/upload',
    matchingJobEndpoint: '/job/matchingjobs',
    thirdPartyApiUrlToken: 'qwerty~!@',

    thirdPartyResumeSearchApiUrl:'http://rs.iendorseu.com/mapi/candidate/create',
    thirdPartyResumeSearchApiUrlToken:'sda43WfR797sWQE',


    thirdPartyResumeParaseUrl:'http://stafflineapi-beta.compunnel.com/parser/proupdatecandidate',
    thirdPartyEmailApiUrl:'http://stafflineapi-beta.compunnel.com/mail/sendmail',

    /**
     * thirt party host url to show file path
     */
    resumeHostUrl: 'https://staffline-beta.compunnel.com',
    documentHostUrl: 'https://portal-beta.compunnel.com',
    documentBasePath: '/Upload',

    /**
     * otp expiration time configuration
     */
    otpExpireDuration: 5,

    /**
   * database configuration
   */
    db: {
        host: '52.1.39.186',
        dbname: 'CSG_2001_Staging',
        username: 'atsstaging',
        password: 'atsstaging',
        instance: '',
        connectionTimeout: 300000,
        requestTimeout: 900000,
        pool: {
            idleTimeoutMillis: 300000,
            max: 100
        }
    },

    /**
    * load application environment
    */
    loadConfig: function loadConfig() {
        let node_env = (process.env.NODE_ENV || 'localhost'),
            config = require('./' + node_env);
        config.node_env = config.NODE_ENV = node_env;

        return config;
    },

    /**
     * recaptcha configuration
     */
    reCaptcha: {
        siteKey: "6Le-nRwTAAAAAFUEago3wznbj0XTSkNsAz-p1HdB",
        secretKey: "6Le-nRwTAAAAANrur62hoxj0BcfkmuF9ibcUjE9t"
    },

    /**
     * linkedin login credentials 
     */
    linkedInConfig: {
        linkedInReturnUrl: 'http://staffline-qa.compunnel.com',
        linkedInClientID: '81afk20zp7h7b1',
        linkedInClientSecret: 'k8Pq9m4NcGktrC7b',
    },

    /**
     * facebook login credentials 
     */
    facebookConfig: {
        facebookAppID: '268500463633833',
        facebookAppSecret: 'f056b8b0e93050bba3d62a7386db41e9',
        callback_url: 'http://staffline-qa.compunnel.com/',
    },

    /**
     *  google login credentials
     */
    googleConfig: {
        googleClientID: '443928613031-06khuli147kjt1mn2r55cv91elcm95ei.apps.googleusercontent.com',
        googleClientSecret: 'NtTL3buiFF2sgQz_p9OFS9ub',
        redirect_url: 'http://staffline-qa.compunnel.com',
    },

    /**
     * email default setup
     */
    emailOptions: {
        from: 'passport@compunnel.net',
        to: '',
        subject: 'Sending Email from Staffline app!',
        html: '<h1>Welcome. Email Sent Successfully</h1>'
    },

    /**
     * SMTP onfiguration
     */
    emailSenderOptions: {
        host: "smtp.gmail.com",
        secureConnection: false,
        port: 587,
        auth: {
            user: "passport@compunnel.net",
            pass: "Comp@passport"
        }
    },
    /**
  * download forms domain name
  */
    downloadFormUrl: {
        domainName: "http://staffline-qa.compunnel.com"
    },

    /**
     * contactUs To email-address
     */
    contactUsToEmailId: 'passport@compunnel.net',//'portalsupport@compunnel.com',

    /**
    * Report A Bug Email
    */
    reportABugToEmailId: 'support@stafflinepro.com',


    /**
     * Emails will be send to these email-addresses in qa and develovepment environment
     */
    testEnvToEmail: 'puja.kumari@compunnel.in, sharads@compunnel.com, rpapnoi@compunnel.com, jay.singh@compunnel.com, ajay.singh@compunnel.com, satish.purohit@compunnel.in',

    /**
    * API header should contain following parameters
    */

    headerParams : {
        'Authorization' : 'required',
        'Deviceid' : 'required',
        'Version' : 'optional',
        'OS' : 'required',
        'Platform' : 'required',
        'GeoLat' : 'optional',
        'GeoLong' : 'optional'        
    },

    api_versions : {
      '/api' : {path : '/v1', inUse : true, nextVerAvailable : 'v2'},
      '/v1/api' : {path : '/v1', inUse : true, nextVerAvailable : 'v2'},
      '/v2/api' : {path : '/v2', inUse : true}
    }

}
