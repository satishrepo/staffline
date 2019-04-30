/**
 * -------Import all classes and packages -------------
 */
import lengthValidation from './edit-user-length-validation';
import CommonMethods from '../../core/common-methods';
import accountModel from '../../models/accounts/accounts-model';
import enums from '../../core/enums';
import fieldsLength from '../../core/fieldsLength';
import _ from 'lodash';

let commonMethods = new CommonMethods();
/**
 *  -------Initialize global variabls-------------
 */
export default class EditUserValidation {

    editUserValidation(employeeDetailsId, reqBody, resumeVars, documentVars) {
        let err = [];
        
        // let regExp = /^\d[1,18]\.\d[0,2]$/;
        let dateRegEx = /^\d{4}-\d{2}-\d{2}$/;
        let decimalRexged = /^[0-9]+([,.][0-9]+)?$/g;


        if (!employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (reqBody.empDetails) {
            
            if (!Object.keys(reqBody.empDetails).length) {
                err.push('error:blankRequest');
            }
            if ((typeof reqBody.empDetails.firstName != 'undefined' && reqBody.empDetails.firstName.trim() == '') || (reqBody.empDetails.firstName && (reqBody.empDetails.firstName.length > fieldsLength.users.firstName))) {
                err.push('firstName');
            }
            if ((typeof reqBody.empDetails.lastName != 'undefined' && reqBody.empDetails.lastName.trim() == '') || (reqBody.empDetails.lastName && (reqBody.empDetails.lastName.length > fieldsLength.users.lastName))) {
                err.push('lastName');
            }

            if ((reqBody.empDetails.annualSalary) && !(commonMethods.isValidNumber(reqBody.empDetails.annualSalary))) {
                err.push('annualSalary');
            }

            if ((reqBody.empDetails.dob) && !commonMethods.isValidDate(reqBody.empDetails.dob)) {
                err.push('dob');
            }
            if (!commonMethods.isBooleanOptionalField(reqBody.empDetails.publicProfile)) {
                err.push('publicProfile');
            }

            if ((reqBody.empDetails.countryId) && !(commonMethods.isValidInteger(reqBody.empDetails.countryId))) {
                err.push('countryId');
            }
            if ((reqBody.empDetails.stateId) && !(commonMethods.isValidInteger(reqBody.empDetails.stateId))) {
                err.push('stateId');
            }
            if ((reqBody.empDetails.cityId) && !(commonMethods.isValidInteger(reqBody.empDetails.cityId))) {
                err.push('cityId');
            }

            if ((reqBody.empDetails.zipCode) && (reqBody.empDetails.zipCode.length > fieldsLength.users.zipCode)) {
                err.push('zipCode');
            }
            

            if ((reqBody.empDetails.currentJobTitle) && (reqBody.empDetails.currentJobTitle.trim() =='' || reqBody.empDetails.currentJobTitlelength > fieldsLength.users.currentJobTitle)) 
            {
                reqBody.empDetails.currentJobTitle = reqBody.empDetails.currentJobTitle.trim();
                err.push('currentJobTitle');
            }

            if ((reqBody.empDetails.totalExp) && !commonMethods.isValidNumber(reqBody.empDetails.totalExp)) {
                err.push('totalExp');
            }
            if ((reqBody.empDetails.totalUsExp) && !commonMethods.isValidNumber(reqBody.empDetails.totalUsExp)) {
                err.push('totalUsExp');
            }
            if ((reqBody.empDetails.availabilityId) && !(commonMethods.isValidInteger(reqBody.empDetails.availabilityId))) {
                err.push('availabilityId')
            }

            
            if ((reqBody.empDetails.currentLocation) && (reqBody.empDetails.currentLocation.trim() =='' || (reqBody.empDetails.currentLocation.length > fieldsLength.users.address)))
            {
                reqBody.empDetails.currentLocation = reqBody.empDetails.currentLocation.trim();
                err.push('currentLocation');
            }

            if ((reqBody.empDetails.authorisationStatusId) && !(commonMethods.isValidInteger(reqBody.empDetails.authorisationStatusId))) {
                err.push('authorisationStatusId');
            }

            if ((reqBody.empDetails.jobSearchStatusId) && !(commonMethods.isValidInteger(reqBody.empDetails.jobSearchStatusId))) {
                err.push('jobSearchStatusId');
            }
            if ((reqBody.empDetails.contactNumber) && !commonMethods.isValidPhone(reqBody.empDetails.contactNumber)) {
                err.push('contactNumber');
            }

            if ((reqBody.empDetails.linkedIn) && (reqBody.empDetails.linkedIn.length > fieldsLength.users.linkedIn)) {
                err.push('linkedIn');
            }
            if ((reqBody.empDetails.twitter) && (reqBody.empDetails.twitter.length > fieldsLength.users.twitter)) {
                err.push('twitter');
            }

            var re = Object.keys(enums.desiredEmployement).map( i => {
                return enums.desiredEmployement[i].key
            })
        
            if ( (reqBody.empDetails.desiredEmployementKey 
                && !Array.isArray(reqBody.empDetails.desiredEmployementKey) )
                || _.differenceBy(reqBody.empDetails.desiredEmployementKey, re).length) 
            {
                err.push('desiredEmployementKey');
            }

            if (reqBody.empDetails.contractRate && (!(commonMethods.isValidNumber(reqBody.empDetails.contractRate) || reqBody.empDetails.contractRate.length > fieldsLength.users.contractRate))) {
                err.push('contractRate');
            }

            if ((reqBody.empDetails.contractRateTypeId) && !(commonMethods.isValidInteger(reqBody.empDetails.contractRateTypeId))) {
                err.push('contractRateTypeId');
            }
            if (!commonMethods.isBooleanOptionalField(reqBody.empDetails.interestedSme)) {
                err.push('interestedSme');
            }
            if (!commonMethods.isBooleanOptionalField(reqBody.empDetails.interestedCounsellor)) {
                err.push('interestedCounsellor');
            }
            if (reqBody.empDetails.prefferedCity && !Array.isArray(reqBody.empDetails.prefferedCity)) {
                err.push('prefferedCity');
            }

            
            if (reqBody.empDetails.careerProfile && (reqBody.empDetails.careerProfile.trim() =='' || reqBody.empDetails.careerProfile.length > fieldsLength.users.comments) )
            {
                reqBody.empDetails.careerProfile = reqBody.empDetails.careerProfile.trim();
                err.push('careerProfile');
            }
            if ((reqBody.empDetails.industryVerticalId) && !(commonMethods.isValidInteger(reqBody.empDetails.industryVerticalId))) {
                err.push('industryVerticalId');
            }
        }

        if (reqBody.educations) {
            if ((reqBody.educations.employeeEducationId) && !(commonMethods.isValidInteger(reqBody.educations.employeeEducationId))) {
                err.push('employeeEducationId');
            }
            // if (!reqBody.educations.qualificationId || !(commonMethods.isValidInteger(reqBody.educations.qualificationId))) {
            //     err.push('qualificationId');
            // }
            
            

            if (!reqBody.educations.qualification || reqBody.educations.qualification.trim() == '') 
            {
                reqBody.educations.qualification = reqBody.educations.qualification ? reqBody.educations.qualification.trim() : '';
                err.push('qualification');
            }
            if (!reqBody.educations.institutionName || reqBody.educations.institutionName.length > fieldsLength.users.institutionName) 
            {
                reqBody.educations.institutionName = reqBody.educations.institutionName ? reqBody.educations.institutionName.trim() : '';
                err.push('institutionName');
            }
            if (!reqBody.educations.passingYear || !(commonMethods.isValidInteger(reqBody.educations.passingYear))) {
                err.push('passingYear');
            }
        }
        if (reqBody.experiences) {
            if ((reqBody.experiences.candidateEmploymentExperienceId) && !(commonMethods.isValidInteger(reqBody.experiences.candidateEmploymentExperienceId))) {
                err.push('candidateEmploymentExperienceId');
            }

            reqBody.experiences.positionTitle = reqBody.experiences.positionTitle ? reqBody.experiences.positionTitle.trim() : '';
            reqBody.experiences.employerName = reqBody.experiences.employerName ? reqBody.experiences.employerName.trim() : '';

            if (!reqBody.experiences.positionTitle || reqBody.experiences.positionTitle.length > fieldsLength.users.positionTitle) {
                err.push('positionTitle');
            }
            if (!reqBody.experiences.employerName || reqBody.experiences.employerName.length > fieldsLength.users.employerName) {
                err.push('employerName');
            }
            // if (!reqBody.experiences.positionResponsibilities) {
            //     err.push('positionResponsibilities');
            // }
            if ((reqBody.experiences.positionEndDate) && !commonMethods.isValidDate(reqBody.experiences.positionEndDate)) {
                err.push('positionEndDate:date');
            }
            if (!reqBody.experiences.positionStartDate || !commonMethods.isValidDate(reqBody.experiences.positionStartDate)) {
                err.push('positionStartDate:date');
            }

            if((reqBody.experiences.positionStartDate && reqBody.experiences.positionEndDate) 
            && new Date(reqBody.experiences.positionStartDate).getTime() >= new Date(reqBody.experiences.positionEndDate).getTime() )
            {
                err.push('positionStartDate:invalidDateRange')
            }

            // if (!reqBody.experiences.countryId || !(commonMethods.isValidInteger(reqBody.experiences.countryId))) {
            //     err.push('countryId');
            // }
            // if (!reqBody.experiences.stateId || !(commonMethods.isValidInteger(reqBody.experiences.stateId))) {
            //     err.push('stateId');
            // }
            // if (!reqBody.experiences.cityId || !(commonMethods.isValidInteger(reqBody.experiences.cityId))) {
            //     err.push('cityId');
            // }
        }
        if (reqBody.documents) 
        {
            
            let allowExt = reqBody.documents.fileType == 1 ? resumeVars.allowedExt : documentVars.allowedExt;
           
            if (reqBody.documents.candidateDocId && !(commonMethods.isValidInteger(reqBody.documents.candidateDocId))) {
                err.push('candidateDocId');
            }
            if (!reqBody.documents.fileName || !reqBody.documents.file || !(commonMethods.validateFileType(reqBody.documents.file, reqBody.documents.fileName, allowExt))) {
                err.push('fileName:file');
            }

            if (!reqBody.documents.docName) {
                err.push('docName:docName');
            }


            let types = Object.keys(enums.doc.type).map(item => { return enums.doc.type[item] });

            if (reqBody.documents.fileType == undefined || reqBody.documents.fileType == null || (types.indexOf(~~reqBody.documents.fileType) < 0)) {
                err.push('fileType');
            }
        }

        if (reqBody.licensesAndCertifications) {
            if (reqBody.licensesAndCertifications.empCertificationDetailsId && !(commonMethods.isValidInteger(reqBody.licensesAndCertifications.empCertificationDetailsId))) {
                err.push('empCertificationDetailsId');
            }

            reqBody.licensesAndCertifications.certificateExamName = reqBody.licensesAndCertifications.certificateExamName ? reqBody.licensesAndCertifications.certificateExamName.trim() : '';

            if (!reqBody.licensesAndCertifications.certificateExamName || reqBody.licensesAndCertifications.certificateExamName.length > fieldsLength.users.certificateExamName) {
                err.push('certificateExamName');
            }
        }

        if (reqBody.skills) {
            if (reqBody.skills.candidateSkillId && !(commonMethods.isValidInteger(reqBody.skills.candidateSkillId))) {
                err.push('candidateSkillId')
            }

            reqBody.skills.skillName = reqBody.skills.skillName ? reqBody.skills.skillName.trim() : '';

            if (!reqBody.skills.skillName || reqBody.skills.skillName.trim() =='') {
                err.push('skillName');
            }
            if (!reqBody.skills.yearExp || !(commonMethods.isValidNumber(reqBody.skills.yearExp))
            || reqBody.skills.yearExp == 0  
            || reqBody.skills.yearExp > fieldsLength.users.yearsOfExp) {
                err.push('yearExp');
            }
        }
        if (reqBody.candidateAchievements) {
            if (reqBody.candidateAchievements.candidateAchievementId && !(commonMethods.isValidInteger(reqBody.candidateAchievements.candidateAchievementId))) {
                err.push('candidateAchievementId')
            }

            reqBody.candidateAchievements.description = reqBody.candidateAchievements.description ? reqBody.candidateAchievements.description.trim() : '';

            if (!reqBody.candidateAchievements.description) {
                err.push('description');
            }
        }
        return err;

    }

    editUserValidation_v4(employeeDetailsId, reqBody, resumeVars, documentVars) {
        let err = [];
        
        // let regExp = /^\d[1,18]\.\d[0,2]$/;
        let dateRegEx = /^\d{4}-\d{2}-\d{2}$/;
        let decimalRexged = /^[0-9]+([,.][0-9]+)?$/g;


        if (!employeeDetailsId) {
            err.push('invalidAuthToken');
        }
        if (reqBody.empDetails) {

            if (!Object.keys(reqBody.empDetails).length) {
                err.push('error:blankRequest');
            }

           
            // -- used in v5 api 
            if (typeof reqBody.empDetails.paypalId != 'undefined' && (!commonMethods.validateEmailid(reqBody.empDetails.paypalId))) {
                err.push('paypalId:email');
            }
            
            
            if ((typeof reqBody.empDetails.firstName != 'undefined' && reqBody.empDetails.firstName.trim() == '') || (reqBody.empDetails.firstName && (reqBody.empDetails.firstName.length > fieldsLength.users.firstName))) {
                err.push('firstName');
            }
            if ((typeof reqBody.empDetails.lastName != 'undefined' && reqBody.empDetails.lastName.trim() == '') || (reqBody.empDetails.lastName && (reqBody.empDetails.lastName.length > fieldsLength.users.lastName))) {
                err.push('lastName');
            }

            if ((reqBody.empDetails.annualSalary) && !(commonMethods.isValidNumber(reqBody.empDetails.annualSalary))) {
                err.push('annualSalary');
            }

            if ((reqBody.empDetails.dob) && !commonMethods.isValidDate(reqBody.empDetails.dob)) {
                err.push('dob');
            }
            if (!commonMethods.isBooleanOptionalField(reqBody.empDetails.publicProfile)) {
                err.push('publicProfile');
            }

            if ((reqBody.empDetails.countryId) && !(commonMethods.isValidInteger(reqBody.empDetails.countryId))) {
                err.push('countryId');
            }
            if ((reqBody.empDetails.stateId) && !(commonMethods.isValidInteger(reqBody.empDetails.stateId))) {
                err.push('stateId');
            }
            if ((reqBody.empDetails.cityId) && !(commonMethods.isValidInteger(reqBody.empDetails.cityId))) {
                err.push('cityId');
            }

            if ((reqBody.empDetails.zipCode) && (reqBody.empDetails.zipCode.length > fieldsLength.users.zipCode)) {
                err.push('zipCode');
            }
            

            if ((reqBody.empDetails.currentJobTitle) && (reqBody.empDetails.currentJobTitle.trim() =='' || reqBody.empDetails.currentJobTitlelength > fieldsLength.users.currentJobTitle)) 
            {
                reqBody.empDetails.currentJobTitle = reqBody.empDetails.currentJobTitle.trim();
                err.push('currentJobTitle');
            }

            if ((reqBody.empDetails.totalExp) && !commonMethods.isValidNumber(reqBody.empDetails.totalExp)) {
                err.push('totalExp');
            }
            if ((reqBody.empDetails.totalUsExp) && !commonMethods.isValidNumber(reqBody.empDetails.totalUsExp)) {
                err.push('totalUsExp');
            }
            if ((reqBody.empDetails.availabilityId) && !(commonMethods.isValidInteger(reqBody.empDetails.availabilityId))) {
                err.push('availabilityId')
            }

            
            if ((reqBody.empDetails.currentLocation) && (reqBody.empDetails.currentLocation.trim() =='' || (reqBody.empDetails.currentLocation.length > fieldsLength.users.address)))
            {
                reqBody.empDetails.currentLocation = reqBody.empDetails.currentLocation.trim();
                err.push('currentLocation');
            }

            if ((reqBody.empDetails.authorisationStatusId) && !(commonMethods.isValidInteger(reqBody.empDetails.authorisationStatusId))) {
                err.push('authorisationStatusId');
            }

            if ((reqBody.empDetails.jobSearchStatusId) && !(commonMethods.isValidInteger(reqBody.empDetails.jobSearchStatusId))) {
                err.push('jobSearchStatusId');
            }
            if ((reqBody.empDetails.contactNumber) && !commonMethods.isValidPhone(reqBody.empDetails.contactNumber)) {
                err.push('contactNumber');
            }

            if ((reqBody.empDetails.linkedIn) && (reqBody.empDetails.linkedIn.length > fieldsLength.users.linkedIn)) {
                err.push('linkedIn');
            }
            if ((reqBody.empDetails.twitter) && (reqBody.empDetails.twitter.length > fieldsLength.users.twitter)) {
                err.push('twitter');
            }

            var re = Object.keys(enums.desiredEmployement).map( i => {
                return enums.desiredEmployement[i].key
            })
        
            if ( (reqBody.empDetails.desiredEmployementKey 
                && !Array.isArray(reqBody.empDetails.desiredEmployementKey) )
                || _.differenceBy(reqBody.empDetails.desiredEmployementKey, re).length) 
            {
                err.push('desiredEmployementKey');
            }

            if (reqBody.empDetails.contractRate && (!(commonMethods.isValidNumber(reqBody.empDetails.contractRate) || reqBody.empDetails.contractRate.length > fieldsLength.users.contractRate))) {
                err.push('contractRate');
            }

            if ((reqBody.empDetails.contractRateTypeId) && !(commonMethods.isValidInteger(reqBody.empDetails.contractRateTypeId))) {
                err.push('contractRateTypeId');
            }
            if (!commonMethods.isBooleanOptionalField(reqBody.empDetails.interestedSme)) {
                err.push('interestedSme');
            }
            if (!commonMethods.isBooleanOptionalField(reqBody.empDetails.interestedCounsellor)) {
                err.push('interestedCounsellor');
            }
            if (reqBody.empDetails.prefferedCity && !Array.isArray(reqBody.empDetails.prefferedCity)) {
                err.push('prefferedCity');
            }

            
            if (reqBody.empDetails.careerProfile && (reqBody.empDetails.careerProfile.trim() =='' || reqBody.empDetails.careerProfile.length > fieldsLength.users.comments) )
            {
                reqBody.empDetails.careerProfile = reqBody.empDetails.careerProfile.trim();
                err.push('careerProfile');
            }
            if ((reqBody.empDetails.industryVerticalId) && !(commonMethods.isValidInteger(reqBody.empDetails.industryVerticalId))) {
                err.push('industryVerticalId');
            }
        }

        if (reqBody.educations) {
            if ((reqBody.educations.employeeEducationId) && !(commonMethods.isValidInteger(reqBody.educations.employeeEducationId))) {
                err.push('employeeEducationId');
            }
            // if (!reqBody.educations.qualificationId || !(commonMethods.isValidInteger(reqBody.educations.qualificationId))) {
            //     err.push('qualificationId');
            // }
            
            

            if (!reqBody.educations.qualification || reqBody.educations.qualification.trim() == '') 
            {
                reqBody.educations.qualification = reqBody.educations.qualification ? reqBody.educations.qualification.trim() : '';
                err.push('qualification');
            }
            if (!reqBody.educations.institutionName || reqBody.educations.institutionName.length > fieldsLength.users.institutionName) 
            {
                reqBody.educations.institutionName = reqBody.educations.institutionName ? reqBody.educations.institutionName.trim() : '';
                err.push('institutionName');
            }
            if (!reqBody.educations.passingYear || !(commonMethods.isValidInteger(reqBody.educations.passingYear))) {
                err.push('passingYear');
            }
        }
        if (reqBody.experiences) {
            if ((reqBody.experiences.candidateEmploymentExperienceId) && !(commonMethods.isValidInteger(reqBody.experiences.candidateEmploymentExperienceId))) {
                err.push('candidateEmploymentExperienceId');
            }

            reqBody.experiences.positionTitle = reqBody.experiences.positionTitle ? reqBody.experiences.positionTitle.trim() : '';
            reqBody.experiences.employerName = reqBody.experiences.employerName ? reqBody.experiences.employerName.trim() : '';

            if (!reqBody.experiences.positionTitle || reqBody.experiences.positionTitle.length > fieldsLength.users.positionTitle) {
                err.push('positionTitle');
            }
            if (!reqBody.experiences.employerName || reqBody.experiences.employerName.length > fieldsLength.users.employerName) {
                err.push('employerName');
            }
            // if (!reqBody.experiences.positionResponsibilities) {
            //     err.push('positionResponsibilities');
            // }
            if ((reqBody.experiences.positionEndDate) && !commonMethods.isValidDate(reqBody.experiences.positionEndDate)) {
                err.push('positionEndDate:date');
            }
            if (!reqBody.experiences.positionStartDate || !commonMethods.isValidDate(reqBody.experiences.positionStartDate)) {
                err.push('positionStartDate:date');
            }

            if((reqBody.experiences.positionStartDate && reqBody.experiences.positionEndDate) 
            && new Date(reqBody.experiences.positionStartDate).getTime() >= new Date(reqBody.experiences.positionEndDate).getTime() )
            {
                err.push('positionStartDate:invalidDateRange')
            }

            // if (!reqBody.experiences.countryId || !(commonMethods.isValidInteger(reqBody.experiences.countryId))) {
            //     err.push('countryId');
            // }
            // if (!reqBody.experiences.stateId || !(commonMethods.isValidInteger(reqBody.experiences.stateId))) {
            //     err.push('stateId');
            // }
            // if (!reqBody.experiences.cityId || !(commonMethods.isValidInteger(reqBody.experiences.cityId))) {
            //     err.push('cityId');
            // }
        }
        if (reqBody.documents) 
        {
            
            let allowExt = [1701,1703,1704,1705].indexOf(~~reqBody.documents.fileType) > -1 ? documentVars.allowedExt : resumeVars.allowedExt;
           
            if (reqBody.documents.candidateDocId && !(commonMethods.isValidInteger(reqBody.documents.candidateDocId))) {
                err.push('candidateDocId');
            }
            if (!reqBody.documents.fileName || !reqBody.documents.file || !(commonMethods.validateFileType(reqBody.documents.file, reqBody.documents.fileName, allowExt))) {
                err.push('fileName:file');
            }

            if (!reqBody.documents.docName) {
                err.push('docName:docName');
            }


            let types = [1701,1702,1703,1704,1705];

            if (reqBody.documents.fileType == undefined || reqBody.documents.fileType == null || (types.indexOf(~~reqBody.documents.fileType) < 0)) {
                err.push('fileName:fileType');
            }
        }

        if (reqBody.licensesAndCertifications) {
            if (reqBody.licensesAndCertifications.empCertificationDetailsId && !(commonMethods.isValidInteger(reqBody.licensesAndCertifications.empCertificationDetailsId))) {
                err.push('empCertificationDetailsId');
            }

            reqBody.licensesAndCertifications.certificateExamName = reqBody.licensesAndCertifications.certificateExamName ? reqBody.licensesAndCertifications.certificateExamName.trim() : '';

            if (!reqBody.licensesAndCertifications.certificateExamName || reqBody.licensesAndCertifications.certificateExamName.length > fieldsLength.users.certificateExamName) {
                err.push('certificateExamName');
            }
        }

        if (reqBody.skills) {
            if (reqBody.skills.candidateSkillId && !(commonMethods.isValidInteger(reqBody.skills.candidateSkillId))) {
                err.push('candidateSkillId')
            }

            reqBody.skills.skillName = reqBody.skills.skillName ? reqBody.skills.skillName.trim() : '';

            if (!reqBody.skills.skillName || reqBody.skills.skillName.trim() =='') {
                err.push('skillName');
            }
            if (!reqBody.skills.yearExp || !(commonMethods.isValidNumber(reqBody.skills.yearExp))
            || reqBody.skills.yearExp == 0  
            || reqBody.skills.yearExp > fieldsLength.users.yearsOfExp) {
                err.push('yearExp');
            }
        }
        if (reqBody.candidateAchievements) {
            if (reqBody.candidateAchievements.candidateAchievementId && !(commonMethods.isValidInteger(reqBody.candidateAchievements.candidateAchievementId))) {
                err.push('candidateAchievementId')
            }

            reqBody.candidateAchievements.description = reqBody.candidateAchievements.description ? reqBody.candidateAchievements.description.trim() : '';

            if (!reqBody.candidateAchievements.description) {
                err.push('description');
            }
        }
        return err;

    }
}