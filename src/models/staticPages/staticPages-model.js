/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from "../../core/db";
import logger from "../../core/logger";
import configContainer from "../../config/localhost";
import { staticPageDetails } from "../../entities/staticPages/staticPages";
import moment from 'moment';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();


export default class StaticPagesModel {

    constructor() {
        //
    }

    /**
     * Get about hr
     * @param {*} section : name od section calling static pages 
     */
    getStaticPage(pageReferenceId) {
        let query = "EXEC API_SP_GetStaticPageContent @PageReferenceId=\'" + pageReferenceId + "\' ";
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let pageContent = [];
                if (details.length) {
                    details.forEach(function (item) {
                        pageContent.push({
                            staticContentsId: item.StaticContents_Id,
                            pageReferenceId: item.PageReference_Id,
                            pageContentsEmployee: item.PageContents_Employee,
                            pageContentsAdminPortal: item.PageContents_AdminPortal,
                            specialNotes: item.SpecialNotes,
                            status: item.Status,
                            createdBy: item.Created_By,
                            createdDate: item.Created_Date,
                            modifedBy: item.Modified_By,
                            modifiedData: item.Modified_Data,
                        })
                    });
                }
                return pageContent;
            })
    }

    getPayrollCalender(frequencyId, year)
    {
        let query = "EXEC API_SP_GetPayrollCalender @frequencyId=" + frequencyId + ", @year = "+ year;
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((details) => {
                let pageContent = [];
                if (details.length) {
                    details.forEach(function (item) {
                        pageContent.push({
                            fromDate:  item.fromDate, 
                            payrollDate: item.payrollDate,
                            toDate: item.toDate,

                            formattedFromDate:  moment(item.fromDate).format('MMM DD, YYYY'), 
                            formattedPayrollDate: moment(item.payrollDate).format('MMM DD, YYYY'),
                            formattedToDate: moment(item.toDate).format('MMM DD, YYYY')
                        })
                    });
                }
                return pageContent;
            });
    }
}