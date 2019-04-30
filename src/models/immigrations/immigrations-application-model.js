/**
 *  -------Import all classes and packages -------------
 */
import { LegalRequest } from "../../entities/immigrations/legal-request";
import { VisaCheckListDetails } from "../../entities/immigrations/visa-check-list-details";
import { Legalappchecklist } from "../../entities/immigrations/legal-app-check-list";
import { skillCategoryList, applicationForList, currentEmploymentStatusList, legalAppType, priorityList } from "../../entities/immigrations/immigration-lookups";
import { dbContext, Sequelize } from "../../core/db";
import logger from "../../core/logger";
import configContainer from "../../config/localhost";
import responseFormat from "../../core/response-format";
import { FaqMaster } from "../../entities/faqs/faqs";
import enums from '../../core/enums';
import CommonMethods from '../../core/common-methods';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

let commonMethods = new CommonMethods();

export default class ImmigrationModel {

    constructor() {
        //
    }

    /**
     * Get LegalAppType By AppTypeCode
     * @param {*} legalAppTypeCode : AppTypeCode
     */
    getLegalAppTypeByAppTypeCode(legalAppTypeCode) {
        return legalAppType.findOne({
            where: {
                APPTYPECODE: legalAppTypeCode.toString().trim()
            },
            raw: true,
            attributes: [
                ["APPTYPEID", "appTypeId"],
                ["APPTYPECODE", "appTypeCode"],
                ["APPTYPENAME", "appTypeName"]
            ]
        })
            .then((legalAppTypeDet) => {
                return legalAppTypeDet;
            })
    }

    /**
     * Get LegalAppType By legalAppTypeId
     * @param {*} legalAppTypeId : AppTypeId
     */
    getLegalAppTypeById(legalAppTypeId) {
        return legalAppType.findOne({
            where: {
                APPTYPEID: legalAppTypeId.toString()
            },
            raw: true,
            attributes: [
                ["APPTYPEID", "appTypeId"],
                ["APPTYPECODE", "appTypeCode"],
                ["APPTYPENAME", "appTypeName"]
            ],
            order: [
                ['APPTYPEID', 'DESC']
            ]
        })
            .then((legalAppTypeDet) => {
                return legalAppTypeDet;
            })
    }

    /**
     * Get VisaChecklistDetails By checkListId
     * @param {*} checkListId
     */
    getVisaChecklistDetailsById(checkListId) {
        return VisaCheckListDetails.findOne({
            where: {
                CHECKLISTID: checkListId
            },
            raw: true,
            attributes: [
                ["CHECKLISTID", "checkListId"],
                ["LEGALAPPID", "legalAppId"],
                ["DOCUMENTID", "documentId"],
                ["STATUS", "status"],
                ["CREATED_BY", "createdBy"],
                ["CREATED_DATE", "createdDate"],
                ["REMARKS", "remarks"],
                ["LEGALDOCID", "legalDocId"],
            ]
        })
            .then((checkListRequest) => {
                return checkListRequest;
            })
    }

