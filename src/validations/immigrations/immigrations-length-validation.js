/**
 * length validation on fields in immigration section
 */
let validations = [
    {
        "FieldName": "contactNumberLength",
        "Length": 30
    },
    {
        "FieldName": "appForLength",
        "Length": 4
    },
    {
        "FieldName": "appPriorityLength",
        "Length": 10
    },
    {
        "FieldName": "appTypeLength",
        "Length": 5
    },
    {
        "FieldName": "currentStatusLength",
        "Length": 10
    },
    {
        "FieldName": "skillCategoryIdLength",
        "Length": 10
    },
    {
        "FieldName": "commentsLength",
        "Length": 500
    },
    {
        "FieldName":"checkListIdLength",
        "Length":10
    },
    {
        "FieldName":"legalDocNameLength",
        "Length":50
    },
    {
        "FieldName":"legalAppIdLength",
        "Length":10
    },
    {
        "FieldName":"firstNameLength",
        "Length":25
    },
    {
        "FieldName":"lastNameLength",
        "Length":25
    },
    {
        "FieldName" : "appForIdLength",
        "Length":10
    }
]

/**
 * length validation method
 * @param {*} code 
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