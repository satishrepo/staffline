/**
 * vacations Validation
 */
let validations = [
    {
        "FieldName": "reasonLength",
        "Length": 500
    },
    {
        "FieldName": "contactInfoLength",
        "Length": 200
    }
]

/**
 * length validation method in vacations
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