    /**
     * Delete Immigration Documents
     * @param {*} reqData : data sent in request body
     */
    deleteImmigrationDocuments(reqData) {
        let query = "EXEC API_SP_DeleteLegalDocuments @CHECKLISTID=\'" + reqData.checkListId + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            })
    }

    /**
     * Save Documents
     * @param {*} reqData :data sent in request body
     */
    postAddDocuments(reqData) {
        let query = "EXEC API_SP_AddLegalDocumentsNew "
            + " @CHECKLISTID= :checkListId "
            + ",@LEGALDOC_NAME= :legalDocName "
            + ",@LEGALDOC_FILEPATH= :legalDocFilePath "
            + ",@LEGALDOC_FILENAME= :legalDocFileName "
            + ",@LEGALDOC_FILEEXT= :legalDocFileExt "
            + ",@PJ_EMPLOYEEID= :pjEmployeeId "
            + ",@CREATED_BY= :createdBy ";

        return dbContext.query(query, {
            replacements:
            {
                checkListId: reqData.checkListId,
                legalDocName: reqData.legalDocName,
                legalDocFilePath: reqData.legalDocFilePath,
                legalDocFileName: reqData.legalDocFileName,
                legalDocFileExt: reqData.legalDocFileExt,
                pjEmployeeId: reqData.pjEmployeeId,
                createdBy: reqData.createdBy,

            },
            type: dbContext.QueryTypes.SELECT
        })
            .then((details) => {
                return details;
            })
    }

    /**
     * Get immigrationApplication List
     * @param {*} employeeDetailsId : logged in employee details id
     */
    immigrationAppList(employeeDetailsId) {
        let query = "EXEC API_SP_GetImmigrationApplications @EmployeeDetails_Id=\'" + employeeDetailsId + "\' "; 
        // console.log(query);
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((legalRequest) => {
                return legalRequest;
            })
    }

    /**
     * Get ApplicationDocList By LegalAppId
     * @param {*} legalAppId : legalAppId 
     * @param {*} employeeDetailsId : logged in employee details Id
     */
    getApplicationDocListByConditions(legalAppIds, employeeDetailsId, appType) {
        /*
        console.log(legalAppIds, employeeDetailsId,appType)
        let Ids = (Array.isArray(legalAppIds)) ? legalAppIds.join(",") : legalAppIds;
        let where = " Charindex('',''+cast(vcl.LEGALAPPID as varchar(8000))+'','', ''," + Ids + ",'') > 0  AND EmployeeDetail_id = " + ~~employeeDetailsId;
        let query = "EXEC API_S_uspImmigration_GetApplicationDocListByCondition @where=\'" + where + "\' ";
        */

        let query = "EXEC API_S_uspImmigration_GetApplicationDocListByCondition @pintLegalAppId = "+legalAppIds+ ", @pintAppTypeCode= '"+ appType + "'";

        let legalVars = enums.uploadType.legalImmigration;
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                details.forEach(item => {
                    let docId = item.documentStatusId;
                    if(docId == 0 || docId == 1 || docId == 2 || docId == 3 || docId == 4){
                        item.documentStatus = enums.immigration.documentStatus[docId]['value'];
                    }else{
                        item.documentStatus = '';
                    }
                    
                    item.actionButton = { "label": item.buttonLabel, "action": item.buttonAction };
                    item.legalDocFilePath = item.legalDocFileName ? config.portalHostUrl + config.documentBasePath + legalVars.path + '/' + employeeDetailsId + '/'+ item.legalFolder + '/' + item.legalDocFileName : '';
                    delete item.buttonLabel; delete item.buttonAction;
                })
                //details = JSON.parse(JSON.stringify(details).replace(/'/g, "''").replace(/null/g, "\"\"").replace(/"\"\""/g, "\"\""));
                return details;
            })
    }

    getApplicationListByConditions(legalAppIds, employeeDetailsId) {
      
       
        let Ids = (Array.isArray(legalAppIds)) ? legalAppIds.join(",") : legalAppIds;
        let where = " Charindex('',''+cast(vcl.LEGALAPPID as varchar(8000))+'','', ''," + Ids + ",'') > 0  AND EmployeeDetail_id = " + ~~employeeDetailsId;
        let query = "EXEC API_S_uspImmigration_GetApplicationListByCondition @where=\'" + where + "\' ";
    
        // console.log(query);
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                details.forEach(item => {
                    item.actionButton = { "label": item.buttonLabel, "action": item.buttonAction };
                    item.legalDocFilePath = item.legalDocFilePath ? config.portalHostUrl + config.documentBasePath + item.legalDocFilePath : item.legalDocFilePath
                    delete item.buttonLabel; delete item.buttonAction;
                })
                details = JSON.parse(JSON.stringify(details).replace(/'/g, "''").replace(/null/g, "\"\"").replace(/"\"\""/g, "\"\""));
                return details;
            })
    }

    /**
     * Get LegalRequest By legalAppId and employeeDetailsId
     * @param {*} legalAppId : legalAppId
     * @param {*} employeeDetailsId :logged in employee details id
     */
    getLegalRequestById(legalAppId, employeeDetailsId) {
        let query = "EXEC API_SP_GetImmigrationApplicationsByLegalAppId @EmployeeDetails_Id=\'" + employeeDetailsId + "\' "
            + ",@LEGALAPPID=\'" + legalAppId + "\' ";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((legalRequest) => {
                // legalRequest = JSON.parse(JSON.stringify(legalRequest).replace(/'/g, "''").replace(/null/g, "\"\"").replace(/"\"\""/g, "\"\""));
                return legalRequest;
            })
    }

    /**
     * Update Immigrationapplications
     * @param {*} reqData : data sent in request body
     */
    putUpdateImmigrationapplications(reqData) {
        let response = responseFormat.createResponseTemplate();

        return LegalRequest.find({ where: { LEGALAPPID: reqData.legalAppId } })
            .then((isLegalRequest) => {
                if (isLegalRequest) {
                    let query = "EXEC API_SP_UpdateImmigrationApplication @EmployeeDetails_Id= ?  "
                        + ",@LEGALAPP_ID= ? "
                        + ",@FIRST_NAME= ? "
                        + ",@LAST_NAME= ? "
                        + ",@APP_FOR_ID=  ? "
                        + ",@APP_EMAIL= ? "
                        + ",@HOME_PHONE= ? "
                        + ",@APP_EACNUM= ? "
                        + ",@APP_PRIORITY= ? "
                        + ",@APP_TYPE= ? "
                        + ",@CURRENT_STATUS= ? "
                        + ",@APP_COMMENT= ? "
                        + ",@SkillCategoryId= ? ";

                    return dbContext.query(query, {
                        replacements:
                        [
                            reqData.employeeDetailsId,
                            reqData.legalAppId,
                            reqData.firstName,
                            reqData.lastName,
                            reqData.appForId,
                            reqData.email,
                            reqData.contactNumber,
                            reqData.eacNumber,
                            reqData.appPriorityId,
                            reqData.appType,
                            reqData.currentStatus,
                            reqData.comments,
                            reqData.skillCategoryId
                        ],
                        type: dbContext.QueryTypes.SELECT
                    })
                        .then((LegalRequest) => {
                            if (LegalRequest.length && LegalRequest[0].appId > 0) {
                                response = responseFormat.getResponseMessageByCodes(["success:saved"]);
                                return response;
                            } else {
                                response = responseFormat.getResponseMessageByCodes(["errorText:updateApplicationFailed"], { code: 417 });
                                return response;
                            }
                        })
                        .catch((error) => {
                            let resp = commonMethods.catchError('immigrations-application-model/putUpdateImmigrationapplications find process', error);
                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                            return response;
                        });
                } else {
                    response = responseFormat.getResponseMessageByCodes(["legalAppId"], { code: 417 });
                    return response;
                }
            })
            .catch((error) => {
                let resp = commonMethods.catchError('immigrations-application-model/putUpdateImmigrationapplications bulkCreate process', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                return response;
            });
    }

    /**
     * Add Immigrationapplications
     * @param {*} reqData :data sent in request body
     */
    postAddImmigrationapplications(reqData) {
        let response = responseFormat.createResponseTemplate(),
            comments = (reqData.comments) ? reqData.comments : "";
        let query = "EXEC API_SP_AddImmigrationApplication @EmployeeDetail_id= :employeeDetailsId "
            + ",@FIRST_NAME= :firstName "
            + ",@LAST_NAME= :lastName "
            + ",@APP_EMAIL= :email "
            + ",@HOME_PHONE= :contactNumber "
            + ",@APP_FOR_ID= :appForId "
            + ",@APP_PRIORITY= :appPriorityId "
            + ",@APP_TYPE= :appType "
            + ",@CURRENT_STATUS= :currentStatus "
            + ",@APP_COMMENT= :comments "
            + ",@SkillCategoryId= :skillCategoryId ";


        return dbContext.query(query, {
            replacements:
            {
                employeeDetailsId: reqData.employeeDetailsId,
                firstName: reqData.firstName,
                lastName: reqData.lastName,
                email: reqData.email,
                contactNumber: reqData.contactNumber,
                appForId: reqData.appForId,
                appPriorityId: reqData.appPriorityId,
                appType: reqData.appType,
                currentStatus: reqData.currentStatus,
                comments: comments,
                skillCategoryId: reqData.skillCategoryId
            },
            type: dbContext.QueryTypes.SELECT
        })
            .then((details) => { 
                if (details.length && details[0].LEGALAPPID) {
                    let legalAppId = details[0].LEGALAPPID,
                        appTypeId = details[0].APPTYPEID;

                    if (appTypeId > 0) {

                        /**
                         * get all documents list based on apptypeId
                         */
                        let query = "EXEC API_SP_GetDocumentListByApplicationType @AppTYpeId=\'" + appTypeId + "\' ";
                        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                            .then((docList) => {
                                if (docList.length) {

                                    let newDocList = [];
                                    for (let i = 0; i < docList.length; i++) {
                                        newDocList.push({
                                            LEGALAPPID: legalAppId,
                                            DOCUMENTID: docList[i].documentId,
                                            STATUS: 2,//1----Completed,0--NA,2--Pending
                                            CREATED_BY: reqData.employeeDetailsId,
                                            CREATED_DATE: new Date()
                                        });
                                    }
                                    return VisaCheckListDetails.bulkCreate(newDocList)
                                        .then((visaCheckList) => {
                                            response = responseFormat.getResponseMessageByCodes(["addApplicationSuccess"], { content: { dataList: [{ "legalAppId": legalAppId }] } });
                                            return response;
                                        })
                                        .catch((error) => {
                                            let resp = commonMethods.catchError('immigrations-application-model/postAddImmigrationapplications bulkCreate process', error);
                                            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                            return response;
                                        });
                                } else {
                                    response = responseFormat.getResponseMessageByCodes(["addApplicationSuccess"], { content: { dataList: [{ "legalAppId": legalAppId }] } });
                                    return response;
                                }
                            })
                    } else {
                        response = responseFormat.getResponseMessageByCodes(["appType:appTypeDoesNotExist"], { code: 417 });
                        return response;
                    }
                } else {
                    response = responseFormat.getResponseMessageByCodes(["addApplicationFailed"], { code: 417 });
                    return response;
                }
            })
            .catch((error) => {
                let resp = commonMethods.catchError('immigrations-application-model/postAddImmigrationapplications', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                return response;
            })
    }

    /**
     * Get ApplicationType List
     */
    getApplicationTypeList() {
        return legalAppType.findAll({
            where: {
                STATUS: 1
            },
            raw: true,
            attributes: [
                ["APPTYPEID", "appTypeId"],
                ["APPTYPECODE", "appTypeCode"],
                ["APPTYPENAME", "appTypeName"]
            ],
            order: [
                ['APPTYPENAME', 'ASC']
            ]
        })
            .then((AuthorizationStatus) => {
                return AuthorizationStatus;
            })
    }

    /**
     * Get Employment Status List
     */
    getEmploymentStatusList() {
        return currentEmploymentStatusList.findAll({
            where: {
                ACTIVITY_TYPE: "LS",
                ACTIVITY_STATUS: 1
            },
            attributes: [
                ["ACTIVITY_ID", "activityId"],
                ["ACTIVITY_NAME", "activityName"],
                ["ACTIVITY_TYPE", "activityType"]
            ],
            order: [
                ['ACTIVITY_ID', 'DESC']
            ]
        })
            .then((AuthorizationStatus) => {
                return AuthorizationStatus;
            })
    }

    /**
     * Get skill category List
     */
    getSkillLCategoryist() {
        return skillCategoryList.findAll({
            attributes: [
                ["HL_CATEGORY_ID", "id"],
                ["HL_CATEGORY_DESC", "name"]
            ],
            order: [
                ['HL_CATEGORY_DESC', 'ASC']
            ]
        })
            .then((AuthorizationStatus) => {
                return AuthorizationStatus;
            })
    }

    /**
     * Get DocumentsList By apptypeId
     * @param {*} apptypeId : apptypeId
     */
    getDocumentsListByType(apptypeId) {
        let query = "EXEC API_SP_GetDocumentListByApplicationType @AppTYpeId=\'" + apptypeId + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((documents) => {
                return documents;
            })
    }

    /**
     * get immigration filing static page
     * @param {*} faqId 
     */
    getImmigartionFilingStaticPage(faqId) {
        return FaqMaster.findAll({
            where: {
                FAQ_ID: faqId
            },
            attributes: [
                ["FAQ_Subject", "subject"],
                ["FAQ_Detail", "detail"]
            ]
        })
            .then((AuthorizationStatus) => {
                return AuthorizationStatus;
            })
    }

    getApplicationDetails(appId)
    {
        let query = "EXEC API_SP_usp_GetLegalDetailsByLegalAppId @LegalAppId=\'" + appId + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((detail) => {
                return detail;
            })
        
    }
}