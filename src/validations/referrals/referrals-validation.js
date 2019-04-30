/**
 * -------Import all classes and packages -------------
 */
import CommonMethods from '../../core/common-methods';
import path from 'path';
import enums from '../../core/enums';

let commonMethods = new CommonMethods();


/**
 *  -------Initialize global variabls-------------
 */
export default class ReferralsdValidation {

    /**
     * validation in referrals save      
     * @param {*} details : data in request body
     */

    referCandidate(referObj, allowedExt) {
        let commonMethods = new CommonMethods();

        let err = [];

        if (!referObj.firstName) {
            err.push('firstName');
        }
        // if (!referObj.lastName) {
        //     err.push('lastName');
        // }
        if (!referObj.emailId || (!commonMethods.validateEmailid(referObj.emailId))) {
            err.push('email');
        }
        // if (!referObj.phone || !commonMethods.isValidPhone(referObj.phone)) {
        //     err.push('phone');
        // }
        if (!referObj.resumeName || !referObj.resumeFile || (!commonMethods.validateFileType(referObj.resumeFile, referObj.resumeName, allowedExt))) {
            err.push('resumeName:resume');
        }
        return err;
    }


    addBankDetails(referObj, allowedExt) {
        let commonMethods = new CommonMethods();

        let err = [];

        if (!referObj.bankName) {
            err.push('bankName');
        }

        if (!referObj.bankAddress) {
            err.push('bankAddress');
        }

        if (!referObj.abaNumber) {
            err.push('abaNumber');
        }

        if (!referObj.accountNumber) {
            err.push('accountNumber');
        }

        if (!referObj.accountTypeId || !commonMethods.isValidInteger(referObj.accountTypeId)) {
            err.push('accountTypeId');
        }

        if (referObj.chequeFile && referObj.chequeName && !commonMethods.validateFileType(referObj.chequeFile, referObj.chequeName, allowedExt)) {
            err.push('chequeName:file');
        }


        return err;
    }


}
