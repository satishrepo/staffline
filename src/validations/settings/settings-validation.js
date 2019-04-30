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
export default class SettingsdValidation {

    /**
     * validation in settings save      
     * @param {*} details : data in request body
     */

    alert_backup(inputObj) {
        let commonMethods = new CommonMethods();

        let err = [];

        if (!commonMethods.isBoolean(inputObj.notificationStatus)) {
            err.push('notificationStatus');
        }
        else if (inputObj.notificationStatus == 1) {

            if (!inputObj.alertTypeId) {
                err.push('alertTypeId');
            }

            if ((inputObj.alertTypeId) && !commonMethods.isBoolean(inputObj.alertStatus)) {
                err.push('alertStatus');
            }
            else if ((inputObj.alertTypeId) && (~~inputObj.alertStatus == 0) && !commonMethods.isBoolean(inputObj.switchOffStatus)) {
                err.push('switchOffStatus');
            }
            // else if( (inputObj.alertTypeId) &&  !commonMethods.isBoolean(inputObj.switchOffStatus) ) 
            // {
            //     err.push('switchOffStatus');
            // }
            else if ((~~inputObj.alertStatus == 1) && (!~~inputObj.alertFrequencyId)) {
                err.push('alertFrequencyId');
            }
            let curDate = new Date();
            curDate.setHours(0, 0, 0, 0);
            if ((inputObj.alertTypeId) && inputObj.switchOffStatus == 1 && !inputObj.dateTo) {
                err.push('dateTo');
            }
            else if (inputObj.dateTo && (!commonMethods.isValidDate(inputObj.dateTo) || (new Date(inputObj.dateTo) < curDate))) {
                err.push('dateTo');
            }
        }


        return err;
    }

    alert(inputObj)
    {
        let regEx = /^\d{4}-\d{2}-\d{2}$/;
        let msgCode = []
        let curDate = new Date();
        curDate.setHours(0, 0, 0, 0);

        if(!inputObj.alertTypeId || inputObj.alertTypeId < 1)
        {
            msgCode.push('alertTypeId');
        }
        if(!commonMethods.isBoolean(inputObj.alertStatus))
        {
            msgCode.push('alertStatus');
        }
        /*
        if(inputObj.dateTo && (inputObj.dateTo.match(regEx) == null || new Date(inputObj.dateTo) < curDate) )
        {
            msgCode.push('dateTo');
        }
        if((commonMethods.isBoolean(inputObj.alertStatus) && inputObj.alertStatus < 1) && !inputObj.dateTo)
        {
            msgCode.push('dateTo');
        }
        if((commonMethods.isBoolean(inputObj.alertStatus) && inputObj.alertStatus < 1)
        && ((inputObj.dateTo && inputObj.dateTo.match(regEx) == null) 
        || !commonMethods.isValidDate(inputObj.dateTo) 
        || (new Date(inputObj.dateTo) < curDate)))
        {
            msgCode.push('dateTo');
        }
        */

        return msgCode;

    }


}

// || new Date().valueOf() < new Date(inputObj.dateTo).valueOf()))
//!commonMethods.isValidDate(inputObj.dateTo)