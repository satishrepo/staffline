/**
 * Payrolls Validation
 */
export default class PayrollsValidation {
    getPayrollsCalendarValidation(employeeDetailsId, payrollCalenderType) {
        let getPayrollBody = {
            employeeDetailsId: employeeDetailsId,
            payrollCalenderType: payrollCalenderType
        },
            err = [];

        if (!getPayrollBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!getPayrollBody.payrollCalenderType) {
            err.push('payrollcalendertype');
        }
        return err;
    }
}