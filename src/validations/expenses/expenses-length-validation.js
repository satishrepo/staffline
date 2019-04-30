/**
 * timecards Validation
 */
let validations=[
    {
        "FieldName": "yearLength",
        "Length": 10
    },
    {
        "FieldName": "yearStringLength",
        "Length": 4
    },
    {
        "FieldName": "monthLength",
        "Length": 10
    },
    {
        "FieldName": "monthNumber",
        "Length": 12
    },
    {
        "FieldName": "statusIdLength",
        "Length": 10
    },    
    {
        "FieldName": "integerMaxLength",
        "Length": 10
    },  
 ]

/**
 * length validation method in timecards
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