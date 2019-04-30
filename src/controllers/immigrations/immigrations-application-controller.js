/**
 *  -------Import all classes and packages -------------
 */
import ImmigrationModel from '../../models/immigrations/immigrations-application-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import accountModel from '../../models/accounts/accounts-model';
import UserModel from '../../models/profileManagement/profile-management-model';
import BenefitModel from '../../models/benefits/benefits-model';
import CommonMethods from '../../core/common-methods';
import fs from 'fs';
import path from 'path';
import async from 'async';
import enums from '../../core/enums';
import ImmigrationValidation from '../../validations/immigrations/immigrations-validation';
import _ from 'lodash';
import CrudOperationModel from '../../models/common/crud-operation-model';
import EmailModel from '../../models/emails/emails-model';
import { EmployeeDetails } from '../../entities/profileManagement/employee-details';
import { DMS } from '../../entities/employeeonboarding/dms';


/**
 *  -------Initialize global variabls-------------
 */
let immigrationModel = new ImmigrationModel(),
    config = configContainer.loadConfig(),
    userModel = new UserModel(),
    benefitModel = new BenefitModel(),
    commonMethods = new CommonMethods(),
    immigrationValidation = new ImmigrationValidation();

let crudOperationModel = new CrudOperationModel();

const emailModel = new EmailModel();

export default class ImmigrationController {

    constructor() {
        //
    }

