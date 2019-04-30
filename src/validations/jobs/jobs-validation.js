/**
 * -------Import all classes and packages -------------
 */
import lengthValidation from './jobs-length-validation';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';

/**
 *  -------export Classes-------------
 */
export default class JobsValidation {

    constructor()
    { }

    /**
     * validation in search jobs
     * @param {*} reqBody : data in request body
     */
    jobSearchValidation(reqBody) {
        let commonMethods = new CommonMethods(), err = [];

        if ((reqBody.pageCount) && !commonMethods.isValidInteger(reqBody.pageCount)) {
            err.push('pageCount');
        }
        if ((reqBody.pageSize) && !commonMethods.isValidInteger(reqBody.pageSize)) {
            err.push('pageSize');
        }
        if ((reqBody.miles) && !commonMethods.isValidInteger(reqBody.miles)) {
            err.push('miles');
        }
        if ((reqBody.isHot) && !commonMethods.isValidInteger(reqBody.isHot)) {
            err.push('isHot');
        }
        if ((reqBody.jobCategory) && !(Array.isArray(reqBody.jobCategory))) {
            err.push('jobCategory');
        }
        if ((reqBody.jobAssignmentType) && !(Array.isArray(reqBody.jobAssignmentType))) {
            err.push('jobAssignmentType');
        }
        if ((reqBody.sortRelevance) && !((reqBody.sortRelevance.toString().toLowerCase() == 'a') || (reqBody.sortRelevance.toString().toLowerCase() == 'd'))) {
            err.push('relevance');
        }
        if ((reqBody.sortDate) && !((reqBody.sortDate.toString().toLowerCase() == 'a') || (reqBody.sortDate.toString().toLowerCase() == 'd'))) {
            err.push('date');
        }
        if (reqBody.jobListType && 
        !(reqBody.jobListType == enums.jobListType.localJobs 
        || reqBody.jobListType == enums.jobListType.otherLocationJobs 
        || reqBody.jobListType == enums.jobListType.similarJobs
        || reqBody.jobListType == enums.jobListType.matchingJobs
        )
        ) 
        {
            err.push('jobListType');
        }

        return err;
    }


    jobAlertValidation(reqBody) {
        let commonMethods = new CommonMethods(), err = [], searchParameter = reqBody.searchParameter;
        if (!reqBody.searchName) {
            err.push('searchName');
        }
        if (!reqBody.employeeDetailsId && !reqBody.email) {
            err.push('email');
        }
        if (!searchParameter.keyword && !searchParameter.location && !searchParameter.miles && !searchParameter.isHot && !searchParameter.jobCategory && !searchParameter.jobAssignmentType) {
            err.push('searchParameter');
        } else {
            if (!searchParameter.location && (searchParameter.miles || searchParameter.miles == "0")) {
                err.push('location');
            }
            if ((searchParameter.miles) && !commonMethods.isValidInteger(searchParameter.miles)) {
                err.push('miles');
            }
            if ((searchParameter.isHot) && !commonMethods.isValidInteger(searchParameter.isHot)) {
                err.push('isHot');
            }
            if ((searchParameter.jobCategory) && !(Array.isArray(searchParameter.jobCategory))) {
                err.push('jobCategory');
            }
            if ((searchParameter.jobAssignmentType) && !(Array.isArray(searchParameter.jobAssignmentType))) {
                err.push('jobAssignmentType');
            }
        }
        return err;
    }


    referJob(referObj, allowedExt) {
        let commonMethods = new CommonMethods();

        let err = [];

        if (!referObj.jobId || !commonMethods.isValidInteger(referObj.jobId)) {
            err.push('jobId');
        }
        if (!referObj.firstName || referObj.firstName == undefined) {
            err.push('firstName');
        }
        if (!referObj.lastName || referObj.lastName == undefined) {
            err.push('lastName');
        }
        if (!referObj.emailId || !commonMethods.validateEmailid(referObj.emailId)) {
            err.push('email');
        }
        if (!referObj.phone || !commonMethods.isValidPhone(referObj.phone)) {
            err.push('phone');
        }
        else if (isNaN(referObj.phone) || referObj.phone.length < 10 || referObj.phone.length > 20) {
            err.push('phone');
        }
        if (!referObj.resumeName || !referObj.resumeFile || !commonMethods.validateFileType(referObj.resumeFile, referObj.resumeName, allowedExt)) {
            err.push('resumeName:resume');
        }
        return err;
    }

    /**
     * apply job validations before login process
     * @param {*} referObj :objects
     * @param {*} allowedExt : allowed extension for resume file
     */
    applyJob(referObj, allowedExt) {
        let commonMethods = new CommonMethods();

        let err = [];

        if (!referObj.jobId && !commonMethods.isValidInteger(referObj.jobId)) {
            err.push('jobId');
        }
        if (!referObj.firstName || referObj.firstName == undefined) {
            err.push('firstName');
        }
        // if (!referObj.lastName || referObj.lastName == undefined) {
        //     err.push('lastName');
        // }
        if (!referObj.emailId || (!commonMethods.validateEmailid(referObj.emailId))) {
            err.push('email');
        }
        // if (!referObj.phone || !commonMethods.isValidPhone(referObj.phone)) {
        //     err.push('phone');
        // }
        // if (!referObj.resumeTitle) {
        //     err.push('resumeTitle:invalidTitle');
        // }
        if (!referObj.resumeName || !referObj.resumeFile || (!commonMethods.validateFileType(referObj.resumeFile, referObj.resumeName, allowedExt))) {
            err.push('resumeName:resume');
        }
        return err;
    }
}