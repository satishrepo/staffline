/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import ProfileManagementModel from '../../models/profileManagement/profile-management-model';
import ReferralsModel from '../../models/referrals/referrals-model';
import CrudOperationModel from '../../models/common/crud-operation-model';
import EmailModel from '../../models/emails/emails-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';
import ReferralsValidation from '../../validations/referrals/referrals-validation';
import moment from 'moment';
import path from 'path';
import async from 'async';
import AccountsModel from '../../models/accounts/accounts-model';

// call entities
import { ResumeMaster } from "../../entities/profileManagement/resume-master";
import { CandidateReferral } from "../../entities/referrals/candidate-referral";
import { EmployeeDepositeDetails } from "../../entities/referrals/employee-deposite-details";
import { APP_REF_DATA } from "../../entities/common/app-ref-data";
import { EmployeeDetails } from "../../entities/profileManagement/employee-details";
import { ATS_JobActivity } from "../../entities/jobs/ats-jobactivity";
import { ReferralClient } from "../../entities/referrals/referral-client";


/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    referralsModel = new ReferralsModel(),
    profileManagementModel = new ProfileManagementModel(),
    commonMethods = new CommonMethods(),
    crudOperationModel = new CrudOperationModel(),
    referralsValidation = new ReferralsValidation();

const emailModel = new EmailModel();

export default class ReferralsController {
    constructor() { }


    /**
    * Get referral Lookup
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
    */

