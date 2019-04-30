/**
 * my-projects Validation
 */
let validations = [
    {
        "FieldName": "projectDetailIdLength",
        "Length": 10
    },
    {
        "FieldName": "projectDurationLength",
        "Length": 200
    },
    {
        "FieldName": "projectDescriptionLength",
        "Length": 1000
    },
    {
        "FieldName": "technologyIdLength",
        "Length": 10
    },
    {
        "FieldName": "roleIdLength",
        "Length": 10
    },
    {
        "FieldName": "managerNameLength",
        "Length": 200
    },
    {
        "FieldName": "managerTitleLength",
        "Length": 200
    },
    {
        "FieldName": "managerEmailLength",
        "Length": 200
    },
    {
        "FieldName": "managerPhoneLength",
        "Length": 25
    },
    {
        "FieldName": "commentsLength",
        "Length": 500
    }
]

/**
 * length validation method in my-projects
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