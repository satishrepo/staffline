/**
 * -------Import all classes and packages -------------
 */
import CommonMethods from '../../core/common-methods';
import fieldsLength from '../../core/fieldsLength';

/**
 *  -------Initialize global variabls-------------
 */
let commonMethods = new CommonMethods();
export default class MyProjectValidation {

    /**
     * validation in update project
     * @param {*} details : data in request body
     */
    updateProjectValidation(details) {

        let reqBody = {
            projectDetailId: details.projectDetailId,
            employeeDetailsId: details.employeeDetailsId,
            projectDuration: details.projectDuration ? details.projectDuration.trim() : '',
            projectDescription: details.projectDescription ? details.projectDescription.trim() : '',
            technologyId: details.technologyId,
            roleId: details.roleId,
            managerName: details.managerName ? details.managerName.trim():'',
            managerTitle: details.managerTitle ? details.managerTitle.trim() : '',
            managerEmail: details.managerEmail,
            managerOffPhone: details.managerOffPhone,
            specialComments: details.specialComments ? details.specialComments.trim() : ''
        },
            err = [];
        if (!reqBody.employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (!reqBody.projectDetailId || !(commonMethods.isValidInteger(reqBody.projectDetailId))) {
            err.push('projectDetailId');
        }
        if (!reqBody.projectDuration || reqBody.projectDuration.length > fieldsLength.projects.projectDuration || ! commonMethods.isAlphaNumeric(reqBody.projectDuration)) {
            err.push('projectDuration');
        }
        if (!reqBody.projectDescription || reqBody.projectDescription.length > fieldsLength.projects.projectDescription) {
            err.push('projectDescription');
        }
        if (!reqBody.technologyId || !(commonMethods.isValidInteger(reqBody.technologyId))) {
            err.push('technologyId');
        }
        if (!reqBody.roleId || !(commonMethods.isValidInteger(reqBody.roleId))) {
            err.push('roleId');
        }
        if (!reqBody.managerName || reqBody.managerName.length > fieldsLength.projects.managerName) {
            err.push('managerName');
        }
        if (!reqBody.managerTitle || reqBody.managerTitle.length > fieldsLength.projects.managerTitle) {
            err.push('managerTitle');
        }
        if (!reqBody.managerEmail || (!commonMethods.validateEmailid(reqBody.managerEmail))) {
            err.push('managerEmail:email');
        }
        if (!reqBody.managerOffPhone || !commonMethods.isValidPhone(reqBody.managerOffPhone)) {
            err.push('managerOffPhone:phone');
        }

        if ((reqBody.specialComments) && reqBody.specialComments.length > fieldsLength.projects.specialComments) {
            err.push('specialComments');
        }
        return err;
    }
}