    lookupData(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        crudOperationModel.findAllByCondition(APP_REF_DATA,
            {
                parentId: enums.appRefParentId.accountTypesMasterId,
                keyId: { $ne: enums.appRefParentId.accountTypesMasterId }
            }, ['keyId', 'keyName']
        ).then(rs => {
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [{ accountTypes: rs }] } });
            res.status(200).json(response);
        }).catch(err => {
            let resp = commonMethods.catchError('referral-controller/lookupData', err);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        })

    }

    /**
    * Refer any candidate 
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    */

    checkReferredByEmail(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let emailId = req.body.email;

        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!emailId || !commonMethods.validateEmailid(emailId)) {
            msgCode.push('email');
        }


        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            crudOperationModel.findModelByCondition(ResumeMaster,
                {
                    emailId: emailId
                })
                .then((rmData) => {
                    if (!rmData) {
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [] } });
                        res.status(200).json(response);
                    }
                    else {
                        response = responseFormat.getResponseMessageByCodes(['email:candidateAlreadyReferred']);
                        res.status(200).json(response);
                    }
                })
        }
    }


    /**
     * Refer any candidate 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */


    referCandidate_backup(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let resumeObj = {
            firstName: req.body.firstName ? req.body.firstName.trim() : '',
            lastName: req.body.lastName ? req.body.lastName.trim() : '',
            phone: req.body.phone,
            emailId: req.body.email,
            resumeName: req.body.resumeName,
            resumeFile: req.body.resumeFile
        };
        let resumeVars = enums.uploadType.userResume;
        let response = responseFormat.createResponseTemplate();
        let msgCode = referralsValidation.referCandidate(resumeObj, resumeVars.allowedExt);


        let loggedUser = {};

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {

            crudOperationModel.findModelByCondition(EmployeeDetails,
                {
                    employeeDetailsId: employeeDetailsId
                }).then(emp => {
                    loggedUser.recruiter = emp.recruiter;

                    if (emp.emailId == resumeObj.emailId) {
                        response = responseFormat.getResponseMessageByCodes(['email:invalidReferral'], { code: 417 });
                        res.status(200).json(response);
                    }
                    else {

                        crudOperationModel.findModelByCondition(ResumeMaster,
                            {
                                emailId: resumeObj.emailId
                            })
                            .then((rmData) => {
                                if (!rmData) {

                                    let userObj = {
                                        firstName: resumeObj.firstName,
                                        lastName: resumeObj.lastName,
                                        email: resumeObj.emailId,
                                        password: null,
                                        empStatus: enums.empStatus.status,
                                        isAccountActivated: enums.empStatus.inActive,
                                        recruiter: loggedUser.recruiter,
                                        phone: resumeObj.phone,
                                        entityGroup: enums.employeeDefaultValues.defaultEntityGroup,
                                        sourceId: enums.employeeDefaultValues.defaultRefferedSourceGroupId,
                                        jobSearchStatus: enums.employeeDefaultValues.defaultRefferedJobSearchStatus,
                                        resumeMasterStatus: enums.resumeMasterStatus.Unverified
                                    };
                                    accountModel.signUp(userObj)
                                        .then((users) => {
                                            resumeObj.resumeId = users[0].resumeId;

                                            commonMethods.fileUpload(resumeObj.resumeFile, resumeObj.resumeName, resumeVars.docTypeId)
                                                .then((docFileUpload) => {

                                                    if (docFileUpload.isSuccess) {

                                                        let resumeDoc = {
                                                            resumeId: resumeObj.resumeId,
                                                            filePath: docFileUpload.fileName, //resumeVars.path +
                                                            fileName: resumeObj.resumeName,
                                                            isPrimary: 1,
                                                            docType: enums.doc.type.resume,
                                                            createdBy: resumeObj.employeeDetailsId,
                                                            createdDate: new Date()
                                                        };

                                                        //insert resume in candidate_resumeAndDoc table
                                                        profileManagementModel.updateCandidateResume(resumeDoc)
                                                            .then(rs => {
                                                                let activity = "Contact referred by: <b> " + emp.firstName + " " + emp.lastName + " (" + emp.emailId + ") </b>";
                                                                let jobActivity = {
                                                                    candidateId: resumeObj.resumeId,
                                                                    clientJobId: -1, ///other entries
                                                                    activityLog: activity,
                                                                    dataComeFrom: 2,
                                                                    createdOn: new Date(),
                                                                    createdBy: employeeDetailsId

                                                                };
                                                                // console.log(' jobActivity: ,jobActivity', jobActivity);
                                                                //insert record in ats_jobactivity table
                                                                crudOperationModel.saveModel(ATS_JobActivity, jobActivity, { jobactivityId: 0 })
                                                                    .then((rs) => {
                                                                        let referObj = {
                                                                            employeeDetailsId: employeeDetailsId,
                                                                            resumeId: resumeObj.resumeId,
                                                                            createdDate: new Date(),
                                                                            createdBy: employeeDetailsId
                                                                        };
                                                                        //insert record in CandidateReferral table
                                                                        crudOperationModel.saveModel(CandidateReferral, referObj, { referralId: 0 })
                                                                            .then((rs) => {
                                                                                response = responseFormat.getResponseMessageByCodes(['success:candidateReferred']);
                                                                                res.status(200).json(response);
                                                                            }).catch(err => {
                                                                                let resp = commonMethods.catchError('referral-controller/referCandidate CandidateReferral process', err);
                                                                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                                                res.status(resp.code).json(response);
                                                                            })
                                                                    }).catch(err => {
                                                                        let resp = commonMethods.catchError('referral-controller/referCandidate ats_jobactivity process', err);
                                                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                                        res.status(resp.code).json(response);
                                                                    })

                                                            }).catch(error => {
                                                                let resp = commonMethods.catchError('referral-controller/referCandidate', error);
                                                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                                res.status(resp.code).json(response);
                                                            })
                                                    }
                                                    else {
                                                        response = responseFormat.getResponseMessageByCodes(['resumeName:' + docFileUpload.msgCode[0]], { code: 417 });
                                                        res.status(200).json(response);
                                                    }
                                                }).catch(err => {
                                                    let resp = commonMethods.catchError('referral-controller/upload-resume', err);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })

                                        }).catch(err => {
                                            let resp = commonMethods.catchError('referral-controller/referCandidate', err);
                                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                            res.status(resp.code).json(response);
                                        })
                                }
                                else {
                                    response = responseFormat.getResponseMessageByCodes(['email:emailExists'], { code: 417 });
                                    res.status(200).json(response);
                                }
                            })
                    }
                })

        }

    }


    referCandidate(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let resumeObj = {
            firstName: req.body.firstName ? req.body.firstName.trim() : '',
            lastName: req.body.lastName ? req.body.lastName.trim() : '',
            phone: req.body.phone,
            emailId: req.body.email,
            resumeName: req.body.resumeName,
            resumeFile: req.body.resumeFile
        };
        let resumeVars = enums.uploadType.userResume;
        let response = responseFormat.createResponseTemplate();
        let msgCode = referralsValidation.referCandidate(resumeObj, resumeVars.allowedExt);

        let loggedUser = {};
        let uploadedFile = '';

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {

            crudOperationModel.findModelByCondition(ResumeMaster, { employeeDetailsId: employeeDetailsId })
                .then(emp => {
                    loggedUser = emp;

                    if (emp.emailId == resumeObj.emailId) {
                        response = responseFormat.getResponseMessageByCodes(['email:invalidReferral'], { code: 417 });
                        res.status(200).json(response);
                    }
                    else {
                        async.waterfall([
                            function (done) {
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
                            },
                            function (done) {
                                crudOperationModel.findModelByCondition(ResumeMaster,
                                    {
                                        emailId: resumeObj.emailId
                                    })
                                    .then((rmData) => {
                                        if (!rmData) {

                                            let userObj = {
                                                firstName: resumeObj.firstName,
                                                lastName: resumeObj.lastName,
                                                email: resumeObj.emailId,
                                                password: null,
                                                empStatus: enums.empStatus.status,
                                                isAccountActivated: enums.empStatus.inActive,
                                                recruiter: loggedUser.recruiter,
                                                phone: resumeObj.phone,
                                                entityGroup: enums.employeeDefaultValues.defaultEntityGroup,
                                                sourceId: enums.employeeDefaultValues.defaultRefferedSourceGroupId,
                                                jobSearchStatus: enums.employeeDefaultValues.defaultRefferedJobSearchStatus,
                                                resumeMasterStatus: enums.resumeMasterStatus.Unverified,
                                                companyMasterId: loggedUser.companyMasterId || enums.compnayMaster.default
                                            };

                                            accountModel.signUp(userObj)
                                                .then((users) => {
                                                    resumeObj.resumeId = users[0].resumeId;

                                                    if (resumeObj.resumeFile && resumeObj.resumeName) {
                                                        // call Resume-Parser API, if user have any resume to uploaded
                                                        accountModel.parseResume(resumeObj.resumeId, resumeObj.resumeName, resumeObj.resumeFile, 'referral-controller/referCandidate')
                                                            .then(parse => { })
                                                    }

                                                    done(null, users[0].resumeId);
                                                }).catch(err => {
                                                    let resp = commonMethods.catchError('referral-controller/referCandidate', err);
                                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                    res.status(resp.code).json(response);
                                                })
                                        }
                                        else {
                                            response = responseFormat.getResponseMessageByCodes(['email:emailExists'], { code: 417 });
                                            res.status(200).json(response);
                                        }
                                    }).catch(err => {
                                        let resp = commonMethods.catchError('referral-controller/referCandidate', err);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })

                            },
                            function (resumeId, done) {
                                commonMethods.fileUpload(resumeObj.resumeFile, resumeObj.resumeName, resumeVars.docTypeId)
                                    .then((docFileUpload) => {

                                        if (docFileUpload.isSuccess) {

                                            let resumeDoc = {
                                                resumeId: resumeObj.resumeId,
                                                filePath: docFileUpload.fileName,
                                                fileName: resumeObj.resumeName,
                                                isPrimary: 1,
                                                docType: enums.doc.type.resume,
                                                createdBy: employeeDetailsId,
                                                createdDate: new Date()
                                            };
                                            uploadedFile = docFileUpload.fileName;
                                            done(null, resumeDoc)
                                        }
                                        else {
                                            response = responseFormat.getResponseMessageByCodes(['resumeName:' + docFileUpload.msgCode[0]], { code: 417 });
                                            res.status(200).json(response);
                                        }

                                    }).catch(err => {
                                        let resp = commonMethods.catchError('referral-controller/upload-resume', err);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                            },
                            function (resumeDoc, done) {
                                //insert resume in candidate_resumeAndDoc table
                                profileManagementModel.updateCandidateResume(resumeDoc)
                                    .then(rs => {
                                        let activity = "Contact referred by: <b> " + emp.firstName + " " + emp.lastName + " (" + emp.emailId + ") </b>";
                                        let jobActivity = {
                                            candidateId: resumeObj.resumeId,
                                            clientJobId: -1, ///other entries
                                            activityLog: activity,
                                            dataComeFrom: 2,
                                            createdOn: new Date(),
                                            createdBy: employeeDetailsId

                                        };

                                        done(null, jobActivity)
                                    }).catch(error => {
                                        let resp = commonMethods.catchError('referral-controller/referCandidate', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })
                            },
                            function (jobActivity, done) {
                                // console.log(' jobActivity: ,jobActivity', jobActivity);
                                //insert record in ats_jobactivity table
                                crudOperationModel.saveModel(ATS_JobActivity, jobActivity, { jobactivityId: 0 })
                                    .then((rs) => {
                                        let referObj = {
                                            employeeDetailsId: employeeDetailsId,
                                            resumeId: resumeObj.resumeId,
                                            createdDate: new Date(),
                                            createdBy: employeeDetailsId
                                        };
                                        //insert record in CandidateReferral table
                                        crudOperationModel.saveModel(CandidateReferral, referObj, { referralId: 0 })
                                            .then((rs) => {

                                                // update referrer of candidate in resume_master 
                                                crudOperationModel.saveModel(ResumeMaster, { employeeReferrerId: employeeDetailsId }, { resumeId: resumeObj.resumeId })
                                                    .then((rs1) => {

                                                    }).catch(err => {
                                                        let resp = commonMethods.catchError('referral-controller/referCandidate update Referrer', err);
                                                    })


                                                // send mail to recruiter 
                                             
                                                crudOperationModel.findAllByCondition(EmployeeDetails, { employeeDetailsId: loggedUser.recruiter })
                                                .then(recData => {
                                                    if (recData.length) {
                                                        let data = [
                                                            { name: "ADDRESSEESALUTATION", value: ('Hi ' + (recData[0].firstName || '') + ',') },
                                                            { name: "REFERERNAME", value: loggedUser.firstName },
                                                            { name: "REFEREREMAIL", value: loggedUser.emailId },
                                                            { name: "REFERRALNAME", value: (resumeObj.firstName + ' ' + resumeObj.lastName) },
                                                            { name: "REFERRALEMAIL", value: resumeObj.emailId },
                                                            { name: "REFERRALPHONE", value: commonMethods.toUSFormat(resumeObj.phone) },
                                                            { name: "REFERRALFIRSTNAME", value: resumeObj.firstName },
                                                            { name: "FILEPATH", value: ((uploadedFile) ? config.resumeHostUrl + config.documentBasePath + resumeVars.path + '/' + uploadedFile : '') }
                                                        ];

                                                        let options = {
                                                            mailTemplateCode: enums.emailConfig.codes.adminMails.candidateRefer,
                                                            toMail: [{ mailId: recData[0].emailId, displayName: recData[0].firstName, employeeId : recData[0].employeeDetailsId }],
                                                            placeHolders: data
                                                        }

                                                        emailModel.mail(options, 'account-controller/signup recruiter-mail')
                                                            .then(rs => { })
                                                    }

                                                })


                                                response = responseFormat.getResponseMessageByCodes(['success:candidateReferred']);
                                                res.status(200).json(response);
                                            }).catch(err => {
                                                let resp = commonMethods.catchError('referral-controller/referCandidate CandidateReferral process', err);
                                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                                res.status(resp.code).json(response);
                                            })
                                    }).catch(err => {
                                        let resp = commonMethods.catchError('referral-controller/referCandidate ats_jobactivity process', err);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    })

                            }
                        ], function (err, result) {
                            if (err) {
                                let resp = commonMethods.catchError('referral-controller/referCandidate CandidateReferral process', err);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            }
                            else {
                                response = responseFormat.getResponseMessageByCodes(['success:candidateReferred']);
                                res.status(200).json(response);
                            }
                        })

                    }
                })

        }

    }


    /**
    * Get My referrals 
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    */

    myReferrals(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        referralsModel.getMyReferrals(employeeDetailsId)
            .then(rs => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                res.status(200).json(response);
            }).catch(err => {
                let resp = commonMethods.catchError('referral-controller/myReferrals', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })

    }

    /**
  * Get My referrals 
  * @param {*} req 
  * @param {*} res 
  * @param {*} next 
  */

    contactreferrals(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let pageCount = req.body.pageCount ? req.body.pageCount : enums.paging.pageCount;
        let pageSize = req.body.pageSize ? req.body.pageSize : enums.paging.pageSize;
        let msgCode = [];

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
            referralsModel.contactreferrals(employeeDetailsId, pageCount, pageSize)
                .then(rs => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: rs } });
                    res.status(200).json(response);
                }).catch(err => {
                    let resp = commonMethods.catchError('referral-controller/myReferrals', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }

    }


    /**
    * Get My Bank Details 
    * @param {*} req 
    * @param {*} res 
    * @param {*} next 
    */

    myBankDetails(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();

        referralsModel.getBankDetails(employeeDetailsId)
            .then(details => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: details } });
                res.status(200).json(response);
            }).catch(err => {
                let resp = commonMethods.catchError('referral-controller/myBankDetails', err);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
    }

    /**
     * Add Bank Details 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */

    addBankDetails(req, res, next) {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let accountObj = {
            employeeDepositeDetailsID: req.body.employeeDepositeDetailsID,
            employeeDetailsId: employeeDetailsId,
            bankName: req.body.bankName ? req.body.bankName.trim() : '',
            bankAddress: req.body.bankAddress ? req.body.bankAddress.trim() : '',
            abaNumber: req.body.abaNumber,
            accountNumber: req.body.accountNumber,
            accountTypeId: req.body.accountTypeId,
            chequeName: req.body.chequeName,
            chequeFile: req.body.chequeFile
        };

        let documentsVars = enums.uploadType.bankDetails;

        let response = responseFormat.createResponseTemplate();
        let msgCode = referralsValidation.addBankDetails(accountObj, documentsVars.allowedExt);

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {

            async.series([
                function (done) {
                    if (accountObj.chequeFile && accountObj.chequeName) {

                        commonMethods.fileUpload(accountObj.chequeFile, accountObj.chequeName, documentsVars.docTypeId)
                            .then((docFileUpload) => {
                                if (docFileUpload.isSuccess) {
                                    accountObj.chequeAttachmentName = accountObj.chequeName;
                                    accountObj.chequeUploadAttachmentName = docFileUpload.fileName;
                                    done();
                                }
                                else {
                                    response = responseFormat.getResponseMessageByCodes(['chequeName:' + docFileUpload.msgCode[0]], { code: 417 });
                                    res.status(200).json(response);
                                }
                            }).catch(err => {
                                let resp = commonMethods.catchError('referral-controller/addBankDetails', err);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    }
                    else {
                        done();
                    }
                },
                function (done) {
                    let condition = { employeeDepositeDetailsID: 0 };
                    crudOperationModel.findModelByCondition(EmployeeDepositeDetails,
                        {
                            employeeDetailsId: employeeDetailsId
                        }).then(details => {
                            if (details) {
                                condition = { employeeDepositeDetailsID: details.employeeDepositeDetailsID, employeeDetailsId: employeeDetailsId };
                            }

                            crudOperationModel.saveModel(EmployeeDepositeDetails, accountObj, condition)
                                .then((result) => {
                                    if (result) {
                                        response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                        res.status(200).json(response);
                                    }
                                    else {
                                        response = responseFormat.getResponseMessageByCodes(['common500']);
                                        res.status(200).json(response);
                                    }

                                }).catch(err => {
                                    let resp = commonMethods.catchError('referral-controller/addBankDetails', err);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })

                        })

                }
            ], function (err, result) {
                if (err) {
                    let resp = commonMethods.catchError('referral-controller/addBankDetails', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
                else {
                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                    res.status(200).json(response);
                }
            })

        }

    }

    /**
     * Get Active application by Resume Id
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */

    activeApplications(req, res, next) {
        let employeeDetailsId = req.body.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        if (!employeeDetailsId || !commonMethods.isValidInteger(employeeDetailsId) || employeeDetailsId < 1) {
            response = responseFormat.getResponseMessageByCodes(['employeeDetailsId'], { code: 417 });
            res.status(200).json(response);
        }
        else {
            referralsModel.getActiveApplication(employeeDetailsId)
                .then(details => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: details } });
                    res.status(200).json(response);

                }).catch(err => {
                    let resp = commonMethods.catchError('referral-controller/activeApplications', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Refer A Client
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */

    referClient(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [];

        let input = {
            companyName : req.body.companyName ? req.body.companyName.trim() : '',
            jobPosition : req.body.jobPosition,
            address : req.body.address ? req.body.address.trim() : '',
            country : req.body.countryId,
            state : req.body.stateId,
            city : req.body.cityId,
            contactName : req.body.name ? req.body.name.trim() : '',
            contactJobTitle : req.body.jobTitle ? req.body.jobTitle.trim() : '',
            contactEmailId : req.body.emailId ? req.body.emailId.trim() : '',
            contactPhone : req.body.phone,
            comment : req.body.comment ? req.body.comment.trim() :''
        };


        if (!input.companyName || input.companyName == '') {
            msgCode.push('companyName');
        }

        if(input.contactEmailId && !commonMethods.validateEmailid(input.contactEmailId))
        {
            msgCode.push('emailId:email')
        }

        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {  
            
            // save client info in table

            async.series([
                function(done)
                {
                    commonMethods.getCountyByName(input.country)
                    .then( rs => { 
                        input['countryId'] = rs ? rs.countryId : null;
                        done();
                    })
                },
                function(done)
                {
                    commonMethods.getStateByName(input.state)
                    .then( rs => {
                        input['stateId'] = rs ? rs.stateId : null;
                        done();
                    })
                },
                function(done)
                {
                    commonMethods.getCityByName(input.city)
                    .then( rs => {
                        input['cityId'] = rs ? rs.cityId : null;
                        done();
                    })
                },
                function(done)
                { 
                    
                    input['referrerId'] = employeeDetailsId;
                    input['createdDate'] = new Date();
                    input['createdBy'] = employeeDetailsId;
                    input['status'] = enums.clientReferStatus.pending;

                    crudOperationModel.saveModel(ReferralClient, input, {referralClientId : 0})
                    .then( rs => { 
                        if(rs)
                        {
                            done()
                        }
                        else
                        {
                            done(' Error in saving Rerreral_client table ')
                        }
                    }).catch( err => {
                        let resp = commonMethods.catchError('referrals-controller/referClient', err);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
                },
                function(done)
                {
                        
                    AccountsModel.getCandidateDetails(employeeDetailsId)
                    .then( user => {
                        if(user)
                        { 
                            // Email to applicant candidate 
                            let body = [
                                { name: "COMPANYNAME", value: input.companyName },
                                { name: "JOBPOSITION", value: input.jobPosition },
                                { name: "ADDRESS", value: input.address },
                                { name: "COUNTRY", value: input.country },
                                { name: "STATE", value: input.state },
                                { name: "CITY", value: input.city },
                                { name: "NAME", value: input.contactName },
                                { name: "JOBTITLE", value: input.contactJobTitle },
                                { name: "EMAIL", value: input.contactEmailId },
                                { name: "PHONE", value: input.contactPhone },
                                { name: "COMMENT", value: input.comment },
                                {name : "CLIENTREFERRALNAME", value : ( user.firstName +' '+ user.lastName ) },
                                {name : "CLIENTREFERRALEMAIL", value : user.emailId }
                            ]
                            
                            let options = {
                                mailTemplateCode: enums.emailConfig.codes.adminMails.referClient,
                                toMail : [{mailId : null, displayName : null, configKeyName:'SUPPORTMAILID'}],       
                                placeHolders: body,
                                ccMail : [
                                    {mailId : enums.emailConfig.codes.eMails.andy, displayName : 'Andy Gaur', configKeyName:null},
                                    {mailId : enums.emailConfig.codes.eMails.rshah, displayName : 'Rakesh Shah', configKeyName:null},         
                                    {mailId : enums.emailConfig.codes.eMails.ayadav, displayName : 'Ashish Yadav', configKeyName:null},
                                    {mailId : enums.emailConfig.codes.eMails.ppatlola, displayName : 'Praneeth Patlola', configKeyName:null},      
                                    {mailId : enums.emailConfig.codes.eMails.neville, displayName : 'Neville Gupta', configKeyName:null}         
                                ]
                            };
                        
                            emailModel.mail(options, 'referrals-controller/referClient mail process.')
                            .then(rs => {
                                response = responseFormat.getResponseMessageByCodes(['success:clientReffered']);
                                res.status(200).json(response);
                            }).catch(error => {
                                let resp = commonMethods.catchError('referrals-controller/referClient mail process.', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['errorText:invalidUser'], { code: 417 });
                            res.status(200).json(response);
                        }
                    })
          
                }

            ], function(err, result)
            {
                if(!err)
                {
                    response = responseFormat.getResponseMessageByCodes(['success:clientReffered']);
                    res.status(200).json(response);
                }
                else
                {
                    let resp = commonMethods.catchError('referrals-controller/referClient', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
            })
        }
    }

   
}


