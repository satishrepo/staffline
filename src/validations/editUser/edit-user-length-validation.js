/**
 * edit user validation
 */

let validations = [
    {
        "FieldName": "firstNameLength",
        "Length": 50
    },
    {
        "FieldName": "lastNameLength",
        "Length": 50
    },
    {
        "FieldName": "currentJobTitleLength",
        "Length": 250
    },
    {
        "FieldName": "totalExpLength",
        "Length": 100
    },
    {
        "FieldName": "totalUsExpLength",
        "Length": 10
    },
    {
        "FieldName": "availabilityIdLength",
        "Length": 10
    },
    {
        "FieldName": "addressLength",
        "Length": 500
    },
    {
        "FieldName": "authorisationStatusIdLength",
        "Length": 10
    },
    {
        "FieldName": "jobSearchStatusIdLength",
        "Length": 10
    },
    {
        "FieldName": "contactNumberLength",
        "Length": 20
    },
    {
        "FieldName": "linkedInLength",
        "Length": 250
    },
    {
        "FieldName": "twitterLength",
        "Length": 250
    },
    {
        "FieldName": "assignmentTypeLength",
        "Length": 50
    },
    {
        "FieldName": "annualSalaryLength",
        "Length": 18
    },
    {
        "FieldName": "contractRateLength",
        "Length": 50
    },
    {
        "FieldName": "contractRateTypeIdLength",
        "Length": 10
    },
    {
        "FieldName": "commentsLength",
        "Length": 2000
    },
    {
        "FieldName": "employeeEducationIdLength",
        "Length": 10
    },
    {
        "FieldName": "qualificationIdLength",
        "Length": 10
    },
    {
        "FieldName": "institutionNameLength",
        "Length": 250
    },
    {
        "FieldName": "candidateEmploymentExperienceIdLength",
        "Length": 20
    },
    {
        "FieldName": "cityIdLength",
        "Length": 20
    },
    {
        "FieldName": "positionTitleLength",
        "Length": 2000
    },
    {
        "FieldName": "employerNameLength",
        "Length": 2000
    },
    {
        "FieldName": "candidateDocIdLength",
        "Length": 20
    },
    {
        "FieldName": "employeeLicenseIdLength",
        "Length": 20
    },
    {
        "FieldName": "licenceNumberLength",
        "Length": 200
    },
    {
        "FieldName": "licenseTypeIdLength",
        "Length": 20
    },
    {
        "FieldName": "registeredStateIdLength",
        "Length": 20
    },
    {
        "FieldName": "certificateExamNameLength",
        "Length": 50
    },
    {
        "FieldName": "institutionNameLength",
        "Length": 50
    },
    {
        "FieldName": "employeeSkillDetailsIdLength",
        "Length": 20
    },
    {
        "FieldName": "skillIdLength",
        "Length": 20
    },
    {
        "FieldName": "yearsLength",
        "Length": 20
    },
    {
        "FieldName": "monthsLength",
        "Length": 20
    },
    {
        "FieldName": "candidateAchievementsIdLength",
        "Length": 20
    },
    {
        "FieldName": "integerMaxLength",
        "Length": 10
    },
    {
        "FieldName": "zipCodeLength",
        "Length": 20
    },
]

/**
 * length validation method in profile-management
 * @param {*} code : field name  
 */
function lengthValidation(code) {
    let returnMessage = undefined;
    for (let i = 0; i < validations.length; i++) {
        if (validations[i].FieldName === code) {
            returnMessage = validations[i].Length;
            break;
        }
    }
    return returnMessage;
}

module.exports = {
    lengthValidation: lengthValidation
}