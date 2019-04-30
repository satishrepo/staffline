/**
 * -------Import all classes and packages -------------
 */
import CommonMethods from '../../core/common-methods';
import path from 'path';
import fieldsLength from '../../core/fieldsLength';



/**
 *  -------Initialize global variabls-------------
 */

let commonMethods = new CommonMethods();

export default class ImmigrationValidation {

    /**
     * validation in add immigration application
     * @param {*} details : data in request body
     */
    addImmigrationApplicationValidation(details) {
        let reqBody = {
            employeeDetailsId: details.employeeDetailsId,
            firstName: details.firstName,
            lastName: details.lastName,
            email: details.email,
            contactNumber: details.contactNumber,
            appForId: details.appForId,
            appPriorityId: details.appPriorityId,
            appType: details.appType,
            currentStatus: details.currentStatus,
            comments: details.comments,
            skillCategoryId: details.skillCategoryId
        },
            err = [];
        if (!reqBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!reqBody.firstName || reqBody.firstName.length > fieldsLength.immigrations.firstName) {
            err.push('firstName:immFirstName');
        }
        if (!reqBody.lastName || reqBody.lastName.length > fieldsLength.immigrations.lastName) {
            err.push('lastName:immLastName');
        }
        if (!reqBody.email || !commonMethods.validateEmailid(reqBody.email)) {
            err.push('email');
        }
        if (!reqBody.contactNumber || reqBody.contactNumber.length > fieldsLength.immigrations.contactNumber) {
            err.push('contactNumber');
        }
        if (!reqBody.appForId || !commonMethods.isValidInteger(reqBody.appForId)) {
            err.push('appForId');
        }
        if (!reqBody.appPriorityId || !commonMethods.isValidInteger(reqBody.appPriorityId)) {
            err.push('appPriorityId');
        }
        if (!reqBody.appType || reqBody.appType.length > fieldsLength.immigrations.appType) {
            err.push('appType');
        }
        if (!reqBody.currentStatus || reqBody.currentStatus.length > fieldsLength.immigrations.currentStatus) {
            err.push('currentStatus');
        }
        // if (!reqBody.skillCategoryId || !commonMethods.isValidInteger(reqBody.skillCategoryId)) {
        //     err.push('skillCategoryId');
        // }
        if ((reqBody.comments) && reqBody.comments.length > fieldsLength.immigrations.comments) {
            err.push('comments');
        }
        return err;
    }

    /**
     * validation in add documents
     * @param {*} details : data in request body
     */
    addDocumentsValidation(details, allowedExt) {
        let reqBody = {
            checkListId: details.checkListId,
            legalDocName: details.legalDocName,
            legalDocument: details.legalDocument
        },
            err = [];

        if (!reqBody.checkListId || !commonMethods.isValidInteger(reqBody.checkListId)) {
            err.push('checkListId');
        }
        if (!reqBody.legalDocName || !reqBody.legalDocument || !commonMethods.validateFileType(reqBody.legalDocument, reqBody.legalDocName, allowedExt)) {
            err.push('legalDocName:file');
        }
        return err;
    }

    /**
     * validation in update immigration application
     * @param {*} details : data in request body
     */
    updateImmigrationApplicationValidation(details) {
        let reqBody = {
            employeeDetailsId: details.employeeDetailsId,
            firstName: details.firstName,
            lastName: details.lastName,
            legalAppId: details.legalAppId,
            email: details.email,
            contactNumber: details.contactNumber,
            eacNumber: details.eacNumber,
            appForId: details.appForId,
            appPriorityId: details.appPriorityId,
            appType: details.appType,
            currentStatus: details.currentStatus,
            comments: details.comments,
            skillCategoryId: details.skillCategoryId
        },
            err = [];
        if (!reqBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!reqBody.firstName || reqBody.firstName.length > fieldsLength.immigrations.firstName) {
            err.push('firstName:immFirstName');
        }
        if (!reqBody.lastName || reqBody.lastName.length > fieldsLength.immigrations.lastName) {
            err.push('lastName:immLastName');
        }
        if (!reqBody.legalAppId || !commonMethods.isValidInteger(reqBody.legalAppId)) {
            err.push('legalAppId');
        }
        if (!reqBody.email || !commonMethods.validateEmailid(reqBody.email)) {
            err.push('email');
        }
        if (!reqBody.contactNumber || reqBody.contactNumber.length > fieldsLength.immigrations.contactNumber) {
            err.push('contactNumber');
        }
        if (!reqBody.appForId || !commonMethods.isValidInteger(reqBody.appForId)) {
            err.push('appForId');
        }
        if (!reqBody.appPriorityId || !commonMethods.isValidInteger(reqBody.appPriorityId)) {
            err.push('appPriorityId');
        }
        // if (!reqBody.appPriorityId || !commonMethods.isValidInteger(reqBody.appPriorityId)) {
        //     err.push('appPriorityId');
        // }
        if (!reqBody.currentStatus || reqBody.currentStatus.length > fieldsLength.immigrations.currentStatus) {
            err.push('currentStatus');
        }
        // if (!reqBody.skillCategoryId || !commonMethods.isValidInteger(reqBody.skillCategoryId)) {
        //     err.push('skillCategoryId');
        // }
        if ((reqBody.comments) && reqBody.comments.length > fieldsLength.immigrations.comments) {
            err.push('comments');
        }
        return err;
    }

    /**
     * validation in delete immigration document
     * @param {*} details : data in request body
     */
    deleteImmigrationDocumentsValidation(details) {
        let deleteImmigrationBody = {
            checkListId: details.checkListId
        },
            err = [];
        if (!deleteImmigrationBody.checkListId) {
            err.push('checkListId');
        }
        return err;
    }

}