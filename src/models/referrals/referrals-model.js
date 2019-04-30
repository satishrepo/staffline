/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import CommonMethods from "../../core/common-methods";

import moment from 'moment';
import enums from '../../core/enums';
import path from 'path';


/**
 *  -------Initialize global variabls-------------
 */

let config = configContainer.loadConfig();

export default class ReferralsModel {

    constructor() {

    }


    getMyReferrals(employeeDetailsId) {
        let query = "EXEC API_SP_GetMyReferrals @employeeDetailsId=\'" + employeeDetailsId + "\' ";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (!details.length) {
                    return [];
                }
                // let sts = enums.interviewStatus;
                details.forEach(item => {
                    item.workStatus = item.jobSearchStatusId == enums.appRefParentId.onProjectId ? 'On Project' : 'Available';
                    item.onProject = item.jobSearchStatusId == enums.appRefParentId.onProjectId ? 'Y' : 'N';
                    item.dueAmount = 500;
                    item.totalAmount = 1500;
                    item.dueIn = '3 Months';                    
                })
                return details;
            });
    }

    contactreferrals(employeeDetailsId, pageCount, pageSize) {
        let query = "EXEC API_SP_GetMyReferrals_new @employeeDetailsId=" + employeeDetailsId + ",@pageNum=" + pageCount + ",@pageSize=" + pageSize;

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let paging = {
                    totalCount: 0,
                    currentPage: enums.paging.pageCount,
                },
                    data = [];

                if (details) {

                    paging.totalCount = (details[0].totalCount) ? details[0].totalCount : 0;
                    paging.currentPage = (details[1].currentPage) ? details[1].currentPage : enums.paging.pageCount;
                    data = details.splice(2, details.length);

                    data.forEach(item => {
                        item.workStatus = item.jobSearchStatusId == enums.appRefParentId.onProjectId ? 'On Project' : 'Available';
                        item.onProject = item.jobSearchStatusId == enums.appRefParentId.onProjectId ? 'Y' : 'N';
                        item.dueAmount = 500;
                        item.totalAmount = 1500;
                        item.dueIn = '3 Months';
                    })
                }

                return [{
                    paging: paging,
                    data: data
                }];

            });
    }

    getActiveApplication(employeeDetailsId) {
        let query = "EXEC API_SP_Candidate_Active_Job_List @employeeDetailsId=\'" + employeeDetailsId + "\' ";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                return details;
            });
    }


    getBankDetails(employeeDetailsId) {
        let query = "EXEC API_S_uspGetBankDetails @EmployeeDetails_Id=\'" + employeeDetailsId + "\' ";

        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                if (details.length) {
                    details.forEach(item => {
                        item.chequeUploadAttachmentName = (item.chequeUploadAttachmentName) ? config.portalHostUrl + config.documentBasePath + enums.uploadType.bankDetails.path + '/' + item.chequeUploadAttachmentName : item.chequeUploadAttachmentName;
                    })

                    return details;
                }
                else {
                    return details;
                }

            });
    }




}