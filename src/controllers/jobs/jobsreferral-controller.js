/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import ProfileManagementModel from '../../models/profileManagement/profile-management-model';
import UserModel from '../../models/profileManagement/profile-management-model';
import EmailModel from '../../models/emails/emails-model';
import JobsModel from '../../models/jobs/jobs-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
import JobsValidation from '../../validations/jobs/jobs-validation';
import moment from 'moment';
import path from 'path';
import async from 'async';
import request from 'request';


// call entities
import { APP_REF_DATA } from "../../entities/common/app-ref-data";
import { ResumeMaster } from "../../entities/profileManagement/resume-master";
import { JobReferral } from "../../entities/jobs/job-referral";
import { JobResume } from "../../entities/jobs/job-resume";
import { ClientJobMaster } from "../../entities/jobs/client-job-master";
import { CandidateSubmittedDocs } from "../../entities/profileManagement/candidate-submitted-docs";
import { CandidateReferral } from "../../entities/referrals/candidate-referral";
import { Candidate_ResumeAndDoc } from "../../entities/profileManagement/candidate-resume-and-doc";
import { EmployeeDetails } from "../../entities/profileManagement/employee-details";
import { CandidateContact } from "../../entities/jobs/candidate-contact";

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    jobsModel = new JobsModel(),
    userModel = new UserModel(),
    profileManagementModel = new ProfileManagementModel(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    emailModel = new EmailModel(),
    jobsValidation = new JobsValidation();

export default class JobsReferralController {
    constructor() { }


    /**
    * check if job is reffered or not
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
    */

    checkReferredByEmail(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let emailId = req.body.email;
        let jobId = req.body.jobId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!emailId || !commonMethods.validateEmailid(emailId)) {
            msgCode.push('email');
        }
        if (!jobId || !commonMethods.isValidInteger(jobId)) {
            msgCode.push('jobId');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            jobsModel.checkJobReferral(emailId, jobId)
                .then((rmData) => {
                    if (!rmData) {
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [] } });
                        res.status(200).json(response);
                    }
                    else {
                        response = responseFormat.getResponseMessageByCodes(['email:emailReferred'], { code: 417 });
                        res.status(200).json(response);
                    }
                })
        }
    }


    /**
     * Refer any Job 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    referJob(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let resumeVars = enums.uploadType.userResume;
        let resumeObj = {
            jobId: req.body.jobId,
            firstName: req.body.firstName ? req.body.firstName.trim() : '',
            lastName: req.body.lastName ? req.body.lastName.trim() : '',
            phone: req.body.phone,
            emailId: req.body.email,
            resumeName: req.body.resumeName,
            resumeFile: req.body.resumeFile
        };

        let response = responseFormat.createResponseTemplate();
        let msgCode = jobsValidation.referJob(resumeObj, resumeVars.allowedExt);

        let docTypeId = enums.uploadType.userResume.docTypeId;
        let loggedUser = {};
        let jobInfo = {};
        let existingUser = 0;
        let self = this;
        let jobRecruiterId = 0;

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            crudOperationModel.findModelByCondition(ClientJobMaster,
            {
                cjmJobId: resumeObj.jobId,
                cjmStatus: 'A'

            }).then(jobs => {
                if (jobs) {
                    crudOperationModel.findModelByCondition(ResumeMaster,{employeeDetailsId: employeeDetailsId})
                    .then(emp => {
                        loggedUser = emp;

                        if (emp.emailId == resumeObj.emailId) {
                            response = responseFormat.getResponseMessageByCodes(['email:invalidReferral'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else {
                            jobsModel.checkJobReferral(resumeObj.emailId, resumeObj.jobId)
                            .then((rmData) => {
                                if (!rmData) {
                                    async.waterfall([
                                        /*function (done) {
                                            if (loggedUser.recruiter) {
                                                // check if recruiter of referrer is active 

                                                crudOperationModel.findModelByCondition(EmployeeDetails,
                                                {
                                                    employeeDetailsId: emp.recruiter,
                                                    emp_status: enums.empStatus.activeStatus
                                                }).then(actEmp => {
                                                    if (actEmp) {
                                                        done(null);
                                                    }
                                                    else {
                                                        loggedUser.recruiter = enums.employeeDefaultValues.defaultRecruiter;
                                                        done(null);
                                                    }
                                                })
                                            }
                                            else {
                                                loggedUser.recruiter = enums.employeeDefaultValues.defaultRecruiter;
                                                done(null);
                                            }

                                        },*/
                                        function(done){
                                            // get job-recuiter and assign to candidate
                                            jobsModel.getJobDetailsById(resumeObj.jobId, employeeDetailsId)
                                            .then( rs => {
                                                if(rs.length)
                                                {   
                                                    jobRecruiterId = rs[0].recId;
                                                }
                                                else
                                                {
                                                    jobRecruiterId = enums.employeeDefaultValues.defaultRecruiter;
                                                }
                                                done();
                                            })
                                        },
                                        function (done) {
                                            accountModel.getUserByUserName(resumeObj.emailId)
                                                .then(user => {
                                                    if (user && user.length > 0 
                                                    && (user[0].jobSearchStatus == enums.referred.notLookingForOpportunity && user[0].availableDate >= new Date())) 
                                                    {
                                                        response = responseFormat.getResponseMessageByCodes(['email:notLookingForOpportunity'], { code: 417 });
                                                        res.status(200).json(response);
                                                    } 
                                                    else if (user && user.length > 0 && user[0].emp_status != enums.empStatus.activeStatus) {
                                                        response = responseFormat.getResponseMessageByCodes(['email:deActivateAccount'], { code: 417 });
                                                        res.status(200).json(response);
                                                    } 
                                                    else if (user && user.length > 0) {
                                                        existingUser = 1;
                                                        resumeObj.applicantEmployeeDetailsId = user[0].EmployeeDetails_Id;
                                                        resumeObj.resumeId = user[0].resumeId;
                                                        done(null);
                                                    }
                                                    else {
                                                        let userObj = {
                                                            firstName: resumeObj.firstName,
                                                            lastName: resumeObj.lastName,
                                                            email: resumeObj.emailId,
                                                            password: null,
                                                            empStatus: enums.empStatus.status,
                                                            isAccountActivated: enums.empStatus.inActive,
                                                            recruiter: jobRecruiterId, //loggedUser.recruiter,
                                                            phone: (resumeObj.phone) ? resumeObj.phone : '',
                                                            entityGroup: enums.employeeDefaultValues.defaultEntityGroup,
                                                            sourceId: enums.employeeDefaultValues.defaultRefferedSourceGroupId,
                                                            jobSearchStatus: enums.employeeDefaultValues.defaultRefferedJobSearchStatus,
                                                            resumeMasterStatus: enums.resumeMasterStatus.Unverified
                                                        };

                                                        accountModel.signUp(userObj)
                                                            .then((users) => {
                                                                resumeObj.applicantEmployeeDetailsId = users[0].EmployeeDetails_Id;
                                                                resumeObj.resumeId = users[0].resumeId;
                                                                //done(null);
                                                                let referObj = {
                                                                    employeeDetailsId: employeeDetailsId,
                                                                    resumeId: resumeObj.resumeId,
                                                                    createdDate: new Date(),
                                                                    createdBy: employeeDetailsId
                                                                };
                                                                //insert record in CandidateReferral table in case of new user
                                                                crudOperationModel.saveModel(CandidateReferral, referObj, { referralId: 0 })
                                                                    .then((rs) => {

                                                                        // call Resume-Parser API 
                                                                        accountModel.parseResume(resumeObj.resumeId, resumeObj.resumeName, resumeObj.resumeFile, 'jobsreferral-controller/referJob')
                                                                            .then(parse => { })

                                                                        done(null);
                                                                    }).catch(error => {
                                                                        let resp = commonMethods.catchError('jobsreferral-controller/referjobs CandidateReferral process', error);
                                                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                                        res.status(resp.code).json(response);
                                                                    })

                                                            }).catch(error => {
                                                                let resp = commonMethods.catchError('jobsreferral-controller/referjobs upload file process', error);
                                                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                                res.status(resp.code).json(response);
                                                            })
                                                    }
                                                })
                                        },
                                        function (done) {
                                            commonMethods.fileUpload(resumeObj.resumeFile, resumeObj.resumeName, resumeVars.docTypeId)
                                                .then((docFileUpload) => {
                                                    if (docFileUpload.isSuccess) {
                                                        done(null, docFileUpload);
                                                    }
                                                    else {
                                                        response = responseFormat.getResponseMessageByCodes(['resumeName:' + docFileUpload.msgCode[0]], { code: 417 });
                                                        res.status(200).json(response);
                                                    }
                                                });

                                        },
                                        function (docFileUpload, done) {
                                            let resumeDoc = {
                                                resumeId: resumeObj.resumeId,
                                                filePath: docFileUpload.fileName,
                                                fileName: resumeObj.resumeName,
                                                isPrimary: 1,
                                                docType: enums.doc.type.resume,
                                                createdBy: employeeDetailsId,
                                                createdDate: new Date()
                                            };

                                            profileManagementModel.updateCandidateResume(resumeDoc)
                                                .then(rs => {
                                                    done(null, rs)
                                                }).catch(error => {
                                                    let resp = commonMethods.catchError('jobsreferrals-controller/JobReferral process', error);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })
                                        },
                                        function (rs, done) {

                                            let jobResumeObj = {
                                                jobId: resumeObj.jobId,
                                                candidateDocId: rs.candidateDocId,
                                                applicantEmployeeDetailsId: resumeObj.applicantEmployeeDetailsId,
                                                applicantResumeId: resumeObj.resumeId,
                                                loggedInEmployeeDetailsId: employeeDetailsId,
                                                isJobReferral: 1,
                                                candidateEmail : resumeObj.emailId
                                            };
                                            jobsModel.applyAndRefferJobsSubmission(jobResumeObj)
                                                .then((data) => {
                                                    done(null);
                                                }).catch(error => {
                                                    let resp = commonMethods.catchError('jobsreferrals-controller/JobReferral', error);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })
                                        },
                                        function (done) {
                                            jobsModel.getJobLocationAndKeywordByJobId(resumeObj.jobId)
                                                .then(rs3 => {
                                                    if (rs3.length) {
                                                        jobInfo = rs3[0];
                                                        jobsModel.getJobsCountByKeywordLocation(rs3[0].location, rs3[0].keywords)
                                                            .then(rs4 => {
                                                                done(null, rs4)
                                                            }).catch(error => {
                                                                let resp = commonMethods.catchError('jobsreferrals-controller/JobReferral getJobLocationAndKeywordByJobId', error);
                                                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                                res.status(resp.code).json(response);
                                                            })
                                                    }
                                                    else {
                                                        done(null, 0)
                                                    }
                                                })
                                        }
                                    ], function (error, result) {
                                        if (error) {
                                            let resp = commonMethods.catchError('jobsreferrals-controller/upload resume process.', error);
                                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                            res.status(resp.code).json(response);
                                        }
                                        else {

                                            self.sendJobReferMail(loggedUser, resumeObj, jobInfo, existingUser, employeeDetailsId, resumeObj.applicantEmployeeDetailsId, 'jobreferrral-controller referJob')
                                            
                                            let data = {
                                                similarJobCount: result,
                                                refferedMessage: enums.referred.refferedMessage,
                                                jobId: resumeObj.jobId
                                            };
                                            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [data] } });
                                            res.status(200).json(response);
                                        }
                                    })

                                }
                                else {
                                    response = responseFormat.getResponseMessageByCodes(['email:emailReferred'], { code: 417 });
                                    res.status(200).json(response);
                                }
                            })

                        }
                    })
                } else {
                    response = responseFormat.getResponseMessageByCodes(['errorText:inactiveJob'], { code: 417 });
                    res.status(200).json(response);
                }
            })
        }

    }

    /**
     * Refer Job to registered user by userid
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    referJobToRegisteredUser(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let jobId = req.body.jobId;
        let userId = req.body.userId;

        let response = responseFormat.createResponseTemplate();

        let msgCode = [];
        let loggedUser = {};
        let jobInfo = {};
        let userData = {};
        let self = this;

        if (!jobId || ~~jobId < 1) {
            msgCode.push('jobId')
        }
        if (!userId || ~~userId < 1) {
            msgCode.push('userId')
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            crudOperationModel.findModelByCondition(ClientJobMaster,
            {
                cjmJobId: jobId,
                cjmStatus: 'A'

            }).then(jobs => {
                if (jobs) {
                    crudOperationModel.findModelByCondition(ResumeMaster, { employeeDetailsId: employeeDetailsId })
                    .then(emp => {
                        loggedUser = emp;
                        if (emp.jobSearchStatus == enums.referred.notLookingForOpportunity && emp.availableDate >= new Date())
                        {
                            response = responseFormat.getResponseMessageByCodes(['errorText:notLookingForOpportunity'], { code: 417 });
                            res.status(200).json(response);
                        } 
                        else if (emp.employeeDetailsId == userId) {
                            response = responseFormat.getResponseMessageByCodes(['userId:invalidReferral'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else {
                            jobsModel.checkJobReferralByUserId(userId, jobId)
                            .then((rmData) => {
                                if (!rmData) {
                                    async.waterfall([                                        
                                        function (done) {
                                            crudOperationModel.findAllByCondition(EmployeeDetails, { employeeDetailsId: userId })
                                            .then(user => {
                                                if (user && user.length > 0 && user[0].empStatus != enums.empStatus.activeStatus) {
                                                    response = responseFormat.getResponseMessageByCodes(['errorText:deActivateAccount'], { code: 417 });
                                                    res.status(200).json(response);
                                                }
                                                else if (user && user.length > 0) {
                                                    userData = user[0];
                                                    crudOperationModel.findAllByCondition(ResumeMaster, { employeeDetailsId: userId })
                                                    .then(rdata => {
                                                        if (rdata.length) {
                                                            userData.resumeId = rdata[0].resumeId;
                                                            done(null);
                                                        }
                                                        else {
                                                            // if entry is not available in resume master
                                                            response = responseFormat.getResponseMessageByCodes(['errorText:invalidUser'], { code: 417 });
                                                            res.status(200).json(response);
                                                        }
                                                    })
                                                }
                                                else {
                                                    // if entry is not in employeedetails                                                  
                                                    response = responseFormat.getResponseMessageByCodes(['errorText:invalidUser'], { code: 417 });
                                                    res.status(200).json(response);
                                                }
                                            })
                                        },
                                        function (done) {

                                            let jobResumeObj = {
                                                jobId: jobId,
                                                applicantEmployeeDetailsId: userId,
                                                applicantResumeId: userData.resumeId,
                                                loggedInEmployeeDetailsId: employeeDetailsId,
                                                isJobReferral: 1,
                                                candidateEmail : loggedUser.emailId
                                            };
                                            jobsModel.applyAndRefferJobsSubmission(jobResumeObj)
                                                .then((data) => {
                                                    done(null);
                                                }).catch(error => {
                                                    let resp = commonMethods.catchError('jobsreferrals-controller/JobReferral Registered user', error);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })
                                        },
                                        function (done) {
                                            jobsModel.getJobLocationAndKeywordByJobId(jobId)
                                            .then(rs3 => {
                                                if (rs3.length) {
                                                    jobInfo = rs3[0];
                                                    done(null, jobInfo)                                                        
                                                }
                                                else {
                                                    done(null, {})
                                                }
                                            })
                                        },
                                        function(jobInfo, done){
                                            // UPDATE CANDIDATE RECRUITER WITH JOB-RECRUITER
                                            jobsModel.updateRecruiter(jobId, userId)
                                            .then( rs => {
                                                done(null, jobInfo)
                                            })
                                        },
                                    ], function (error, result) {
                                        if (error) {
                                            let resp = commonMethods.catchError('jobsreferrals-controller/upload resume process.', error);
                                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                            res.status(resp.code).json(response);
                                        }
                                        else {
                                            self.sendJobReferMail(loggedUser, userData, jobInfo, 1, employeeDetailsId, userId, 'jobreferrral-controller referJobToRegisteredUser')

                                            response = responseFormat.getResponseMessageByCodes(['success:reffered']);
                                            res.status(200).json(response);
                                        }
                                    })

                                }
                                else {
                                    response = responseFormat.getResponseMessageByCodes(['userId:emailReferred'], { code: 417 });
                                    res.status(200).json(response);
                                }
                            })

                        }
                    })
                } else {
                    response = responseFormat.getResponseMessageByCodes(['errorText:inactiveJob'], { code: 417 });
                    res.status(200).json(response);
                }
            })
        }

    }

    /**
     * Get all resume document list of user
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getResumeList(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        jobsModel.getResumeDocumentList(employeeDetailsId)
            .then(list => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: list } });
                res.status(200).json(response);
            })
    }

    /**
     * Apply job logged in user with new resume 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    applyWithResume(resumeObj, next) {
        let msgCode = [];
        let resp = {
            statusCode: 400,
            responseFormat: responseFormat.createResponseTemplate()
        };
        let self = this;

        let resumeVars = enums.uploadType.userResume;
        let recruiterData = {};
        let candidateDocId = 0;
        let alreadyReferred = 0;

        if (!resumeObj.jobId || (!commonMethods.isValidInteger(resumeObj.jobId))) {
            msgCode.push('jobId');
        }
        // if (!resumeObj.resumeTitle) {
        //     msgCode.push('resumeTitle:invalidTitle');
        // }
        if (!resumeObj.resumeName || !resumeObj.resumeFile || (!commonMethods.validateFileType(resumeObj.resumeFile, resumeObj.resumeName, resumeVars.allowedExt))) {
            msgCode.push('resumeName:resume');
        }

        if (msgCode.length) {
            resp.statusCode = 200;
            resp.responseFormat = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            next(resp);
        }
        else {

            jobsModel.checkJobAppliedByEmployeeDetailsId(resumeObj.employeeDetailsId, resumeObj.jobId)
            .then((rmData) => {
                if (!rmData) {
                    async.waterfall([
                        function (done) {
                            commonMethods.fileUpload(resumeObj.resumeFile, resumeObj.resumeName, resumeVars.docTypeId)
                            .then((docFileUpload) => {
                                if (docFileUpload.isSuccess) {
                                    done(null, docFileUpload);
                                }
                                else {
                                    resp.statusCode = 200;
                                    resp.responseFormat = responseFormat.getResponseMessageByCodes(['resumeName:' + docFileUpload.msgCode[0]], { code: 417 });
                                    next(resp);
                                }
                            })
                        },
                        function (docFileUpload, done) {
                            profileManagementModel.getUserProfileById(resumeObj.employeeDetailsId)
                            .then(user => {
                                if (user) {
                                    recruiterData = user.recruiterDetails;
                                    resumeObj.applicantEmployeeDetailsId = user.employeeDetailsId;
                                    resumeObj.resumeId = user.resumeId;
                                    resumeObj.firstName = user.firstName;
                                    resumeObj.lastName = user.lastName;
                                    resumeObj.emailId = user.emailId;
                                    resumeObj.phone = user.contactNumber;
                                    done(null, docFileUpload)
                                }
                                else {
                                    let userObj = {
                                        firstName: resumeObj.firstName,
                                        lastName: resumeObj.lastName,
                                        email: resumeObj.emailId,
                                        password: null,
                                        empStatus: enums.empStatus.status,
                                        isAccountActivated: enums.empStatus.inActive,
                                        recruiter: loggedUser.recruiter,
                                        phone: (resumeObj.phone) ? resumeObj.phone : '',
                                        entityGroup: enums.employeeDefaultValues.defaultEntityGroup,
                                        sourceId: enums.employeeDefaultValues.defaultRefferedSourceGroupId,
                                        jobSearchStatus: enums.employeeDefaultValues.defaultRefferedJobSearchStatus,
                                        resumeMasterStatus: enums.resumeMasterStatus.Unverified
                                    };

                                    accountModel.signUp(userObj)
                                    .then((users) => {
                                        resumeObj.applicantEmployeeDetailsId = users[0].EmployeeDetails_Id;
                                        resumeObj.resumeId = users[0].resumeId;
                                        done(null, docFileUpload)
                                    }).catch(error => {
                                        let response = commonMethods.catchError('jobsreferrals-controller/applywithresume process.', error);
                                        resp.statusCode = response.code;
                                        resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                        next(resp);
                                    })
                                }
                            })
                        },
                        function (docFileUpload, done) {

                            let resumeDoc = {
                                resumeId: resumeObj.resumeId,
                                filePath: docFileUpload.fileName, 
                                fileName: resumeObj.resumeTitle || resumeObj.resumeName, 
                                isPrimary: 1,
                                docType: enums.doc.type.resume,
                                createdBy: resumeObj.employeeDetailsId,
                                createdDate: new Date()
                            };

                            profileManagementModel.updateCandidateResume(resumeDoc)
                            .then(rs => {

                                // call Resume-Parser API,
                                accountModel.parseResume(resumeObj.resumeId, resumeObj.resumeName, resumeObj.resumeFile, 'jobsreferral-controller/applyWithResume')
                                .then(parse => { })

                                done(null, rs)
                            }).catch(error => {
                                let response = commonMethods.catchError('jobsreferrals-controller/JobReferral process.', error);
                                resp.statusCode = response.code;
                                resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                next(resp);
                            })
                        },
                        function(rs, done) {
                            // check if job referred by someone  
                            crudOperationModel.findModelByCondition(JobReferral, {jobId : resumeObj.jobId, candidateEmail : resumeObj.emailId})
                            .then( rss => {
                                if(rss)
                                {
                                    alreadyReferred = 1;
                                    done(null, rs)
                                }
                                else
                                {
                                    done(null, rs);
                                }
                            })
                        },
                        function(rs, done) {
                            // insert in job Refer if uid is present in request body
                            if(resumeObj.uid && !alreadyReferred)
                            {
                                commonMethods.decrypt(resumeObj.uid)
                                .then( dec => {
                                    if(dec)
                                    {
                                        let userData = dec.split('||');

                                        let diffInDays = (new Date().getTime() - userData[3])/(24*60*60*1000); 

                                        if(userData[0] == 'JOBSHAREDBY' && diffInDays <= enums.referValidity && resumeObj.jobId == userData[2])
                                        {
                                            crudOperationModel.findModelByCondition(ClientJobMaster, { cjmJobId : resumeObj.jobId })
                                            .then( j => {
                                                crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : userData[1]})
                                                .then( user => {
                                                    let jobShareData = {
                                                        jobId: resumeObj.jobId, 
                                                        referrerResumeId : user.resumeId,
                                                        createdDate : new Date(),
                                                        candidateEmail : resumeObj.emailId,
                                                        candidateName : resumeObj.firstName + ' ' + resumeObj.lastName,
                                                        status : enums.jobReferStatus.referred,
                                                        applicableBonus : j.referralBonus
                                                    }
                                                    crudOperationModel.saveModel(JobReferral, jobShareData, {jobId : resumeObj.jobId, candidateEmail : resumeObj.email})
                                                    .then( refer => {
                                                        done(null, rs)
                                                    })
                                                })
                                            })
                                        }
                                        else
                                        {
                                            done(null, rs)
                                        }
                                    }
                                    else
                                    {
                                        done(null, rs)
                                    }
                                }).catch(err => {
                                    done(null, rs)
                                })
                            }
                            else
                            {
                                done(null, rs)
                            }
                        },
                        function (rs, done) {

                            // In job apply logged in user and applicant are same
                            let jobResumeObj = {
                                jobId: resumeObj.jobId,
                                candidateDocId: rs.candidateDocId,
                                applicantEmployeeDetailsId: resumeObj.employeeDetailsId,
                                applicantResumeId: resumeObj.resumeId,
                                loggedInEmployeeDetailsId: resumeObj.employeeDetailsId,
                                source: ((resumeObj.ref && resumeObj.ref.source) ? ~~resumeObj.ref.source : null),
                                entity: ((resumeObj.ref && resumeObj.ref.entity) ? ~~resumeObj.ref.entity : null),
                                candidateEmail: resumeObj.emailId
                            };
                            
                            candidateDocId = rs.candidateDocId;

                            jobsModel.applyAndRefferJobsSubmission(jobResumeObj)
                            .then((data) => {
                                done();
                            }).catch(error => {
                                let response = commonMethods.catchError('jobsreferrals-controller/applyWithResume process.', error);
                                resp.statusCode = response.code;
                                resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                next(resp);
                            })
                        },
                        function(done){
                            // UPDATE CANDIDATE RECRUITER WITH JOB-RECRUITER
                            jobsModel.updateRecruiter(resumeObj.jobId, resumeObj.employeeDetailsId)
                            .then( rs => {

                                resumeObj['candidateDocId'] = candidateDocId;
                                // send jobs mail to applicant and recuruiter
                                self.sendJobApplyMail(resumeObj, 'jobsreferrals-controller/applyWithResume mail process.')

                                let rsp = {
                                    employeeDetailsId: resumeObj.employeeDetailsId
                                };
                                resp.statusCode = 200;
                                resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:jobApplied'], { content: { dataList: [rsp] } });

                                // resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:jobApplied']);
                                next(resp);
                            })
                        }

                    ],
                        function (error, rs) {
                            if (error) {
                                let response = commonMethods.catchError('jobsreferrals-controller/applyWithResume process.', error);
                                resp.statusCode = response.code;
                                resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                next(resp);
                            }
                            else {
                                next(rs);
                            }
                        })
                }
                else {
                    resp.statusCode = 200;
                    resp.responseFormat = responseFormat.getResponseMessageByCodes(['alreadyApplied'], { code: 417 });
                    next(resp);
                }
            });
        }


    }

    /**
     * Apply job non logged in user
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    applyJobWithoutLogin(resumeObj, next) {

        let self = this;
        let resp = {
            statusCode: 400,
            responseFormat: responseFormat.createResponseTemplate()
        };
        let resumeVars = enums.uploadType.userResume;
        let msgCode = jobsValidation.applyJob(resumeObj, resumeVars.allowedExt);
        let recruiterId = 0;
        let recruiterName = '';
        let isNewUser = 0;
        let alreadyReferred = 0;

        if (msgCode.length) {
            resp.statusCode = 200;
            resp.responseFormat = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            next(resp);
        }
        else {
            jobsModel.checkJobAppliedByEmail(resumeObj.emailId, resumeObj.jobId)
                .then((rmData) => { 
                    if (!rmData.applied) {
                        async.waterfall([
                            function(done){
                                // check existing user or not 
                                // IF existing user and assinged default rectures then assing job-recruiter to user ELSE recruiter remain same
                                // ELSE assing job recruiter to user
                                accountModel.getUserByUserName(resumeObj.emailId)
                                .then(user => {
                                    if (user && user.length > 0 ) 
                                    {
                                        // get job-recuiter and assign to candidate
                                        if(enums.defaultRecruiters.indexOf(user[0].recId) > -1 )
                                        {
                                            jobsModel.getJobDetailsById(resumeObj.jobId, 0)
                                            .then( rs => {
                                                if(rs.length)
                                                {   
                                                    recruiterId = rs[0].recId || enums.employeeDefaultValues.defaultRecruiter;
                                                }
                                                else
                                                {
                                                    recruiterId = enums.employeeDefaultValues.defaultRecruiter;
                                                }
                                                done();
                                            })
                                        }
                                        else
                                        {
                                            recruiterId = user[0].recId;
                                            done()
                                        }
                                    }
                                    else
                                    {
                                        isNewUser = 1;
                                        jobsModel.getJobDetailsById(resumeObj.jobId, 0)
                                        .then( rs => {
                                            if(rs.length)
                                            {   
                                                recruiterId = rs[0].recId || enums.employeeDefaultValues.defaultRecruiter;
                                            }
                                            else
                                            {
                                                recruiterId = enums.employeeDefaultValues.defaultRecruiter;
                                            }
                                            done();
                                        })
                                    }
                                })
                                
                            },
                            function(done) {
                                // check if job referred by someone then remove uid from object
                                crudOperationModel.findModelByCondition(JobReferral, {jobId : resumeObj.jobId, candidateEmail : resumeObj.emailId})
                                .then( rs => {
                                    if(rs)
                                    {
                                        alreadyReferred = 1;
                                        done();
                                    }
                                    else
                                    {
                                        done();
                                    }
                                })
                            },
                            function(done) {
                                // insert in job Refer if uid is present in request body
                                if(resumeObj.uid && !alreadyReferred)
                                {
                                    commonMethods.decrypt(resumeObj.uid)
                                    .then( dec => {
                                        if(dec)
                                        { 
                                            let userData = dec.split('||'); 
                                            
                                            let diffInDays = (new Date().getTime() - userData[3])/(24*60*60*1000); 
                                            
                                            // check if user referred job and applying for self reffered job 

                                            if(userData[0] == 'JOBSHAREDBY' && userData[1] != rmData.employeeDetailsId && diffInDays <= enums.referValidity && resumeObj.jobId == userData[2])
                                            {
                                                crudOperationModel.findModelByCondition(ClientJobMaster, { cjmJobId : resumeObj.jobId })
                                                .then( j => {
                                                    crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : userData[1]})
                                                    .then( user => {
                                                        let jobShareData = {
                                                            jobId: resumeObj.jobId, 
                                                            referrerResumeId : user.resumeId,
                                                            createdDate : new Date(),
                                                            candidateEmail : resumeObj.emailId,
                                                            candidateName : resumeObj.firstName,
                                                            status : enums.jobReferStatus.referred,
                                                            isSocialShare : 1,
                                                            applicableBonus : j.referralBonus
                                                        }
                                                        crudOperationModel.saveModel(JobReferral, jobShareData, {jobId : resumeObj.jobId, candidateEmail : resumeObj.emailId})
                                                        .then( refer => {
                                                            done()
                                                        })
                                                    })
                                                })
                                            }
                                            else
                                            {
                                                done()
                                            }
                                        }
                                        else
                                        {
                                            done()
                                        }
                                    }).catch(err => {
                                        done()
                                    })
                                }
                                else
                                {
                                    done()
                                }
                            },
                            function(done) {
                                // update Invitation table in case of new user only and user come from social media refer
                                if(isNewUser && resumeObj.uid)
                                { 
                                    commonMethods.decrypt(resumeObj.uid)
                                    .then( dec => {
                                        if(dec)
                                        { 
                                            let userData = dec.split('||'); 
                                            let referrerInvite = false;
                                            
                                            let diffInDays = (new Date().getTime() - userData[3])/(24*60*60*1000); 
                                            
                                            // check if user referred job and applying for self reffered job 
                                            
                                            if(userData[0] == 'JOBSHAREDBY' && userData[1] != rmData.employeeDetailsId && diffInDays <= enums.referValidity && resumeObj.jobId == userData[2])
                                            {   
                                                crudOperationModel.findModelByCondition(CandidateContact, {
                                                    contactEmail : resumeObj.emailId, 
                                                    invitationDate : {$ne : null },
                                                    status : { $ne : null},
                                                }).then( inv => {
                                                    if(inv)
                                                    { 
                                                        // check if invitation if 90 days older 
                                                        let diff = (new Date().getTime() - new Date(inv.invitationDate).getTime())/(24*60*60*1000); 
            
                                                        if(diff > enums.referValidity)
                                                        {
                                                            // create invitation by referrer
                                                            referrerInvite = true
                                                        }
                                                    }
                                                    else
                                                    {
                                                        //create invitation by referrer
                                                        referrerInvite = true
                                                    }

                                                    if(referrerInvite)
                                                    {   
                                                        // get referrer resumeId
                                                        crudOperationModel.findModelByCondition( ResumeMaster, {employeeDetailsId : userData[1]})
                                                        .then( r => {

                                                            let inviteData = {
                                                                candidateResumeId : r.resumeId,
                                                                contactName : resumeObj.firstName + ' ' + resumeObj.lastName || '',
                                                                contactEmail : resumeObj.emailId,
                                                                invitationDate : new Date(),
                                                                status : enums.contactStatus.invited,
                                                                createdDate : new Date(),
                                                                isSocialShare : 1, 
                                                                jobId : resumeObj.jobId,
                                                                applicableBonus : enums.sponsoreBonus
                                                            }
    
                                                            crudOperationModel.saveModel(CandidateContact, inviteData, {candidateResumeId : userData[1], contactEmail : resumeObj.emailId})
                                                            .then( inv1 => {
                                                                done()
                                                            })
                                                        })
                                                    }
                                                    else
                                                    {
                                                        done()
                                                    }
                                                })
                                            }
                                            else
                                            {
                                                done()
                                            }
                                        }
                                        else
                                        {
                                            done()
                                        }
                                    })

                                    
                                }
                                else
                                {
                                    done()
                                }
                            },                            
                            function (done) {
                                accountModel.getUserByUserName(resumeObj.emailId)
                                .then(user => {
                                    if (user && user.length > 0 && user[0].emp_status != enums.empStatus.activeStatus) 
                                    {
                                        resp.statusCode = 200;
                                        resp.responseFormat = responseFormat.getResponseMessageByCodes(['accountNotActivated:deActivateAccount'], { code: 417 });
                                        next(resp);
                                    } 
                                    else if (user && user.length > 0) 
                                    {
                                        resumeObj.employeeDetailsId = user[0].EmployeeDetails_Id;
                                        resumeObj.resumeId = user[0].resumeId;
                                        done(null);
                                    } 
                                    else 
                                    {
                                        isNewUser = 1;
                                        let userObj = {
                                            firstName: resumeObj.firstName,
                                            lastName: resumeObj.lastName,
                                            email: resumeObj.emailId,
                                            password: null,
                                            empStatus: enums.empStatus.status,
                                            isAccountActivated: enums.empStatus.inActive,
                                            phone: (resumeObj.phone) ? resumeObj.phone : '',
                                            entityGroup: ((resumeObj.ref && resumeObj.ref.entity) ? ~~resumeObj.ref.entity : enums.employeeDefaultValues.defaultEntityGroup),
                                            sourceId: ((resumeObj.ref && resumeObj.ref.source) ? ~~resumeObj.ref.source : enums.employeeDefaultValues.defaultRefferedSourceGroupId),
                                            jobSearchStatus: enums.employeeDefaultValues.defaultRefferedJobSearchStatus,
                                            resumeMasterStatus: enums.resumeMasterStatus.Unverified,
                                            recruiter : recruiterId
                                        };
                                        accountModel.signUp(userObj)
                                        .then((users) => {
                                            resumeObj.employeeDetailsId = users[0].EmployeeDetails_Id;
                                            resumeObj.resumeId = users[0].resumeId;

                                            // call Resume-Parser API 
                                            accountModel.parseResume(resumeObj.resumeId, resumeObj.resumeName, resumeObj.resumeFile, 'jobsreferral-controller/applyJobWithoutLogin')
                                                .then(parse => { })

                                            done(null);
                                        }).catch(error => {
                                            let response = commonMethods.catchError('jobsreferrals-controller/applyJobWithoutLogin signup process.', error);
                                            resp.statusCode = response.code;
                                            resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                            next(resp);
                                        })

                                    }
                                })
                            },
                            function (done) {
                                commonMethods.fileUpload(resumeObj.resumeFile, resumeObj.resumeName, resumeVars.docTypeId)
                                    .then((docFileUpload) => {
                                        if (docFileUpload.isSuccess) {
                                            done(null, docFileUpload);
                                        }
                                        else {
                                            resp.statusCode = 200;
                                            resp.responseFormat = responseFormat.getResponseMessageByCodes(['resumeName:' + docFileUpload.msgCode[0]], { code: 417 });
                                            next(resp);
                                        }
                                    }).catch(error => {
                                        let response = commonMethods.catchError('jobsreferrals-controller/JobReferral upload file process.', error);
                                        resp.statusCode = response.code;
                                        resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                        next(resp);
                                    })
                            },
                            function (docFileUpload, done) {
                                let resumeDoc = {
                                    resumeId: resumeObj.resumeId,
                                    filePath: docFileUpload.fileName, 
                                    fileName: resumeObj.resumeTitle || resumeObj.resumeName,
                                    isPrimary: 1,
                                    docType: enums.doc.type.resume,
                                    createdBy: resumeObj.employeeDetailsId,
                                    createdDate: new Date()
                                };
                                //console.log(resumeDoc);
                                return;
                                profileManagementModel.updateCandidateResume(resumeDoc)
                                    .then(rs => {
                                        done(null, rs)
                                    }).catch(error => {
                                        let response = commonMethods.catchError('jobsreferrals-controller/JobReferral process', error);
                                        resp.statusCode = response.code;
                                        resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                        next(resp);
                                    })
                            },
                            function(rs, done) {
                                // get Recruiter name for new user 
                                
                                crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : recruiterId})
                                .then( rs1 => { 
                                    if(rs1)
                                    {   
                                        recruiterName = rs1.firstName + ' ' + rs1.lastName;
                                    }
                                    done(null, rs)
                                })
                            },
                            function (rs, done) {
                                // In job apply logged in user and applicant are same
                                let jobResumeObj = {
                                    jobId: resumeObj.jobId,
                                    candidateDocId: rs.candidateDocId,
                                    applicantEmployeeDetailsId: resumeObj.employeeDetailsId,
                                    applicantResumeId: resumeObj.resumeId,
                                    loggedInEmployeeDetailsId: resumeObj.employeeDetailsId,
                                    source: ((resumeObj.ref && resumeObj.ref.source) ? ~~resumeObj.ref.source : null),
                                    entity: ((resumeObj.ref && resumeObj.ref.entity) ? ~~resumeObj.ref.entity : null),
                                    candidateEmail: resumeObj.emailId
                                };
                               
                                jobsModel.applyAndRefferJobsSubmission(jobResumeObj)
                                    .then((data) => {

                                        // add docId in resumeObj
                                        resumeObj['candidateDocId'] = rs.candidateDocId;

                                        let template = isNewUser ? enums.emailConfig.codes.jobApplyNewUser.code : null ;

                                        self.sendJobApplyMail(resumeObj, 'jobsreferral-controller/applyJobWithoutLogin applicant-mail', template);

                                        // resp.statusCode = 200;
                                        // resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:jobApplied']);

                                        let rsp = {
                                            employeeDetailsId: resumeObj.employeeDetailsId,
                                            isNewUser : isNewUser, 
                                            recruiterName : recruiterName
                                        };
                                        resp.statusCode = 200;
                                        resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:jobApplied'], { content: { dataList: [rsp] } });

                                        next(resp);

                                    }).catch(error => {
                                        let response = commonMethods.catchError('jobsreferrals-controller/applyJobWithoutLogin applyAndRefferJobsSubmission', error);
                                        resp.statusCode = response.code;
                                        resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                        next(resp);
                                    })
                            }
                        ], function (error, result) {
                            if (error) {
                                let response = commonMethods.catchError('jobsreferrals-controller/upload resume process', error);
                                resp.statusCode = response.code;
                                resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                next(resp);
                            }
                            else {

                                resp.statusCode = 200;
                                resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:jobApplied']);
                                next(resp);
                            }
                        })

                    }
                    else {
                        resp.statusCode = 200;
                        resp.responseFormat = responseFormat.getResponseMessageByCodes(['email:alreadyApplied'], { code: 417 });
                        next(resp);
                    }
                })
        }

    }


    /**
     * Apply job logged in user with existing Resume
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */


    applyJobWithLogin(inputObj, next) {

        let self = this;
        let resp = {
            statusCode: 400,
            responseFormat: responseFormat.createResponseTemplate()
        };

        let msgCode = [];
        let user = {};
        let loggerUser = {}
        let alreadyReferred = 0;

        if (!inputObj.jobId && !commonMethods.isValidInteger(inputObj.jobId)) {
            msgCode.push('jobId');
        }
        if (!inputObj.candidateDocId && !commonMethods.isValidInteger(inputObj.candidateDocId)) {
            msgCode.push('candidateDocId');
        }

        if (msgCode.length) {
            resp.statusCode = 200;
            resp.responseFormat = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            next(resp);
        }
        else {
            // check for invalid OR valid resume Id
            jobsModel.checkValidResumeId(inputObj.employeeDetailsId, inputObj.candidateDocId)
                .then(resume => {
                    if (!resume.length) {
                        resp.statusCode = 200;
                        resp.responseFormat = responseFormat.getResponseMessageByCodes(['candidateDocId'], { code: 417 });
                        next(resp);
                    }
                    else {
                        jobsModel.checkJobAppliedByEmployeeDetailsId(inputObj.employeeDetailsId, inputObj.jobId)
                        .then((rmData) => {
                            if (!rmData) {


                                async.series([
                                    function(done)
                                    {
                                        // get logged user info 
                                        // if(inputObj.uid)
                                        // {
                                            crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : inputObj.employeeDetailsId})
                                            .then( user => {
                                                loggerUser = user;
                                                done()
                                            })
                                        // }
                                        // else
                                        // {
                                        //     done()
                                        // }
                                    },
                                    function(done) {
                                        // check if job referred by someone then remove uid from object
                                        crudOperationModel.findModelByCondition(JobReferral, {jobId : inputObj.jobId, candidateEmail : loggerUser.emailId})
                                        .then( rs => {
                                            if(rs)
                                            {
                                                alreadyReferred = 1;
                                                done();
                                            }
                                            else
                                            {
                                                done();
                                            }
                                        })
                                    },
                                    function(done) {
                                        // insert in job Refer if uid is present in request body
                                        if(inputObj.uid && !alreadyReferred)
                                        {
                                            commonMethods.decrypt(inputObj.uid)
                                            .then( dec => {
                                                if(dec)
                                                {
                                                    let userData = dec.split('||');

                                                    let diffInDays = (new Date().getTime() - userData[3])/(24*60*60*1000); 

                                                    if(userData[0] == 'JOBSHAREDBY' && diffInDays <= enums.referValidity && inputObj.jobId == userData[2])
                                                    {
                                                        crudOperationModel.findModelByCondition(ClientJobMaster, { cjmJobId : inputObj.jobId })
                                                        .then( j => {
                                                            crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : userData[1]})
                                                            .then( udata => {
                                                                let jobShareData = {
                                                                    jobId: inputObj.jobId, 
                                                                    referrerResumeId : udata.resumeId,
                                                                    createdDate : new Date(),
                                                                    candidateEmail : loggerUser.emailId,
                                                                    candidateName : loggerUser.firstName + ' ' + loggerUser.lastName,
                                                                    status : enums.jobReferStatus.referred,
                                                                    applicableBonus : j.referralBonus
                                                                }
                                                                crudOperationModel.saveModel(JobReferral, jobShareData, {jobId : inputObj.jobId, candidateEmail : loggerUser.email})
                                                                .then( refer => {
                                                                    done()
                                                                })
                                                            })
                                                        })
                                                    }
                                                    else
                                                    {
                                                        done()
                                                    }
                                                }
                                                else
                                                {
                                                    done()
                                                }
                                            }).catch(err => {
                                                done()
                                            })
                                        }
                                        else
                                        {
                                            done()
                                        }
                                    },
                                    function(done)
                                    {
                                        crudOperationModel.findModelByCondition(ResumeMaster,
                                        {
                                            employeeDetailsId: inputObj.employeeDetailsId
                                        }).then(resume => {
        
                                            // In job apply logged in user and applicant are same
                                            let jobResumeObj = {
                                                jobId: inputObj.jobId,
                                                candidateDocId: inputObj.candidateDocId,
                                                applicantEmployeeDetailsId: inputObj.employeeDetailsId,
                                                applicantResumeId: resume.resumeId,
                                                loggedInEmployeeDetailsId: inputObj.employeeDetailsId,
                                                source: ((inputObj.ref && inputObj.ref.source) ? ~~inputObj.ref.source : null),
                                                entity: ((inputObj.ref && inputObj.ref.entity) ? ~~inputObj.ref.entity : null),
                                                candidateEmail: resume.emailId
        
                                            };
                                            jobsModel.applyAndRefferJobsSubmission(jobResumeObj)
                                            .then((data) => {
        
                                                // UPDATE CANDIDATE RECRUITER WITH JOB-RECRUITER
        
                                                jobsModel.updateRecruiter(inputObj.jobId, inputObj.employeeDetailsId)
                                                .then( rs =>
                                                {
                                                    // resp.statusCode = 200;
                                                    // resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:jobApplied']);
        
                                                    let rsp = {
                                                        employeeDetailsId: inputObj.employeeDetailsId,
                                                        isNewUser : 0,
                                                        recruiterName : ''
                                                    };
                                                    resp.statusCode = 200;
                                                    resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:jobApplied'], { content: { dataList: [rsp] } });
        
                                                    next(resp);
                                                })
        
                                                // Email Send
                                                // get user-info 
                                                user.ref = inputObj.ref;
                                                profileManagementModel.getUserProfileById(inputObj.employeeDetailsId)
                                                .then(user => {
                                                    if (user) {
                                                        user.ref = {};
                                                        user.jobId = inputObj.jobId;
                                                        user.phone = user.contactNumber;
                                                        user.ref.source = jobResumeObj.source;
                                                        user.ref.entity = jobResumeObj.entity;
        
                                                        user['candidateDocId'] = inputObj.candidateDocId;
        
                                                        self.sendJobApplyMail(user, 'jobsreferral-controller/applyJobWithLogin recruiter-mail');
                                                    }
                                                })
                                                
                                            }).catch(error => {
                                                let response = commonMethods.catchError('jobsreferrals-controller/applyAndRefferJobsSubmission', error);
                                                resp.statusCode = response.code;
                                                resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                                next(resp);
                                            })
        
                                        }).catch(error => {
                                            let response = commonMethods.catchError('jobsreferrals-controller/applyJobWithLogin', error);
                                            resp.statusCode = response.code;
                                            resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                            next(resp);
                                        })
                                    }
                                ],function(error, result)
                                {
                                    if (error) {
                                        let response = commonMethods.catchError('jobsreferrals-controller/applyJobWithLogin enderr ', error);
                                        resp.statusCode = response.code;
                                        resp.responseFormat = responseFormat.getResponseMessageByCodes(response.message, { code: response.code });
                                        next(resp);
                                    }
                                    else {
        
                                        resp.statusCode = 200;
                                        resp.responseFormat = responseFormat.getResponseMessageByCodes(['success:jobApplied']);
                                        next(resp);
                                    }
                                })

                                
                            }
                            else {
                                resp.statusCode = 200;
                                resp.responseFormat = responseFormat.getResponseMessageByCodes(['alreadyApplied'], { code: 417 });
                                next(resp);
                            }
                        })
                    }
                })
        }
    }

    /**
     * Apply job (will call all methods accordingly)
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    applyJob(req, res, next) {
        let employeeDetailsId = req.tokenDecoded ? req.tokenDecoded.data.employeeDetailsId : 0;
        let response = responseFormat.createResponseTemplate();

        let msgCode = [];
        if (!req.body.jobId) {
            response = responseFormat.getResponseMessageByCodes(['jobId'], { code: 417 });
            res.status(200).json(response);

        } else {
            crudOperationModel.findModelByCondition(ClientJobMaster,
            {
                cjmJobId: req.body.jobId,
                cjmStatus: 'A'

            }).then(jobs => {
                if (jobs) 
                {
                    if (employeeDetailsId > 0) 
                    {
                        if (typeof req.body.candidateDocId == 'undefined') 
                        {
                            let resumeObj = {
                                employeeDetailsId: employeeDetailsId,
                                jobId: req.body.jobId,
                                resumeTitle: req.body.resumeTitle,
                                resumeName: req.body.resumeName,
                                resumeFile: req.body.resumeFile,
                                ref: req.body.refSource,
                                uid: req.body.uid
                            };

                            this.applyWithResume(resumeObj, function (response) {
                                res.status(response.statusCode).json(response.responseFormat);
                            })
                        }
                        else 
                        {
                            let inputObj = {
                                employeeDetailsId: employeeDetailsId,
                                jobId: req.body.jobId,
                                candidateDocId: req.body.candidateDocId,
                                ref: req.body.refSource,
                                uid: req.body.uid
                            };

                            this.applyJobWithLogin(inputObj, function (response) {
                                res.status(response.statusCode).json(response.responseFormat);
                            })
                        }

                    } 
                    else 
                    {
                        let resumeObj = {
                            employeeDetailsId: 0,
                            jobId: req.body.jobId,
                            firstName: req.body.firstName ? req.body.firstName.trim() : '',
                            lastName: req.body.lastName ? req.body.lastName.trim() : '',
                            phone: req.body.phone,
                            emailId: req.body.email,
                            resumeTitle: req.body.resumeTitle,
                            resumeName: req.body.resumeName,
                            resumeFile: req.body.resumeFile,
                            ref: req.body.refSource,
                            uid: req.body.uid
                        };

                        this.applyJobWithoutLogin(resumeObj, function (response) {
                            res.status(response.statusCode).json(response.responseFormat);
                        })
                    }
                } 
                else 
                {
                    response = responseFormat.getResponseMessageByCodes(['errorText:inactiveJob'], { code: 417 });
                    res.status(200).json(response);
                }
            })
        }
    }



    /**
     * my applications
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getApplications(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let applicationStatus = req.body.applicationStatus || 'active';
        let msgCode = [];
        let response = responseFormat.createResponseTemplate();

        if (['active', 'archive'].indexOf(applicationStatus) < 0) {
            msgCode.push('applicationStatus');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            jobsModel.getApplicationByEmployeeDetailsId(employeeDetailsId, applicationStatus)
                .then(apps => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: apps } });
                    res.status(200).json(response);
                })
        }

    }


    /**
     * inteview application
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getScheduledInterviewsList(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let applicationStatus = req.body.type || 'upcomming';
        let msgCode = [];
        let response = responseFormat.createResponseTemplate();

        if (['upcomming', 'past'].indexOf(applicationStatus) < 0) {
            msgCode.push('type');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            jobsModel.getInteviewApplications(employeeDetailsId, applicationStatus)
                .then(apps => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: apps } });
                    res.status(200).json(response);
                })
        }

    }

    /**
     * my referral list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getReferrals(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

       // let applicationStatus = req.body.applicationStatus || 'active';
        let msgCode = [];
        let response = responseFormat.createResponseTemplate();

        /*if (['active', 'archive'].indexOf(applicationStatus) < 0) {
            msgCode.push('applicationStatus');
        }*/

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            jobsModel.getReferredJobByEmployeeDetailsId(employeeDetailsId)//, applicationStatus)
                .then(apps => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: apps } });
                    res.status(200).json(response);
                })
        }
    }


    /**
     * job referral list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postJobRefer(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        let msgCode = [];
        let response = responseFormat.createResponseTemplate();
        let pageCount = req.body.pageCount ? req.body.pageCount : enums.paging.pageCount;
        let pageSize = req.body.pageSize ? req.body.pageSize : enums.paging.pageSize;

        if ((pageCount) && !commonMethods.isValidInteger(pageCount)) {
            msgCode.push('pageCount');
        }
        if ((pageSize) && !commonMethods.isValidInteger(pageSize)) {
            msgCode.push('pageSize');
        }
      
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            jobsModel.getAllReferredJobByEmployeeDetailsId(employeeDetailsId, pageCount, pageSize)
                .then(apps => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: apps } });
                    res.status(200).json(response);
                })
        }
    }

    /**
     * Send Job Application/Apply Emails 
     * @param {*} resumeObj : Object of user
     * @param {*} calledFrom : Called From Function name
     * @param {*} next : Callback argument
     */
    sendJobApplyMail(resumeObj, calledFrom, template) {
        
        // get Job-Email Data
     
        jobsModel.getJobLocationAndKeywordByJobId(resumeObj.jobId)
        .then(job => {
            if (job.length) 
            {
                let jobInfo = job[0];
                let body = [];
                let options = {};

                if(template && template == enums.emailConfig.codes.jobApplyNewUser.code)
                {
                    // create unique-code to verify user

                    let encKey = commonMethods.encrypt('SIGNUP||'+resumeObj.employeeDetailsId+'||'+resumeObj.emailId+'||'+new Date().getTime());

                    // Email to applicant candidate 
                    body = [
                        { name: "RECIPIENTFIRSTNAME", value: resumeObj.firstName },
                        { name: "JOBTITLE", value: jobInfo.jobTitle },
                        { name: "ENDCLIENTNAME", value: jobInfo.clientName },
                        { name: "JOBSTATE", value: jobInfo.state },
                        { name: "UNIQUECODE", value: encKey }
                    ];
                    options = {
                        mailTemplateCode: enums.emailConfig.codes.jobApplyNewUser.code,
                        toMail: [{ mailId: resumeObj.emailId, displayName: resumeObj.firstName, employeeId: resumeObj.employeeDetailsId }],
                        placeHolders: body,
                        replyToEmailid: 'SUPPORTMAILID'
                    };
                }
                else
                {
                    // Email to applicant candidate 
                    body = [
                        { name: "RECIPIENTFIRSTNAME", value: resumeObj.firstName },
                        { name: "JOBTITLE", value: jobInfo.jobTitle },
                        { name: "ENDCLIENTNAME", value: jobInfo.clientName },
                        { name: "JOBSTATE", value: jobInfo.state },
                        { name: "JOBID", value: jobInfo.jobId }
                    ];
                    options = {
                        mailTemplateCode: enums.emailConfig.codes.jobApply.code,
                        toMail: [{ mailId: resumeObj.emailId, displayName: resumeObj.firstName, employeeId: resumeObj.employeeDetailsId }],
                        placeHolders: body,
                        replyToEmailid: 'SUPPORTMAILID'
                    };
                }

                emailModel.mail(options, calledFrom)
                .then(rs => { })


                // Email to Recruiter
                jobsModel.getJobDetailsById(resumeObj.jobId, resumeObj.employeeDetailsId)
                .then(empData => {
                    if (empData.length && empData[0].recEmailId) 
                    { 
                        let emp = empData[0];
                        let source = (emp.source || null);
                        let entity = (emp.entity || null);
                        userModel.getSourceEntity(source, entity)
                        .then( rs => { 
                            // Email to Recruiter

                            // get candidate resume for attachment

                            crudOperationModel.findModelByCondition(Candidate_ResumeAndDoc, {candidateDocId : resumeObj.candidateDocId})
                            .then( doc => {

                                let resumeVars = enums.uploadType.userResume;

                                let body_rec = [
                                    { name: "RECRUITERFIRSTNAME", value: emp.recFirstName },
                                    { name: "CANDIDATENAME", value: (resumeObj.firstName + ' ' + resumeObj.lastName) },
                                    { name: "CANDIDATEEMAIL", value: resumeObj.emailId },
                                    { name: "CANDIDATEPHONE", value: commonMethods.toUSFormat(resumeObj.phone) },
    
                                    { name: "VENDORPHONE", value: '' },
                                    { name: "VENDOREMAIL", value: '' },
                                    { name: "RELOCATION", value: (emp.relocation == 1 ? 'Yes' : 'No') },
                                    { name: "WORKAUTHORIZATION", value: emp.workAuthorisation },
                                    { name: "EXPERIENCE", value: emp.totalExp },
                                    { name: "AVAILABILITY", value: emp.availability },
                                    { name: "PAYRATE", value: emp.payRate },
                                    { name: "SUBCONTRACTOR", value: '' },
                                    { name: "SKILLSUMMARY", value: emp.skillSummary },
    
    
                                    { name: "JOBTITLE", value: jobInfo.jobTitle },
                                    { name: "JOBREFERENCEID", value: jobInfo.jobRefId },
                                    { name: "CLIENTNAME", value: jobInfo.clientName },
                                    { name: "JOBSTATE", value: jobInfo.location },
                                    { name: "APPLICATIONDATE", value: moment().format('MM-DD-YYYY') },
                                    { name: "CLIENTREQUESTID", value: emp.clientReqId },
    
                                    { name: "RECRUITERCOMMENTS", value: emp.recruiterComments },
                                    { name: "VERTICAL", value: emp.vertical },
                                    { name: "CATAGORY", value: emp.category },
                                    { name: "TECHNOLOGY", value: emp.technology },
                                    { name: "ROLE", value: emp.role },
    
                                    { name: "SOURCE", value: rs.source },
                                    { name: "ENTITYGROUP", value: rs.entity },
                                    { name: "FILEPATH", value: ((doc.filePath) ? config.resumeHostUrl + config.documentBasePath + resumeVars.path + '/' + doc.filePath : '') }
                                ];

                                let options_rec = {
                                    mailTemplateCode: enums.emailConfig.codes.adminMails.jobApply,
                                    toMail: [{ mailId: emp.recEmailId, displayName: emp.recFirstName, employeeId: emp.recId }],
                                    placeHolders: body_rec,
                                    ccMail : [{mailId:jobInfo.salesPersonEmail || '',displayName:jobInfo.salesPersonName || '', employeeId:null, configKeyName:null}]
                                };
    
                                emailModel.mail(options_rec, calledFrom)
                                .then(rs => { })

                            })


                        })
                    }
                })

                // Email to Job Referrer
                /*
                jobsModel.getJobReferInfo(resumeObj.jobId, resumeObj.emailId)
                .then( rs => {
                    if(rs && rs.referrerEmail)
                    {
                        let body_email = [
                            { name: "REFERRERNAME", value: rs.referrerName },
                            { name: "JOBTITLE", value: jobInfo.jobTitle },
                            { name: "REFERRALNAME", value: rs.referralName }
                        ];
                        let options_email = {
                            mailTemplateCode: enums.emailConfig.codes.userApplyJobMailtoReferrer.code,
                            toMail: [{ mailId: rs.referrerEmail, displayName: rs.referrerName, employeeId: rs.referrerId }],
                            placeHolders: body_email,
                            // replyToEmailid: 'SUPPORTMAILID'
                        };

                        emailModel.mail(options_email, calledFrom)
                        .then(rs => { })
                    }
                })
                */
            }
        })

    }

    /**
     * Send Job Application/Apply Emails 
     * @param {*} loggedUser : Object of Logged in user
     * @param {*} resumeObj : Object of referral user
     * @param {*} jobInfo : Object of job-data
     * @param {*} existingUser : referral user existing or not boolean
     * @param {*} rr_userId : referrer user id
     * @param {*} rl_userId : referral user id
     * @param {*} calledFrom : Called From Function name
     * @param {*} next : Callback argument
     */
    sendJobReferMail(loggedUser, resumeObj, jobInfo, existingUser, rr_userId, rl_userId, calledFrom)
    {
        // Email to Referrer 
        let body_rf = [
            { name: "RECIPIENTFIRSTNAME", value: loggedUser.firstName },
            { name: "CANDIDATEFULLNAME", value: (resumeObj.firstName + ' ' + resumeObj.lastName) },
            { name: "CANDIDATEEMAIL", value: resumeObj.emailId },
            { name: "JOBTITLE", value: jobInfo.jobTitle },
            { name: "ENDCLIENTNAME", value: jobInfo.clientName },
            { name: "JOBSTATE", value: jobInfo.state },
            { name: "CANDIDATEFIRSTNAME", value: resumeObj.firstName }
        ];
        let options = {
            mailTemplateCode: enums.emailConfig.codes.jobReferrer.code,
            toMail: [{ mailId: loggedUser.emailId, displayName: loggedUser.firstName, employeeId: rr_userId }],           
            placeHolders: body_rf,
            replyToEmailid: 'SUPPORTMAILID'
        }

        emailModel.mail(options, calledFrom)
        .then(rs => { })

        
        // Email to Referral 

        // for new User
        let templateCode = enums.emailConfig.codes.jobReferral.code

        if(existingUser)
        {
            // for existing User
            templateCode = enums.emailConfig.codes.jobReferralCandidate.code 
        }
        
        let activateUserCode = commonMethods.encrypt('SIGNUP||'+rl_userId+'||'+resumeObj.emailId+'||'+new Date().getTime()); 
        
        let body_rr = [
            { name: "CANDIDATEFIRSTNAME", value: resumeObj.firstName },
            { name: "REFERRERNAME", value: (loggedUser.firstName + ' ' + loggedUser.lastName) },
            { name: "JOBTITLE", value: jobInfo.jobTitle },
            { name: "ENDCLIENTNAME", value: jobInfo.clientName },
            { name: "JOBSTATE", value: jobInfo.state },
            { name: "REFERRERFIRSTNAME", value: loggedUser.firstName },
            { name: "REFERREREMAIL", value: loggedUser.emailId },
            { name: "UNIQUECODE", value: activateUserCode }
            
        ];
        let options1 = {
            mailTemplateCode: templateCode,
            toMail: [{ mailId: resumeObj.emailId, displayName: resumeObj.firstName, employeeId: rl_userId }],                                                      
            placeHolders: body_rr,
            replyToEmailid: 'SUPPORTMAILID'
        }

        emailModel.mail(options1, calledFrom)
        .then(rs => { })

        // Email to Recruiter
        jobsModel.getJobDetailsById(jobInfo.jobId, rl_userId)
        .then(empData => {
            if (empData.length) 
            { 
                let emp = empData[0];
               
                let body_rec = [
                    { name: "RECRUITERFIRSTNAME", value: emp.recFirstName },
                    { name: "CANDIDATENAME", value: (resumeObj.firstName + ' ' + resumeObj.lastName) },
                    { name: "CANDIDATEEMAIL", value: resumeObj.emailId },
                    { name: "CANDIDATEPHONE", value: commonMethods.toUSFormat(resumeObj.phone) },
                    { name: "JOBTITLE", value: jobInfo.jobTitle },
                    { name: "JOBREFERENCEID", value: jobInfo.jobRefId },
                    { name: "CLIENTNAME", value: jobInfo.clientName },
                    { name: "LOCATION", value: jobInfo.location },
                    { name: "APPLICATIONDATE", value: moment().format('MM-DD-YYYY') },
                    { name: "REFERERNAME", value: (loggedUser.firstName + ' ' + loggedUser.lastName) },
                    { name: "REFEREREMAIL", value: loggedUser.emailId }
                ];
                let options_rec = {
                    mailTemplateCode: enums.emailConfig.codes.adminMails.jobRefer,
                    toMail: [{ mailId: emp.recEmailId, displayName: emp.recFirstName, employeeId: emp.recId }],
                    placeHolders: body_rec,
                    ccMail : [{"mailId":jobInfo.emailGroup || '',"displayName":"","employeeId":null,"configKeyName":null}]
                };
                // console.log(options_rec)
                emailModel.mail(options_rec, calledFrom)
                .then(rs => { })
            
            }

        })
    }

    /**
     * Share Job via email
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    postShareJob(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            toEmailId = req.body.toEmailId,
            toName = req.body.toName,
            jobId = req.body.jobId;

        if (!toName) {
            msgCode.push('toName:name');
        }
        if (!toEmailId || !commonMethods.validateEmailid(toEmailId)) {
            msgCode.push('toEmailId:email');
        }
        if (!jobId || !commonMethods.isValidInteger(jobId)) {
            msgCode.push('jobId');
        }
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            crudOperationModel.findAllByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
            .then( user => {
                if(user.length)
                {
                    // get Job-details Data
                    jobsModel.getJobLocationAndKeywordByJobId(jobId)
                    .then(job => {
                        if (job.length) {
                            let jobInfo = job[0];
                            // Email to applicant candidate 
                            let body = [
                                { name: "REFERRALNAME", value: toName },
                                { name: "REFERRERNAME", value: (user[0].firstName + ' '+user[0].lastName) },
                                { name: "REFERRERFIRSTNAME", value: user[0].firstName },
                                { name: "REFERREREMAIL", value: user[0].emailId },
                                { name: "JOBTITLE", value: jobInfo.jobTitle },
                                { name: "ENDCLIENTNAME", value: jobInfo.clientName },
                                { name: "JOBSTATE", value: jobInfo.location },
                                { name: "JOBID", value: jobInfo.jobId }
                            ];
                            let options = {
                                mailTemplateCode: enums.emailConfig.codes.shareJob.code,
                                toMail: [{ mailId: toEmailId, displayName: toName }],
                                placeHolders: body
                            };

                            emailModel.mail(options, 'jobsreferrals-controller/postShareJob via mail process.')
                                .then(rs => {
                                    response = responseFormat.getResponseMessageByCodes(['success:jobShared']);
                                    res.status(200).json(response);
                                }).catch(error => {
                                    let resp = commonMethods.catchError('jobsreferrals-controller/postShareJob via mail process.', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })

                        } else {
                            response = responseFormat.getResponseMessageByCodes(['jobId'], { code: 417 });
                            res.status(200).json(response);
                        }
                    }).catch(error => {
                        let resp = commonMethods.catchError('jobsreferrals-controller/postShareJob getJobLocationAndKeywordByJobId process.', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                }
                else
                {

                }
            })
        }
    }


    // **************************** NEW METHODS *********************************//


    // ********************** Check Refered By Email Id ****************** //

    getUserJobReferInfoByEmail(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let emailId = req.body.email;
        let jobId = req.body.jobId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!emailId || !commonMethods.validateEmailid(emailId)) {
            msgCode.push('email');
        }
        if (!jobId || !commonMethods.isValidInteger(jobId)) {
            msgCode.push('jobId');
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            jobsModel.getUserJobReferInfoByEmail(emailId, jobId)
                .then((rmData) => {
                    if (!rmData) 
                    {
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [] } });
                        res.status(200).json(response);
                    }
                    else 
                    {
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [rmData] } });
                        res.status(200).json(response);
                        // response = responseFormat.getResponseMessageByCodes(['email:emailReferred'], { code: 417 });
                        // res.status(200).json(response);
                    }
                })
        }
    }

    // ********** JOb Referral save data ************** //

    referJobToCandidate(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [];

        let input = {
            jobId : req.body.jobId,
            // referrerResumeId : req.body.resumeId,
            candidateEmail : req.body.candidateEmail ? req.body.candidateEmail.trim() : '',
            candidateName : req.body.candidateName ? req.body.candidateName.trim() : '',
            candidateRelation : req.body.candidateRelation,
            candidateRequirement : req.body.candidateRequirement,
            referrerComments : req.body.referrerComments,
            createdDate : new Date(),
            status : enums.jobReferStatus.referred
        };

        let loggedUser = {};
      
        if (!input.jobId || input.jobId == '') {
            msgCode.push('errorText:jobId');
        }

        // if (!input.referrerResumeId || input.referrerResumeId == '') {
        //     msgCode.push('errorText:referrerResumeId');
        // }

        if (!input.candidateName || input.candidateName == '') {
            msgCode.push('candidateName');
        }

        if(!input.candidateEmail && !commonMethods.validateEmailid(input.candidateEmail))
        {
            msgCode.push('candidateEmail:email')
        }

        if(!input.candidateRelation || input.candidateRelation == '')
        {
            msgCode.push('candidateRelation')
        }

        if(!input.candidateRequirement || input.candidateRequirement == '')
        {
            msgCode.push('candidateRequirement')
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            async.series([
                function(done)
                {
                    // check if user referrig himself
                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                    .then( rs => {
                        loggedUser = rs;
                        if(rs.emailId == input.candidateEmail)
                        {
                            response = responseFormat.getResponseMessageByCodes(['candidateEmail:invalidReferral'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else
                        {
                            done()
                        }
                    })
                },
                function(done)
                {
                    // get resume of referrer
                    crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
                    .then ( rs => {
                        if( rs )
                        {
                            input['referrerResumeId'] = rs.resumeId
                            done()
                        }
                        else
                        {
                            done(' invalid user, resume-id not present ')
                        }
                    }).catch( err => {
                        done(' error finding resume id '+err)
                    })
                },
                function(done)
                { 
                    // check if job already shared with candidate
                    crudOperationModel.findModelByCondition(JobReferral, {
                        candidateEmail : input.candidateEmail,
                        jobId : input.jobId
                    }).then( rs => {
                        if(rs)
                        {
                            response = responseFormat.getResponseMessageByCodes(['candidateEmail:emailReferred'], { code: 417 });
                            res.status(200).json(response);
                        }
                        else
                        {
                            done()
                        }
                    }).catch(err=>{
                        done('error in referral find'+ err)
                    })
                },
                function(done)
                {
                    // get job Bonus and set for jobreferral applicablebonus
                    crudOperationModel.findModelByCondition(ClientJobMaster, { cjmJobId : input.jobId })
                    .then( j => {
                        input.applicableBonus = j.referralBonus;
                        done()
                    })
                },
                function(done)
                {
             
                    // insert jobshare data 
                    crudOperationModel.saveModel(JobReferral, input, {jobReferralId : 0})
                    .then( rs => { 
                        done()
                    })
                },
                function(done)
                {
                    // get referrer info
                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                    .then( rs => {

                        // get job info 
                        jobsModel.getJobLocationAndKeywordByJobId(input.jobId)
                        .then( jobInfo => {
                            if(jobInfo.length)
                            {
                                let body = [
                                    { name: "REFERRERNAME", value: rs.firstName + ' ' + rs.lastName },
                                    { name: "REFERRALFIRSTNAME", value: input.candidateName },
                                    { name: "JOBTITLE", value: jobInfo[0].jobTitle },
                                    { name: "JOBID", value: jobInfo[0].jobId },
                                    { name: "JOBCITY", value: jobInfo[0].city },
                                    { name: "JOBSTATE", value: jobInfo[0].state }
                                ];
                                let options = {
                                    mailTemplateCode: enums.emailConfig.codes.jobRefer.code,
                                    toMail: [{mailId : input.candidateEmail, displayName:input.candidateName}],           
                                    placeHolders: body,
                                    // replyToEmailid: 'SUPPORTMAILID'
                                }
                        
                                emailModel.mail(options, 'jobsreferral-controller/referJobToCandidate')
                                .then(rs => { })


                                // Email to Referrer 
                                let body_rf = [
                                    { name: "RECIPIENTFIRSTNAME", value: loggedUser.firstName },
                                    { name: "CANDIDATEFULLNAME", value: input.candidateName },
                                    { name: "CANDIDATEEMAIL", value: input.candidateEmail },
                                    { name: "JOBTITLE", value: jobInfo[0].jobTitle },
                                    { name: "ENDCLIENTNAME", value: jobInfo[0].clientName },
                                    { name: "JOBSTATE", value: jobInfo[0].state },
                                    { name: "CANDIDATEFIRSTNAME", value: input.candidateName }
                                ];
                                let options_rf = {
                                    mailTemplateCode: enums.emailConfig.codes.jobReferrer.code,
                                    toMail: [{ mailId: loggedUser.emailId, displayName: loggedUser.firstName, employeeId: loggedUser.employeeDetailsId }],           
                                    placeHolders: body_rf,
                                    // replyToEmailid: 'SUPPORTMAILID'
                                }

                                emailModel.mail(options_rf, 'jobsreferral-controller/referJobToCandidate')
                                .then(rs => { })
                                
                            }
                        })

                    })
                    // send mail to candidate

                    done();
                }

            ],
            function(err, result)
            {
                if (err) 
                {
                    let resp = commonMethods.catchError('jobsreferral-controller/referJobToCandidate', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                    res.status(200).json(response);
                }
            })  

        }
    }


    // ********** Job Referral logged-in user action ************** //

    jobReferralLoggedInAction(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            knowReferrer = req.body.knowReferrer ? ~~req.body.knowReferrer : 0,
            intrestedInJob = req.body.intrestedInJob ? ~~req.body.intrestedInJob : 0,
            jobId = req.body.jobId;

        if(!jobId)
        {
            msgCode.push('jobId')
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            let referralResumeId = 0;
            let candidateEmail = '';
            let referData = {
                candidateKnowReferrer : knowReferrer
            }
            if(!intrestedInJob || intrestedInJob == 0)
            {
                referData['status'] = enums.jobReferStatus.notInterested
            }

            async.series([
                function(done)
                { 
                    // get resume id of referral
                    crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
                    .then ( rs => {
                        if( rs )
                        {
                            referralResumeId = rs.resumeId
                            candidateEmail = rs.emailId
                            done()
                        }
                        else
                        {
                            done(' invalid user, resume-id not present ')
                        }
                    }).catch( err => {
                        done(' error finding resume id '+err)
                    })
                    
                },
                function(done)
                {
                    /*
                    if(!intrestedInJob || intrestedInJob == 0)
                    {
                        // send email if user is not interested in job 
                        jobsModel.getJobReferInfo(jobId, candidateEmail)
                        .then( rs => {
                            if(rs) 
                            {
                                let body = [
                                    { name: "REFERRERNAME", value: rs.referrerName},
                                    { name: "JOBTITLE", value: rs.jobTitle },
                                    { name: "REFERRALFIRSTNAME", value: rs.referralName },
                                ];
                            
                                let options = {
                                    mailTemplateCode: enums.emailConfig.codes.notInterestedinJob.code,
                                    toMail: [{mailId: rs.referrerEmail, displayName:rs.referrerName, employeeId:rs.referrerId}],           
                                    placeHolders: body
                                }
                        
                                emailModel.mail(options, 'jobsreferral-controller/jobReferralLoggedInAction')
                                .then(rs => { })
                            }
                        })
                    }
                    */
                    
                    done()
                },
                function(done)
                { 
                    crudOperationModel.updateAll(JobReferral, referData, { jobId : jobId, candidateEmail : candidateEmail })
                    .then ( rs => {
                        response = responseFormat.getResponseMessageByCodes(['success:saved']);
                        res.status(200).json(response);
                    })
                },

            ],
            function(err, result)
            {
                if (err) 
                {
                    let resp = commonMethods.catchError('jobsreferral-controller/jobReferralLoggedInAction', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                    res.status(200).json(response);
                }
            })  
            
        }

    }


    // ************** SEND INVITATION EMAIL ************************** //

    sendInviteVaiMail(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            invites = req.body.invites;

        let self = this;
        let userName = '';
        let resumeId = 0;

        // dummy [{contactName: '', contactEmail:'abc@example.com', sendMail : true}]

        if(!invites && !invites.length)
        {
            msgCode.push('errorText:blankRequest')
        }

        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            async.series([
                function(done)
                { 
                    // get sender name
                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                    .then( rs => {
                        if(rs)
                        {
                            userName = rs.firstName + ' ' + rs.lastName;
                            done()
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['errorText:invalidUser'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                },
                function(done)
                {
                    // get sender resumeId
                    crudOperationModel.findModelByCondition(ResumeMaster, {employeeDetailsId : employeeDetailsId})
                    .then( rs => {
                        if(rs)
                        {
                            resumeId = rs.resumeId
                            done()
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['errorText:invalidUser'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
                },
                function(done)
                {   
                    // check existing employee
                    async.each(invites, function(item, cb)
                    {  
                        item['status'] = item.sendMail ? enums.contactStatus.invited : null;
                        item['candidateResumeId'] = resumeId;
                        item['createdDate'] = new Date();
                        item['invitationDate'] = item.sendMail ? new Date() : null;
                        item['applicableBonus'] = enums.sponsoreBonus;

                        crudOperationModel.findModelByCondition(EmployeeDetails, { emailId : item.contactEmail })
                        .then(rs => {
                            if(rs)
                            {
                                item['status'] = enums.contactStatus.alreadyInvited;
                                item['invitationDate'] = null;
                                item.sendMail = false;
                            }
  
                            crudOperationModel.findModelByCondition(CandidateContact, { contactEmail : item.contactEmail })
                            .then(rs => {  
                                if(rs && rs.candidateResumeId != resumeId)
                                { 
                                    if(!rs.status && item.sendMail)
                                    { 
                                        item['status'] = enums.contactStatus.invited;
                                        item['invitationDate'] = new Date();
                                        item.sendMail = true;
                                    }
                                    else if(rs.status)
                                    {
                                        item['status'] = enums.contactStatus.alreadyInvited;
                                        item['invitationDate'] = null;
                                        item.sendMail = false;
                                    }
                                }
                                
                                cb()
                                
                            })

                            
                        })
                    }, function(err)
                    {
                        if(err)
                            done('error occurrd '+err)
                        else
                            done()
                    })
                },
                function(done)
                {
                    // save invites in db
                    // console.log('invites', invites)
                   
                   async.each(invites, function(item, cb)
                   {   
                      
                       crudOperationModel.saveModel(CandidateContact, item,  { contactEmail : item.contactEmail, candidateResumeId : resumeId })
                       .then(rs => {
                           if(rs)
                           {    
                               if(item.sendMail)
                               {
                                   let emailArray = [{mailId:item.contactEmail,displayName:item.contactName}]
                                   self.sendInvitationEmail(userName, item.contactName, emailArray, 'jobsreferral-controller/sendInviteVaiMail');
                               }
                               cb()
                           }
                       })
                   }, function(err)
                   {
                       if(err)
                           done('error occurrd '+err)
                       else
                           done()
                   })

                },
                function(done)
                {
                    response = responseFormat.getResponseMessageByCodes(['success:invitationSent']);
                    res.status(200).json(response);
                }
            ],function(err, result)
            {
                if(err)
                {
                    let resp = commonMethods.catchError('jobsreferrals-controller/sendInviteVaiMail via mail process.', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else
                {
                    response = responseFormat.getResponseMessageByCodes(['success:invitationSent']);
                    res.status(200).json(response);
                }
            })
            
            
        }
    }

    sendInvitationEmail(referrerName, referralName, emailArray, calledFrom)
    {
        if(emailArray.length)
        {

            let body = [
                { name: "REFERRERNAME", value: referrerName },
                { name: "REFERRALFIRSTNAME", value: referralName },
            ];
            let options = {
                mailTemplateCode: enums.emailConfig.codes.contactInvite.code,
                toMail: emailArray,           
                placeHolders: body,
                // replyToEmailid: 'SUPPORTMAILID'
            }
    
            emailModel.mail(options, calledFrom)
            .then(rs => { })
            return emailArray.length;
        }
        return false;
    }


    // **************** FETCH INVITATION ACTIVITY LIST ************************** //

    getInvitationActivity(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            searchText = req.body.searchText;

        let pageCount = req.body.pageCount ? req.body.pageCount : enums.paging.pageCount;
        let pageSize = req.body.pageSize ? req.body.pageSize : enums.paging.pageSize;

        if ((pageCount) && !commonMethods.isValidInteger(pageCount)) {
            msgCode.push('pageCount');
        }
        if ((pageSize) && !commonMethods.isValidInteger(pageSize)) {
            msgCode.push('pageSize');
        }

        
        if (msgCode.length) 
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else 
        {
            jobsModel.getInvitationActivity(employeeDetailsId, pageCount, pageSize, searchText)
            .then( rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            })
        }
    }



}