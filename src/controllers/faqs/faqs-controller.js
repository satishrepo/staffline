/**
 * -------Import all classes and packages -------------
 */
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import enums from '../../core/enums';
import FaqsModel from '../../models/faqs/faqs-model';
import FaqValidation from '../../validations/faqs/faqs-validation';
import UserModel from '../../models/profileManagement/profile-management-model';
import CrudOperationModel from '../../models/common/crud-operation-model';


// call all entities 
import { APP_REF_DATA } from "../../entities/index";
/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    faqsModel = new FaqsModel(),
    userModel = new UserModel(),
    crudOperationModel = new CrudOperationModel(),
    faqValidation = new FaqValidation();


export default class FaqController {

    /**
     * get FaqsLookup Data
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getFaqsLookupData(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            respData = [{
                faqType: null
            }];

        userModel.getUserLookupData(enums.appRefParentId.faqParrentId)
            .then((faqTypeData) => {
                respData[0].faqType = faqTypeData;
                response = responseFormat.getResponseMessageByCodes([''], { content: { dataList: respData } });
                res.status(200).json(response);
            }).catch((error) => {
                let resp = commonMethods.catchError('faqs-controller/getFaqsLookupData', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })
    }

    /**
     * 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */

    getFaqs(req, res, next) {
        let faqType = req.body.faqType,
            response = responseFormat.createResponseTemplate(),
            msgCode = [];
        msgCode = faqValidation.getFaqValidation(faqType);
        if (msgCode && msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {

            crudOperationModel.findModelByCondition(APP_REF_DATA,
                {
                    keyId: ~~faqType,
                    parentId: ~~enums.appRefParentId.faqParrentId
                })
                .then((details) => {
                    if (details) {

                        faqsModel.getFaqsByFaqType(faqType)
                            .then((details) => {
                                response = responseFormat.getResponseMessageByCodes([''], { content: { dataList: details } });
                                res.status(200).json(response);
                            }).catch((error) => {
                                let resp = commonMethods.catchError('faqs-controller/getFaqs', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })
                    }
                    else {
                        response = responseFormat.getResponseMessageByCodes(['faqType'], { code: 417 });
                        res.status(200).json(response);
                    }

                });
        }
    }

}