    /**
     * Get All Immigration Applications By EmployeeDetails Id
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getAllImmigrationapplicationsByEmpId(req, res, next) { 
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let respData = [];
        if (employeeDetailsId) {
            this.getAllImmigrationapplications(employeeDetailsId)
                .then((response) => { 
                    if(response['users'].length)
                    {
                        /* // removed document list from immigration user list
                        immigrationModel.getApplicationListByConditions(response.legalAppIds, employeeDetailsId)
                        .then((dataList) => {
                            response.users.forEach((i, index) => {
                                let formatData = dataList.filter((item) => {
                                    return item.legalAppId === i.legalAppId;
                                })
                                i.documentsList = formatData;
                            })
                            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: response.users } });
                            res.status(200).json(response);
                        })
                        */
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: response.users } });
                        res.status(200).json(response);
                    }
                    else
                    {
                        response = responseFormat.getResponseMessageByCodes(['errorText:noImmigration'], { code: 417 });
                        res.status(200).json(response);
                    }
                });

        } else {
            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
            res.status(200).json(response);
        }
    }

    getAllImmigrationapplications(employeeDetailsId) {
        return new Promise((resolve, reject) => {
            if (employeeDetailsId) {
                immigrationModel.immigrationAppList(employeeDetailsId)
                    .then((isUsers) => {
                        let arr = _.map(isUsers, 'legalAppId');
                        resolve({
                            users: isUsers,
                            legalAppIds: arr
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    })
            }
        });
    }


    /**
     * Get Immigration Applications By Id
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getImmigrationapplicationsById(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            legalAppId = req.params.legalAppId,
            respData = {},
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        if (legalAppId) {
            /**
             * check value is integer
             */
            if (isNaN(legalAppId)) {
                response = responseFormat.getResponseMessageByCodes(['common404'], { code: 404 });
                res.status(404).json(response);
            } else {

                /**
                 * get legalrequest details
                 */
                immigrationModel.getLegalRequestById(legalAppId, employeeDetailsId)
                .then((isLegalRequest) => { 
                    if (isLegalRequest.length) {
                        respData = isLegalRequest;                         
                        /**
                         * get documents list
                         */
                        immigrationModel.getApplicationDocListByConditions(legalAppId, employeeDetailsId, respData[0].appType)
                        .then((docList) => {
                            if (respData.length) {

                                respData[0].documentsList = docList;
                            }

                            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: respData } });
                            res.status(200).json(response);

                        })
                        .catch((error) => {
                            let resp = commonMethods.catchError('immigrations-application-controller/getApplicationDocListByLegalAppId', error);
                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                            res.status(resp.code).json(response);
                        });
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['errorText:legalAppId'], { code: 417 }); 
                        res.status(200).json(response);
                    }
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('immigrations-application-controller/getImmigrationapplicationsById getLegalRequestById process', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                });
            }
        } else {
            response = responseFormat.getResponseMessageByCodes(['errorText:legalAppId'], { code: 417 });
            res.status(200).json(response);
        }
    }

    /**
     * Get All Lookups data
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getAllLookups(req, res, next) {
        let response = responseFormat.createResponseTemplate();

        let respData = [{
            applicationForList: null,
            priorityList: null,
            applicationTypeList: null,
            currentEmploymentStatusList: null,
            skillCategoryList: null
        }];

        /**
         * get ApplicationForList
         */
        userModel.getUserLookupData(enums.appRefParentId.appForParentId)
            .then((application) => {
                respData[0].applicationForList = application;

                /**
                 * get priorityList
                 */
                userModel.getUserLookupData(enums.appRefParentId.appPriorityParentId)
                    .then((priority) => {
                        respData[0].priorityList = priority;

                        /**
                         * get applicationTypeList
                         */
                        immigrationModel.getApplicationTypeList()
                            .then((type) => {
                                respData[0].applicationTypeList = type;

                                /**
                                 * get currentEmploymentStatusList
                                 */


                                respData[0].currentEmploymentStatusList = [
                                    {
                                        keyId: enums.currentEmploymentStatusList.F1,
                                        keyName: Object.keys(enums.currentEmploymentStatusList)[1]
                                    },
                                     {
                                        keyId: enums.currentEmploymentStatusList.H1,
                                        keyName: Object.keys(enums.currentEmploymentStatusList)[0]
                                    },
                                      {
                                        keyId: enums.currentEmploymentStatusList.H4,
                                        keyName: Object.keys(enums.currentEmploymentStatusList)[4]
                                    },

                                    {
                                        keyId: enums.currentEmploymentStatusList.IND,
                                        keyName: Object.keys(enums.currentEmploymentStatusList)[5]
                                    },
                                   
                                    {
                                        keyId: enums.currentEmploymentStatusList.L1,
                                        keyName: Object.keys(enums.currentEmploymentStatusList)[2]
                                    },
                                    {
                                        keyId: enums.currentEmploymentStatusList.L2,
                                        keyName: Object.keys(enums.currentEmploymentStatusList)[3]
                                    }, 
                                    {
                                        keyId: enums.currentEmploymentStatusList.OTHER,
                                        keyName: Object.keys(enums.currentEmploymentStatusList)[6]
                                    }];

                                /**
                                 * get skillCategoryList
                                 */
                                immigrationModel.getSkillLCategoryist()
                                    .then((skill) => {
                                        respData[0].skillCategoryList = skill;

                                        response = responseFormat.getResponseMessageByCodes([''], { content: { dataList: respData } });
                                        res.status(200).json(response);
                                    })
                                    .catch((error) => {
                                        let resp = commonMethods.catchError('immigrations-application-controller/getAllLookups getSkillLCategoryist process', error);
                                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                        res.status(resp.code).json(response);
                                    });

                            })
                            .catch((error) => {
                                let resp = commonMethods.catchError('immigrations-application-controller/getAllLookups getApplicationTypeList process', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            });
                    })
                    .catch((error) => {
                        let resp = commonMethods.catchError('immigrations-application-controller/getAllLookups getPriorityList process', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    });
            })
            .catch((error) => {
                let resp = commonMethods.catchError('immigrations-application-controller/getAllLookups getApplicationForList process', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            });
    }

    /**
     * Get Documents By App Type
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getDocumentsByAppType(req, res, next) {
        let response = responseFormat.createResponseTemplate();
        let apptypeId = req.params.appTypeId;
        if (apptypeId) {
            immigrationModel.getLegalAppTypeById(apptypeId)
                .then((isLegalAppType) => {
                    if (isLegalAppType) {
                        immigrationModel.getDocumentsListByType(apptypeId)
                            .then((document) => {
                                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: document } });
                                res.status(200).json(response);
                            })
                            .catch((error) => {                               
                                let resp = commonMethods.catchError('immigrations-application-controller/getDocumentsByAppType', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            });
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['apptypeid'], { code: 417 });
                        res.status(200).json(response);
                    }
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('immigrations-application-controller/getDocumentsByAppType', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        } else {
            response = responseFormat.getResponseMessageByCodes(['apptypeid'], { code: 417 });
            res.status(200).json(response);
        }
    }

    /**
     * Save Immigration applications
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postAddImmigrationapplications(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            reqBody = {
                employeeDetailsId: employeeDetailsId,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                contactNumber: req.body.contactNumber,
                appForId: req.body.appForId,
                appPriorityId: req.body.appPriorityId,
                appType: req.body.appType,
                currentStatus: req.body.currentStatus,
                comments: req.body.comments,
                skillCategoryId: req.body.skillCategoryId
            }


        msgCode = immigrationValidation.addImmigrationApplicationValidation(reqBody);
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            immigrationModel.getLegalAppTypeByAppTypeCode(reqBody.appType)
                .then((legalapptype) => {
                    if (legalapptype) {
                        immigrationModel.postAddImmigrationapplications(reqBody)
                            .then((application) => {
                                
                                immigrationModel.getApplicationDetails(application.content.dataList[0].legalAppId)
                                .then( dtl => {
                                  
                                    // Email to applicant 
                                    let data = [
                                            {name : "USERFIRSTNAME", value : dtl[0].UserFirstName},
                                            {name : "APPLICATIONFOR", value : dtl[0].ApplicationFor},
                                            {name : "PRIORITYLEVEL", value : dtl[0].AppPriority},
                                            {name : "TYPE", value : dtl[0].AppType},
                                            {name : "EMPLOYMENTSTATUS", value : dtl[0].CURRENT_STATUS},
                                            {name : "SKILLS", value : dtl[0].SkillCategory},
                                            {name : "LEGALSUPPORTNAME", value : ''},
                                            {name : "LEGALSUPPORTEMAIL", value : ''},
                                            {name : "LEGALSUPPORTCONTACT", value : ''},
                                        ];
                                    let options = {        
                                            mailTemplateCode : enums.emailConfig.codes.immigrationApplication.code,
                                            toMail : [{mailId : dtl[0].UserEmailId, displayName : dtl[0].UserName, employeeId: employeeDetailsId}],                                                                    
                                            placeHolders : data,
                                            replyToEmailid : 'LEGALSUPPORTEMAIL'                                     
                                    }

                                    emailModel.mail(options, 'immigration-application-controller/postAddImmigrationapplications applicant-mail')
                                    .then( rs =>{ })

                                    // Email to Legal  
                                    let data_lg = [
                                            {name : "APPLICANTNAME", value : dtl[0].ApplicantName},
                                            {name : "APPLICANTEMAIL", value : dtl[0].ApplicantEmailId},
                                            {name : "APPLICANTPHONE", value : commonMethods.toUSFormat(dtl[0].Phone)},
                                            {name : "APPLICATIONFOR", value : dtl[0].ApplicationFor},
                                            {name : "PRIORITYLEVEL", value : dtl[0].AppPriority},
                                            {name : "TYPE", value : dtl[0].AppType},
                                            {name : "EMPLOYMENTSTATUS", value : dtl[0].CURRENT_STATUS},
                                            {name : "SKILLS", value : dtl[0].SkillCategory},
                                            {name : "COMMENTS", value : dtl[0].APP_COMMENT},
                                            {name : "RECRUITERNAME", value : dtl[0].RecruiterName},
                                            {name : "STATUS", value : dtl[0].APPStatus},
                                            {name : "RECRUITEREMAIL", value : dtl[0].RecruiterEmailid},
                                            {name : "REPRESENTATIVENAME", value : dtl[0].LegalRepName},
                                            {name : "REPRESENTATIVEEMAIL", value : dtl[0].LegalRepEmailid}
                                            
                                        ];
                                    let options_lg = {        
                                            mailTemplateCode : enums.emailConfig.codes.supportMails.legal,
                                            toMail : [{mailId : '', displayName : '', configKeyName : 'LEGALSUPPORTEMAIL'}],
                                            placeHolders : data_lg                                            
                                    }
                               
                                    emailModel.mail(options_lg, 'immigration-application-controller/postAddImmigrationapplications legal-mail')
                                    .then( rs =>{ })

                                })
                                
                                res.status(200).json(application);
                            })
                            .catch((error) => {
                                let resp = commonMethods.catchError('immigrations-application-controller/getLegalAppTypeByAppTypeCode', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['appType'], { code: 417 });
                        res.status(200).json(response);
                    }
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('immigrations-application-controller/getLegalAppTypeByAppTypeCode', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Save Documents against application
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    postAddDocuments(req, res, next) 
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            reqBody = {
                checkListId: req.body.checkListId,
                legalDocName: req.body.legalDocName,
                legalDocument: req.body.legalDocument
            };

        let immigrationVars = enums.uploadType.legalImmigration;
        msgCode = immigrationValidation.addDocumentsValidation(req.body, immigrationVars.allowedExt);

        if (msgCode.length) {

            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            immigrationModel.getVisaChecklistDetailsById(reqBody.checkListId)
            .then((checklist) => {
                if (checklist) {
                    let fileName = reqBody.legalDocName;
                    let extension = (path.extname(fileName)).substr(1).toLowerCase().trim();
                    let fileNameWithoutExtension = (fileName.slice(0, -(extension.length + 1))).replace(/[^a-z0-9$\-_.+!*'(),]/gi, '');

                    // find PJEMPLOYEEID of user to pass as upload file parameter
                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                    .then( emp => {
                        commonMethods.fileUpload(req.body.legalDocument, reqBody.legalDocName, immigrationVars.docTypeId, emp.employeeId, null, employeeDetailsId)
                        .then((docFileUpload) => {
                            if (docFileUpload.isSuccess) {
                                reqBody.legalDocName = fileNameWithoutExtension;
                                reqBody.legalDocFilePath = immigrationVars.path + '/' + docFileUpload.fileName;
                                reqBody.legalDocFileName = docFileUpload.fileName;
                                reqBody.legalDocFileExt = extension;
                                reqBody.pjEmployeeId = emp.employeeId;
                                reqBody.createdBy = employeeDetailsId;
    
                                immigrationModel.postAddDocuments(reqBody)
                                .then((application) => {
                                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                    res.status(200).json(response);
                                })
                                .catch((error) => {
                                    let resp = commonMethods.catchError('immigrations-application-controller/postAddDocuments', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })
                            } else {
                                response = responseFormat.getResponseMessageByCodes(['legalDocName:' + docFileUpload.msgCode[0]], { code: 417 });
                                res.status(200).json(response);
                            }
                        })
                    })

                } else {
                    response = responseFormat.getResponseMessageByCodes(['checkListId'], { code: 417 });
                    res.status(200).json(response);
                }
            })
            .catch((error) => {
                let resp = commonMethods.catchError('immigrations-application-controller/postAddDocuments getVisaChecklistDetailsById', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
        }

    }

    /**
     * Update Immigration applications
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    putUpdateImmigrationapplications(req, res, next) {

        let response = responseFormat.createResponseTemplate(),
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId,
            msgCode = [],
            reqBody = {
                employeeDetailsId: employeeDetailsId,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                legalAppId: req.body.legalAppId,
                email: req.body.email,
                contactNumber: req.body.contactNumber,
                eacNumber: req.body.eacNumber,
                appForId: req.body.appForId,
                appPriorityId: req.body.appPriorityId,
                appType: req.body.appType,
                currentStatus: req.body.currentStatus,
                comments: req.body.comments,
                skillCategoryId: req.body.skillCategoryId
            };
            

        msgCode = immigrationValidation.updateImmigrationApplicationValidation(reqBody);
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            immigrationModel.getLegalRequestById(reqBody.legalAppId, employeeDetailsId)
                .then((isLegalRequest) => { 
                    if (isLegalRequest && isLegalRequest.length) {

                        if (isLegalRequest[0].appStatus == null || isLegalRequest[0].appStatus == 'Pending') {

                            reqBody.comments = (reqBody.comments) ? reqBody.comments : (reqBody.comments == "") ? reqBody.comments = "" : isLegalRequest[0].comments;

                            immigrationModel.putUpdateImmigrationapplications(reqBody)
                                .then((application) => { 
                                    if(application.success)
                                    {
                                        immigrationModel.getApplicationDetails(req.body.legalAppId)
                                        .then( dtl => { 
                                            // Email to Legal  
                                            let data_lg = [
                                                    {name : "APPLICANTNAME", value : dtl[0].ApplicantName},
                                                    {name : "APPLICANTEMAIL", value : dtl[0].ApplicantEmailId},
                                                    {name : "APPLICANTPHONE", value : commonMethods.toUSFormat(dtl[0].Phone)},
                                                    {name : "APPLICATIONFOR", value : dtl[0].ApplicationFor},
                                                    {name : "PRIORITYLEVEL", value : dtl[0].AppPriority},
                                                    {name : "TYPE", value : dtl[0].AppType},
                                                    {name : "EMPLOYMENTSTATUS", value : dtl[0].CURRENT_STATUS},
                                                    {name : "SKILLS", value : dtl[0].SkillCategory},
                                                    {name : "COMMENTS", value : dtl[0].APP_COMMENT},
                                                    {name : "RECRUITERNAME", value : dtl[0].RecruiterName},
                                                    {name : "STATUS", value : dtl[0].APPStatus},
                                                    {name : "RECRUITEREMAIL", value : dtl[0].RecruiterEmailid},
                                                    {name : "REPRESENTATIVENAME", value : dtl[0].LegalRepName},
                                                    {name : "REPRESENTATIVEEMAIL", value : dtl[0].LegalRepEmailid}
                                                    
                                                ];
                                            let options_lg = {        
                                                    mailTemplateCode : enums.emailConfig.codes.supportMails.legal,
                                                    toMail : [{mailId : '', displayName : '', configKeyName : 'LEGALSUPPORTEMAIL'}],
                                                    placeHolders : data_lg                                                    
                                            }
                                           
                                            emailModel.mail(options_lg, 'immigration-application-controller/postAddImmigrationapplications legal-mail')
                                            .then( rs =>{ })
                                        });
                                    }

                                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                    res.status(200).json(response);
                                })
                                .catch((error) => {
                                    let resp = commonMethods.catchError('immigrations-application-controller/putUpdateImmigrationapplications', error);
                                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                    res.status(resp.code).json(response);
                                })
                        } else {
                            response = responseFormat.getResponseMessageByCodes(['errorText:cantUpdateImmigration'], { code: 417 });
                            res.status(200).json(response);
                        }
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['legalAppId'], { code: 417 });
                        res.status(200).json(response);
                    }

                })
                .catch((error) => {
                    let resp = commonMethods.catchError('immigrations-application-controller/putUpdateImmigrationapplications', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
     * Delete Immigration Documents
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    deleteImmigrationDocuments(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            msgCode = [],
            reqBody = {
                checkListId: req.params.checkListId
            }
        msgCode = immigrationValidation.deleteImmigrationDocumentsValidation(reqBody);
        if (msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            immigrationModel.getVisaChecklistDetailsById(reqBody.checkListId)
                .then((checklist) => {
                    if (checklist) {
                        immigrationModel.deleteImmigrationDocuments(reqBody)
                            .then((application) => {
                                response = responseFormat.getResponseMessageByCodes(['success:deleted']);
                                res.status(200).json(response);
                            })
                            .catch((error) => {
                                let resp = commonMethods.catchError('immigrations-application-controller/deleteImmigrationDocuments', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    } else {
                        response = responseFormat.getResponseMessageByCodes(['checkListId'], { code: 417 });
                        res.status(200).json(response);
                    }
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('immigrations-application-controller/deleteImmigrationDocuments getVisaChecklistDetailsById', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }

    /**
    * get immigration filing static page
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument 
    */
    getImmigrationFiling(req, res, next) {

        let response = responseFormat.createResponseTemplate();

        immigrationModel.getImmigartionFilingStaticPage(enums.immigrationFiling.faqId)
            .then((contentPage) => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: contentPage } });
                res.status(200).json(response);
            })
            .catch((error) => {
                let resp = commonMethods.catchError('immigrations-application-controller/getImmigrationFiling', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
    }


    getImmigrationapplicationsAllByEmpId(req, res, next) { 
        
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded ? req.tokenDecoded.data.employeeDetailsId : 0;
        let msgCode = [];
        let userInfo = {};
        let self = this;
        let guid = req.body.guid || '';

        if(guid == '' && employeeDetailsId == 0)
        {
            msgCode.push('guid');
        }

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {

            async.series([
                function(done)
                {
                    if(employeeDetailsId == 0)
                    {
                        accountModel.getUserCredentialByGuid(guid)
                        .then( rs => {
                            if(rs)
                            {
                                employeeDetailsId = rs.employeeDetailsId;
                                done();
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['guid'], { code: 417 });
                                res.status(200).json(response);
                            }
                        }).catch(err => {
                            done(err)
                        })

                    }
                    else
                    {
                        done();
                    }
                },
                function(done)
                {
                    benefitModel.getUserDetails(employeeDetailsId)
                    .then( rs => {
                        if(rs)
                        {
                            userInfo['firstName'] = rs.firstName;
                            userInfo['lastName'] = rs.lastName;
                            userInfo['email'] = rs.emailId;
                            userInfo['workAuthorization'] = rs.authorisationStatus;
                            userInfo['userType'] = rs.employeeType;
                            userInfo['userTypeId'] = rs.employeeTypeId;
                            userInfo['contactNumber'] = rs.contactNumber;
                            userInfo['onProject'] = rs.activeProjects < 1 ? 'no' : 'yes';
                            done();
                        }
                        else
                        {
                            done('User not found')
                        }
                    })
                },
                function(done)
                {
                    self.getAllImmigrationapplications(employeeDetailsId)
                    .then((response) => { 
                        
                        let selApp = [enums.immigration.status.attorneyReview, enums.immigration.status.pending, enums.immigration.status.paraLegalReview];
                        let iApp = [];
                        if(response.users.length)
                        {
                            iApp = response.users.filter( i => {
                                return selApp.indexOf(i.appStatusId) > -1;
                            })
                        }
                        
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [{'userInfo': userInfo, 'list': iApp.length ? iApp : []}] } });
                        res.status(200).json(response);
                    });
                }
            ],function(err, result) {
                if(err)
                {
                    let resp = commonMethods.catchError('immigration-controller/getImmigrationapplicationsAllByEmpId', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
            })

        }
        
    }

    getImmigrationDocumentByEmpId(req, res, next) { 
        
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let msgCode = [];

        

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            // find Document list by employee Id
            crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
            .then( empDetail => {

                crudOperationModel.findAllByCondition(DMS, {empClientVendorId : ''+empDetail.employeeDetailsId, folderName: 'Legal', showToConslt: 1 },
                        [
                            ["DMS_Id", "dmsId"], ["Created_By", "createdBy"], 
                            ["File_Name", "fileName"], ["Status", "status"], 
                            ["Document_Name", "documentName"], 
                            ["Created_Date", "createdDate"], 
                        ],
                        ["Created_Date", "DESC"])
                .then( data => {

                    let basePath = config.portalHostUrl+config.documentBasePath+enums.uploadType.legalImmigration.path+'/'+empDetail.employeeDetailsId+'/Legal/';
                    data.forEach(function (item) {
                        item.fileName = basePath+item.fileName;
                    });
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: data } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('immigartion-controller/getImmigrationDocumentByEmpId', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                });
            });
        }
        
    }

    uploadAttachment(req, res, next)
    {
        let employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        let response = responseFormat.createResponseTemplate();
        let msgCode = [];

        let docName = req.body.docName ? req.body.docName.trim() : '';
        let fileName = req.body.fileName ? req.body.fileName.trim() : '';
        let fileData = req.body.fileData;
        let legalAppId = req.body.legalAppId ? req.body.legalAppId : 0; 
        let legalDocId = 1;

        let docVars = enums.uploadType.legalImmigration;
        let pjEmployeeId = null;
        let placementTrackerId = null;

        if(!legalAppId || legalAppId == 0)
        {
            msgCode.push('legalAppId')
        }
        if(!docName || docName == '')
        {
            msgCode.push('docName')
        }
        if(!fileName || fileName == '')
        {
            msgCode.push('fileName')
        }
        if(!fileData || fileData == '')
        {
            msgCode.push('fileData')
        }
        if(docVars.allowedExt.indexOf(path.extname(fileName).substr(1)) < 0)
        {
            msgCode.push('fileName:allowedAttachments')
        }

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {
            async.series([
                function(done)
                {
                    // check if pj-employee-id created
                    crudOperationModel.findModelByCondition(EmployeeDetails, {employeeDetailsId : employeeDetailsId})
                    .then( rs => {
                        if(rs)
                        {   
                            if(rs.employeeId)
                            {
                                pjEmployeeId = rs.employeeId;
                                done();
                            }
                            else
                            {
                                done();
                            }
                        }
                        else
                        {
                            done('invalid user')
                        }
                    }).catch( err => {
                        done(err)
                    })
                },
                function(done)
                {
                    // GET COUNT OF DOCUMENT FOR A LEGAL APP
                    crudOperationModel.findAllByCondition(DMS, {legalAppId : legalAppId})
                    .then( legalDocs => {
                        legalDocId = legalDocs.length + 1;
                        done();
                    }).catch( err => {
                        done(err)
                    })
                },
                function(done)
                {
                    //upload doc
                    commonMethods.fileUpload(fileData, fileName, docVars.docTypeId, pjEmployeeId, null, employeeDetailsId)
                    .then((docFileUpload) => {
                        if (docFileUpload.isSuccess) 
                        {
                            let docData = {
                                employeeId: employeeDetailsId,
                                legalAppId: legalAppId,
                                legalDocId: legalDocId,
                                documentModule : 1,
                                empClientVendorId : employeeDetailsId,
                                fileName: docFileUpload.fileName,
                                documentName: docName, 
                                folderName: 'Legal',
                                createdDate: new Date(),
                                createdBy: employeeDetailsId,
                                status : 1,
                                dataInsertFrom : enums.dataInsertFrom.immigration,
                                showToConslt: 1,
                                placementTrackerId : placementTrackerId
                            };
                            
                            crudOperationModel.saveModel(DMS, docData, { dmsId : 0 })
                            .then((result) => { 
                                if(result)
                                {
                                    response = responseFormat.getResponseMessageByCodes(['success:saved']);
                                    res.status(200).json(response);
                                }
                                else
                                {
                                    done(' error saving document info in database ')
                                }
                            }).catch(err => {
                                done(err)
                            })
                        }
                        else
                        {
                            response = responseFormat.getResponseMessageByCodes(['fileName:' + docFileUpload.msgCode[0]], { code: 417 });
                            res.status(200).send(response)
                        }
                    }).catch( err => { 
                        done(err)
                    })
                },
            ], function(err, result) {
                if(err)
                {
                    let resp = commonMethods.catchError('immigartion-application-controller/uploadAttachment final - ', err);
                    response = responseFormat.getResponseMessageByCodes(['errorText:errorFileUpload'], { code: resp.code });
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
}
