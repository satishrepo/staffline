/**
 * -------Import all classes and packages -------------
 */
import fieldsLength from '../../core/fieldsLength';
import CommonMethods from '../../core/common-methods';
import accountModel from '../../models/accounts/accounts-model';

/**
 * Dashboard Validation
 */
export default class ContactUsValidation {

    /**
* contact us validations 
* @param {*} details : data in request body
*/
    contactUsValidation(details) {
        let reqBody = {
            requestType: details.requestType,
            firstName: details.firstName,
            lastName: details.lastName,
            email: details.email,
            mobileNo: details.mobileNo,
            comments: details.comments ? details.comments.trim() : ''
        },
            err = [],
            commonMethods = new CommonMethods();

        if (!reqBody.requestType || reqBody.requestType.length > fieldsLength.contactUs.requestType) {
            err.push('requestType');
        }
        if (!reqBody.firstName || reqBody.firstName.length > fieldsLength.contactUs.firstName) {
            err.push('firstName');
        }
        if (!reqBody.lastName || reqBody.lastName.length > fieldsLength.contactUs.lastName) {
            err.push('lastName');
        }
        if (!reqBody.email || !reqBody.email.trim() || (!commonMethods.validateEmailid(reqBody.email))) {
            err.push('email');
        }
        if (!reqBody.mobileNo || reqBody.mobileNo.length > fieldsLength.contactUs.mobileNo) {
            err.push('mobileNo');
        }
        if (!reqBody.comments) {
            err.push('comments:contComments');
        }
        return err;

    }
}
