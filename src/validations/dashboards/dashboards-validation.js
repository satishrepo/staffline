/**
 * Dashboard Validation
 */
export default class DashboardValidation {

    /**
     * timecard validations 
     * @param {*} details : data in request body
     * @param {*} employeeDetailsId : logged in signin details
     */
    dashboardTimecardValidation(details, employeeDetailsId) {
        let dashboardBody = {
            employeeDetailsId: employeeDetailsId,
            toDate: details.toDate,
            fromDate: details.fromDate
        },
            err = [];
        if (!dashboardBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (dashboardBody.toDate && (isNaN(Date.parse(dashboardBody.toDate)))) {
            err.push('toDate:date');
        }
        if (dashboardBody.fromDate && (isNaN(Date.parse(dashboardBody.fromDate)))) {
            err.push('fromDate:date');
        }
        return err;
    }

     /**
     * contact us validations 
     * @param {*} details : data in request body
     * @param {*} employeeDetailsId : logged in signin details
     */
    contactUsValidation(details, employeeDetailsId) {
        let contactusBody = {
            employeeDetailsId:employeeDetailsId,
            content:details.content
        },
        err=[];
        
        if (!contactusBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!contactusBody.content) {
            err.push('content');
        }
        return err;

    }
}
