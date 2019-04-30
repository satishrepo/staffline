/**
 * -------Import all classes and packages -------------
 */

import enums from '../../core/enums';
import CommonMethods from '../../core/common-methods';
import fieldsLength from '../../core/fieldsLength';
/**
 *  -------Initialize global variabls-------------
 */
export default class VacationValidation {

    /**
     * validation in vacation requests
     * @param {*} details : data in request body
     * @param {*} employeeDetailsId : logged in employee details id
     */
    addVacationsValidation(details, employeeDetailsId) {
        let reqBody = {
            employeeDetailsId: employeeDetailsId,
            fromDate: details.fromDate,
            toDate: details.toDate,
            reason: details.reason,
            contactInfo: details.contactInfo,
            joinSameClient: details.joinSameClient
        },
            err = [],
            commonMethods = new CommonMethods();

        let d0 = reqBody.fromDate,
            d1 = reqBody.toDate;

        if (!reqBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!reqBody.fromDate || !(commonMethods.isValidDate(reqBody.fromDate))) {
            err.push('fromDate:date');
        }
        if (!reqBody.toDate || !(commonMethods.isValidDate(reqBody.toDate))) {
            err.push('toDate:date');
        }
        if (reqBody.fromDate && reqBody.toDate) {

            let maxDays = commonMethods.calcBusinessDays(new Date(d0), new Date(d1));

            let today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);

            if( new Date(reqBody.fromDate) < today )
            {
                err.push('fromDate:fromDateCantPastDate');
            }
            if( new Date(reqBody.toDate) < today )
            {
                err.push('toDate:toDateCantPastDate');
            }
            
            if (new Date(reqBody.fromDate) > new Date(reqBody.toDate)) 
            {
                err.push('fromDate:fromDateCantGreater');
            } 
            else if (maxDays > enums.vacationRequest.maxDays) 
            {
                err.push('toDate:maximumVacationLimitExceed');
            }
            
        }

        if (!reqBody.reason || reqBody.reason.length > fieldsLength.vacations.reason || reqBody.reason.trim() == '') {
            err.push('reason');
        }
        if (!reqBody.contactInfo || reqBody.contactInfo.length > fieldsLength.vacations.contactInfo || reqBody.contactInfo.trim() == '') {
            err.push('contactInfo');
        }
        if (!(commonMethods.isBoolean(reqBody.joinSameClient))) {
            err.push('joinSameClient');
        }
        return err;
    }
}