module.exports = {



    // production vars 

     /**
     * immigration filing static page (--changes--)
     */
    immigrationFiling: {
        faqId: 31,
    },


    // ----------------------------- END HERE


    /**
     *  All conditions 
     */
    conditions: {
        euqals: "=",
        doubleEquals: "==",
        tripleEquals: "===",
        greaterThan: ">",
        lessThen: "<",
        lessEquals: "<=",
        greaterEquals: ">="
    },
    /**
     * Employee Status
     */
    empStatus: {
        status: 'I',
        activeStatus: 'A',
        active: 1,
        inActive: 0
    },

    /**
  * Resume_Master Status
  */
    resumeMasterStatus: {
        InActive: 0,
        Active: 1,
        Approved: 2,
        Unverified: 3,
        BlackListed: 4
    },
    /**
     * Parent IDs for lookups
     */
    appRefParentId: {
        technologyParentId: 900,
        timecardParentId: 3300,
        timecardContentPageParentId: 4900,
        interviewTipsParentId: 4900,
        aboutHrParentId: 4900,
        staticPageParentId: 4900,
        primaryJobWorkRole: 4300,
        immigrationRateType: 1100,
        appForParentId: 3550,
        appPriorityParentId: 3580,
        empLabourCategory: 2400,
        timecardExpenseParentId: 3600,
        accountTypesMasterId: 2700,
        onProjectId: 4754,
        faqParrentId: 7000,
        notificationParentId: 8000,
        alertFrequencyParentId: 8080,
        payrollCalenderParentId: 4900,
        messageTypeParentId: 6000,
        contactParentId: 9151,
        emailParentId: 9152,
        authorisationStatus: 2600,
        JobSearchStatus: 4750,
        IndustryVertical: 3000,
        rateType: 1100,
        apiLog : 1,
        userDomainType : 4650,
        projectEndReason : 10950,
        imSupportGroup : 12000,
        timesheetFrequency: 320
    },

    /**
    * page reference id
    */
    pageReferenceId: {
        timecardContentPage: 4907,
        interviewTips: 4915,
        aboutHr: 4902,
        payrollInfo: 4906,
        jobsLookingForBetter: 4916,
        payrollCalenderWeekly: 1001,
        payrollCalenderBiweekly: 1004,
        payrollCalenderBimonthly: 1002,
    },

    payrollCalendarType: {
        weekly: 1,
        biweekly: 2,
        bimonthly: 3
    },
    employeeProjects: {
        currentProject: 1,
        pastProject: 0
    },
    /**
     * Timecard Vars
     */
    timecard: {
        weeklyHours: 40,
        dailyHours: 24,
        colMonth: 'month',
        colstatusId: 'statusId',
        colTotalHours: 'totalHours',
        isDeleted: 0,
        insertFromPage: 3,
        missingStatus: ['Pending', 'Draft'],
        appRefData: {
            parentId: 1000,
            keyName: 'Weekly'
        },
        draftStatusId: 3301,
        submittedStatusId: [3302, 3303, 3304, 3305],
        pendingApprovalStatusId: [3302],
        statusList: ['submitted', 'pending', 'unsubmitted'],
        mappedStatus: [
            { key: 'Data', value: 'Draft' },
            { key: 'Authorized', value: 'Submitted' },
            { key: 'Invoice Created', value: 'Approved' },
            { key: 'Approve', value: 'Approved' },
            { key: 'Allocation', value: 'Approved' },

        ],
        timecardStatus: {
            0: { key: 'Pending', value: 'Pending' }, 
            3301: { key: 'Data', value: 'Draft' },
            3302: { key: 'Authorized', value: 'Submitted Hours' },
            3303: { key: 'Invoice Created', value: 'Approved' },
            3304: { key: 'Approve', value: 'Approved' },
            3305: { key: 'Allocation', value: 'Approved' },
            9999: { key: 'Pending', value: 'Pending' },
        },
        clientApprovedTimecard: {
            0: { value: 'Pending', map: 'Submitted' },
            1: { value: 'Approved', map: 'Approved' },
            2: { value: 'Allocated', map: 'Submitted' },
            3: { value: 'Rejected', map: 'Submitted' }
        },
        frequency: {
            weekly: 321,
            biweekly: 324,
            semimonthly: 322,
            monthly: 323,
            daterange: 326,
            specialcycle: 325
        }


    },


    /**
     *  Email template get by events name
     */
    emailTemplateEvents: {
        emailEventWelcome: 'welcome',
        emailEventWelcomeSocialMedia: 'welcomeSocialMedia',
        emailEventOtp: 'otp',
        emailEventAcknowledgement: 'acknowledgement',
        emailDashboardContactUs: 'contactus',
        emailEventAccountActivate: 'accountActivate',
        emailContactUs: 'contactusnew',
        emailReportABug: 'reportABug'
    },

    emailConfig : {
        codes : {

            //signup welcome email
            signup : {
                code : 'G01',
                subject : 'Welcome, please activate your StafflinePro™ account'
            },

            //signup welcome email
            socialSignup : {
                code : 'G02',
                subject : ''
            },

            // forgotPassword
            forgotPassword : {
                code : 'G03',
                subject : 'Password reset - Confirmation required',
                fromName : 'StafflinePro™ Support'
            },
           
            // Password reset Confirmed mail
            passwordChanged : {
                code : 'G0301',
                subject : '',
                fromName : 'StafflinePro™ Support'
            },
             
            // forgotPassword non-registered
            forgotPasswordUnreg : {
                code : 'G0302',
                fromName : 'StafflinePro™ Support'
            },

            
            // job referrer
            jobReferrer : {
                code : 'A02',
                subject : ''
            },

            // job referral
            jobReferral : {
                code : 'A0201',
                subject : ''
            },

            // job referral for existing candidate
            jobReferralCandidate : {
                code : 'A0202',
                subject : ''
            },

            // job apply
            jobApply : {
                code : 'A01',
                subject : ''
            },

            jobApplyNoMatchingJob : {
                code : 'A0101',
                subject : ''
            },

            jobApplyNewUser : {
                code : 'A14',
                subject : ''
            },

            // New  Immigration application raised
            immigrationApplication : {
                code : 'I01',
                subject : ''
            },

            // New  Vacation application raised
            vacationRequest : {
                code : 'V01',
                subject : ''
            },

            // New  Expense application raised
            expenseRequest : {
                code : 'E01',
                subject : ''
            },

            // New Message to recruiter 
            messageToRecruiter : {
                code : 'S03',
                subject : ''
            },

            // Share Job Via Email
            shareJob : {
                code : 'J06',
                subject : ''
            },

            reportABug : {
                code : 'S09',
                subject : ''
            },

            timeSheetUploaded : {
                code : 'T02',
                subject : ''
            },

            adminMails : {
                informAm : 'S02',
                messageToRecruiter : 'S03',
                jobApply : 'S04',
                jobRefer : 'S05',
                candidateRefer : 'S06',
                updateJobSearch : 'A10',
                message : 'S0301',
                notFitForJob : 'S13',          
                smeApply : 'S14',         
                referClient : 'S15',         
            },

            supportMails : {
                legal : 'S07',
                hr : 'S08',
                support : 'S10',
                account : 'S11'
            },

            eMails : {
                'rshah' : 'rshah@compunnel.com',
                'andy' : 'andy.gaur@compunnel.com',
                'neville' : 'neville@compunnel.com',
                'ppatlola' : 'ppatlola@compunnel.com',
                'ayadav' : 'ayadav@compunnel.com',
                'timesheet' : 'timesheet@compunnel.com',
                'balram' : 'btripathy@compunnel.com',
                'hrawat' : 'hrawat@compunnel.com',
                'ajaysingh' : 'ajay.singh@compunnel.com',
                'rpapnoi' : 'rpapnoi@compunnel.com'
            },

            jobRefer : {
                code : 'A.02.03'
            },
            contactInvite : {
                code : 'A.02.04'
            },
            notInterestedinJob : {
                code : 'A.02.06'
            },
            userApplyJobMailtoReferrer : {
                code : 'A.02.05'
            },
            helloSign : {
                employee : 'O.03',
                employeeBg : 'O.03.01',
                employeeCt : 'O.03.02', 
                employeeBt : 'O.03.03',
                manager : 'O.05',
                creditLimit : 'O.07',
                signerMissing : 'O.08',
                offerLetterAccepted : 'O.09',
                envlopeCompleted : 'O.06',
                envlopeCompletionFail : 'O.10'
                
            }
            
            
        },

        // emailGroup : {
        //     support : "support@StafflinePro.com",
        //     hr : "hr@StafflinePro.com",
        //     noReply : "noreply@compunnel.com" //"noreply@StafflinePro.com"
        // },

        // fromName : 'StafflinePro™'
    },

    // expiration time for activation code used in Account Activation mail (in hours ) 
    activationCodeExpiraionTime : 720,

    
    /**
     *  password policy
     */
    passwordPolicy: {
        minimumLength: 8,
        maximumLength: 60,
        requireCapital: true,
        requireLower: false,
        requireNumber: true,
        requireSpecial: true
    },

    /**
     *  Encryption Decryption aes-256-cbc
     */
    encryption: {
        encryptionKey: "Rl#H77vtJiwKS!W-alkSifYKD-Nj7Lb4",
        encryptionValueLength: 16,
    },

    /**
     * hr and payroll section static pages
     */
    sectionStaticPages: {
        aboutHr: "abouthr",
        hrBenefits: "hrbenefits",
        payrollInfo: "payrollinfo",
        payrollCalenderWeekly: "payrollcalenderweekly",
        payrollCalenderBiweekly: "payrollcalenderbiweekly",
        payrollCalenderBimonthly: "payrollcalenderbimonthly",
        contentPage: "contentPage",
    },

    /**
     * payrollCalenderType list for payroll static pages
     */
    // payrollCalenderType: {
    //     payrollCalenderWeekly: 4917,
    //     payrollCalenderBiweekly: 4918,
    //     payrollCalenderBimonthly: 4919,
    // },

    /**

     * immigration-application US citizen condition
     */
    authorisationStatus: {
        usCitizen: "US Citizen"
    },
    /** 
     *  Sign In Type
        */
    signInType: {
        socialSignIn: "socialSignIn",
        normalSignIn: "normalSignIn"

    },
    /** 
    * social media type
       */
    socialMediaType: {
        google: "google",
        linkedin: "linkedin",
        facebook: "facebook"
    },

   
    /**
    * immigration currentEmploymentStatusList
    */
    currentEmploymentStatusList: {
        H1: "H1",
        F1: "F1",
        L1: "L1",
        L2: "L2",
        H4: "H4",
        IND: "IND",
        OTHER: "OTH"
    },

    /**
     * department code for downloading forms
     */
    departmentNames: {
        accounts: "Accounts",
        humanResources: "Human Resources",
        legal: "Legal",
        payroll: "Payroll"
    },

    /**
     * download forms
     */
    downloadForms: {
        downloadFormFolder: "Upload",
        downloadFormSubFolder: "Documents"
    },

    /**
   * get benefits static page
   */
    getBenefits: {
        status: 1,
        showOnEmpPortal: 1,
    },

    /**
    * TimeCard Default Hours
    */
    timecarDefaultHours: {
        value: 8
    },

    /**
     * Vacations Employee type
     */
    employeeType: {
        inHouse: 1221,
        externalUser: 1224,
        consultant: 1222,
        subContractor: 1223,
        jobSeeker: 1224
    },

    /**
     * employee availabiity
     */
    employeeAvailability: {
        Immediate: { key: 1, val: 'Immediate' },
        TwoWeeksNotice: { key: 2, val: '2 weeks notice' },
        OnProject: { key: 3, val: 'Currently on a project' },
        Other: { key: 4, val: 'Other' },
        ThreeWeeksNotice: { key: 5, val: '3 weeks notice' },
        FourWeeksNotice: { key: 6, val: '4 weeks notice' },
    },

    /**
     * desired employement
     */
    desiredEmployement: {
        Consulting: { key: 'C', val: 'Contract' },
        FullTime: { key: 'F', val: 'Fulltime' },
        RightToHire: { key: 'R', val: 'Contract to Hire' },
    },

   

    subFolders: {
        profile: '/ProfilePicture',
        timecard: '/UploadTimeSheet',
        immigration: '/LCADocuments',
        expenses: '/UploadExpenseDocument',
        referrals: '/referrals',
        depositeCheque: '/Documents',
        jobresume: '/Resume'
    },

    /**
     * Maximum nunmber of days of vactions request
     */
    vacationRequest: {
        maxDays: 5000
    },

    /**
     * news category
     */
    newsCategory: {
        inhouse: 0,
        outside: 1,
        both: 2
    },
    /**
     * default paging value
     */
    paging: {
        pageCount: 1,
        pageSize: 20,
        matchingJobPazeSie: 20
    },

    /*
    * Allowed extensions for Resume upload
    */
    resumeExtensions: ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'msi', 'rtf', 'txt'],

    /*
    * Allowed extensions for Cheque in Bank Detail section
    */
    chequeExtensions: ['jpg', 'jpeg', 'png', 'pdf'],


    /**
     * Jobs related data
     */
    jobs: {
        defaultSearchHistoryCount: 5,
        defaultMiles: 50,

        isHot: "1",
        isNotHot: "0",
        isHotDefaultValueForAllResult: "2",
        userLocationMatchingJobsNull: -999


    },
    /**
     * job list type for filter job
     */
    jobListType: {
        similarJobs: "similarJobs",
        matchingJobs: "matchingJobs",
        localJobs: "localJobs",
        otherLocationJobs: "otherLocationJobs"
    },

    /**
     * Interview status master 
     */

    interviewStatusId: {
        pendingRecruiterReview: 24
    },

    interviewStatus: {
        positive: [6, 10, 15, 19, 24, 25, 351, 353], 
        negative: [4, 13, 14, 16, 17, 26, 352],
        applied : { success: [24], failed: [13, 90] },
        inprocess :{ success: [6, 10, 19, 25], failed: [4, 14, 16, 26] },
        offer : { success: [15], failed: [17] },
    },

    referred: {
        activelyLookingStatus: 4751,
        notLookingForOpportunity : 4753,
        refferedMessage: 'Thank You! You have successfully referred the job to your contact.'
    },

    notifications: {
        readTypes: ['1', '0', 1, 0, '']
    },

    message: {
        types: ['message', 'notification'],
        actions: ['flag', 'archive'],
        boolean: [1, 0, "1", "0"]
    },


    doc: {
        type: {
            resume: 1702,
            other: 1701
        },
        isPrimary: 0
    },


    uploadType: {
        
        maxFileSize : 5, // MB

        userResume: {
            docTypeId: 9001,
            path: '/Resume',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf']
        },
        userDocument: {
            docTypeId: 9006,
            path: '/Documents',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png']
        },
        expenseDocument: {
            docTypeId: 9002,
            path: '/UploadExpenseDocument',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
        },
        LCADocuments: {
            docTypeId: 9003,
            path: '/LCADocuments',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png']
        },
        timecardReport: {
            docTypeId: 9004,
            path: '/UploadTimeSheet',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
        },
        vacation: {
            docTypeId: 9005,
            path: '/Vacation',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
        },
        userPicture: {
            docTypeId: 9007,
            path: '/ProfilePicture',
            allowedExt: ['jpg', 'jpeg', 'png']
        },
        legalImmigration: {
            docTypeId: 9008,
            path: '/DMS/Employee',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png']
        },
        messageCenter: {
            docTypeId: 9009,
            path: '/MessageCenter',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
        },
        bankDetails: {
            docTypeId: 9010,
            path: '/DepositeCheque',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png']
        },
        offerLetter: {
            docTypeId: 9011,
            path: '/OfferLetter',
            allowedExt: ['pdf']
        },
        employeeDocs: {
            docTypeId: 9011,
            path: '/DMS/Employee',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png','zip']
        },
        ptDocs: {
            docTypeId: 9011,
            path: '/DMS/Employee',
            allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png','zip']
        },
        //Post discussion with ankur and raghu changing it from 9012 to 9011
        // ptDocs: {
        //     docTypeId: 9012,
        //     path: '/DMS/Placement/Candidate',
        //     allowedExt: ['doc', 'docx', 'rtf', 'txt', 'pdf', 'jpg', 'jpeg', 'png', 'zip']
        // },

        docTypes : {
            'other' : 1701,
            'resume' : 1702,
            'rtr' : 1703,
            'w9' : 1704,
            'interviewTemplate' : 1705
        }

    },

    // Default recruiter ID ( sheffali razdan )
    defaultRecruiter: 12380,
    employeeDefaultValues: {
        defaultRecruiter: 12380,
        defaultEntityGroup: 2323,
        defaultSourceId: 4414,
        defaultRefferedSourceGroupId: 4417,
        defaultRefferedJobSearchStatus: 4751
    },
    defaultRecruiters : [1678, 12380],


    messageType: {
        jobId : 6002
    },

    // alert and notification for email and push notification
    alertAndNotification : {
        type : {
            job : 8001,
            matchingJob:8008
        }
    },

    // OS type mapping for api header value to userlogindetail table
    osTypes : {
        'ios' : 1,
        'android' : 2
    },
     /**
     * job Interview type
     */
    interviewType: {
       inPerson: { key: 1, val: 'In Person' },
       telephonic: { key: 1, val: 'Telephonic' },
       webCam: { key: 1, val: 'Web Cam'}
    },

    immigration : {
        status : {
            'attorneyReview' : 10504,
            'pending' : 10506,
            'paraLegalReview' : 10508
        },
        documentStatus: {
            0: { key: '0', value: 'N.A.' }, 
            1: { key: '1', value: 'Completed' },
            2: { key: '2', value: 'Candidate Pending' },
            3: { key: '3', value: 'Immigration Pending' },
            4: { key: '4', value: 'Recruiter Pending' }
        },
    },


    imChat : {        
        hrMsg : {
            title : 'HR Support',
            description : 'Message HR support and get your HR related questions answered.',
            id : 1,
            defaultIssueType: 8
        },
        immigrationMsg : {
            title : 'Immigration Support',
            description : 'Message immigration support and get your immigration related questions answered.',
            id : 2,
            defaultIssueType: 9
        },
        payrollMsg : {
            title : 'Payroll Support',
            description : 'Message payroll support and get your payroll related questions answered.',
            id : 3,
            defaultIssueType: 10
        },
        jobMsg : {
            title : 'Job Support',
            description : 'Message job recruiter and get your job related questions answered.',
            id : 4,
            defaultIssueType: 11
        },
        recruiterMsg : {
            title : 'My Recruiter',
            description : 'Message your recruiter',
            id : 5,
            defaultIssueType: 12
        },
        timesheetMsg : {
            title : 'Timesheet Support',
            description : 'Message timesheet support and get your timesheet related questions answered.',
            id : 6,
            defaultIssueType: 13
        },
        accountPayableMsg : {
            title : 'Accounts Payable',
            description : 'Message accounts payable support and get your accounts related questions answered.',
            id : 7,
            defaultIssueType: 14
        },
    },

    broadCast : {
        newsId : 11021,
        jobReferralId : 11022
    },

    newLogin : {
        atsUser : 12101,
        proUser : 12102,
        newJobSeeker : 12105
    },

    // access of group to different usertype, key = usertype value = array of allowed groupId
    chatGroupAccess : {
        '1221' : [1, 2, 3, 4, 5, 6],
        '1222' : [1, 2, 3, 4, 5, 6],
        '1223' : [4, 5, 6, 7],
        '1224' : [4, 5],
    },

    jobReferStatus : {
        referred : 351,
        notInterested : 352,
        applied : 353,
    },

    contactStatus : {
        invitedByOther: 505,
        referredByOther: 506,
        alreadyRegistered: 507,
        invited : 501,
        joined : 502,
        alreadyInvited : 503,
    },

    referValidity : 90, // days
    sponsoreBonus : 100, // dollars
    clientReferStatus : {
        pending : 1851
    },

    jobsSearchType : {
        matchingJob : 701,
        jobSearch : 702
    },

    appRefValueOfStafflinePro : 1953,


    sme : {
        applicationStatus : {
            'inProcess' : 2251,
            'approved' : 2252,
            'waitingList' : 2253
        },
        requestStatus : {
            'pending' : 1781,
            'accepted' : 1782,
            'notInterested' : 1783,
            'notAvailable' : 1784,
            'grabbedByOther' : 1785,
            'completed' : 1786,
            'cancelled' : 1787
        }
    },

    helloSign : {
        requestLowLimit : 100,
        envelopStatus: {
            draft: 2181,
            created : 2182,
            completed : 2183
        },
        offerLetterStatus : {
            pending : 0,
            completed: 1,
            sent: 2,
            na : 3,
            inprocess : 4
        },
        bgCheckStatus : {
            pending : 0,
            interim: 1,
            completed: 2,
            na : 3,
            inprocess : 4
        },
        clientDocStatus : {
            pending : 0,
            completed: 1,
            na : 2,
            inprocess : 3
        },
        benefitStatus : {
            pending : 0,
            completed: 1,
            na : 2,
            inprocess : 3,
            ni : 4 // not interested
        },
        envelopeType : {
            bgCheck : 2121,
            clientDoc : 2122,
            benefit : 2123,
        },
        envelopeCode : {
            2121 : 'BG',
            2122 : 'W2',
            2123 : 'Benefits',
        },
        eventTypes : {
            signature_request_viewed : 1,
            signature_request_signed : 2,
            signature_request_all_signed : 3,
            signature_request_downloadable : 4,
            unknown_error : 5,
            signature_request_invalid : 6,
            sign_url_invalid : 7
        },
        keyValueStatus : {
            signature_request_created : 1054,
            signature_request_viewed : 1039,
            signature_request_signed : 1040,
            signature_request_all_signed : 1046,
            signature_request_downloadable : 1041,
            unknown_error : 1047,
            signature_request_invalid : 1049,
            sign_url_invalid : 1050
        }
    },

    accountType : {
        'saving': 2701,
        'current': 2702,
        'paypal': 2703 
    },
    dataInsertFrom: {
        immigration: 12701,
        onboarding: 12710
    },

    compnayMaster: {
        default: 1,
        eLearning: 2
    },

    severityType:{
        Medium: 13102,
        Normal: 13101,
        Urgent: 13103
    },
    severityTypeLabel:{
        Medium: 'Medium',
        Normal: 'Normal',
        Urgent: 'Urgent'
    },




}