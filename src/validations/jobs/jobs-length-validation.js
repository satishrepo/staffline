/**
 * jobs Validation
 */
let validations = [
    {
        "FieldName": "projectDetailIdLength",
        "Length": 10
    }
]

/**
 * length validation method in jobs
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