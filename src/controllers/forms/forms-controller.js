/**
 * -------Import all classes and packages -------------
 */
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import FormsModel from '../../models/forms/forms-model';
import enums from '../../core/enums';
import FormsValidation from '../../validations/forms/forms-validation';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    formsModel = new FormsModel(),
    formsValidation = new FormsValidation();

class FormsController {

   /**
     * Get About HR static page
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getForms(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            deptName = req.body.deptName,
            respData = {},
            msgCode = [],
            flag = 0, department = '',
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;
        msgCode = formsValidation.getFormsValidation(deptName, employeeDetailsId);
        if (msgCode && msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else {
            Object.keys(enums.departmentNames).forEach(function (item) {
                if (item.toLowerCase().trim() == deptName.toLowerCase().replace(/\s/g, '')) {
                    department = enums.departmentNames[item];
                    flag=flag+1;
                }
            })
            if (flag != 0) {
                formsModel.getFormsByDeptName(department, employeeDetailsId)
                    .then((details) => {
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: details } });
                        res.status(200).json(response);
                    }).catch((error) => {
                        let resp = commonMethods.catchError('form-controller/getForms', error);
                        response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                        res.status(resp.code).json(response);
                    })
            }
            else {
                response = responseFormat.getResponseMessageByCodes(['deptName'], { code: 417 });
                res.status(200).json(response);
            }
        }



        // formsModel.getFormsByDeptName(deptName,employeeDetailsId)
        // .then((details)=>{
        //      response = responseFormat.getResponseMessageByCodes('', { content: { dataList: details } });
        //     res.status(200).json(response);
        // }).catch((error) => {
        //     logger.error('Error has occured in forms-controller/getForms.', error);
        //     response = responseFormat.getResponseMessageByCodes(['common400'], { code: 400 });
        //     res.status(400).json(response);
        // })
    }
}

module.exports = FormsController;