/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import StaticPagesModel from '../../models/staticPages/staticPages-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import EmailModel from '../../models/emails/emails-model';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';

/**
 *  -------Initialize global variabls-------------
 */
let staticPagesModel = new StaticPagesModel(),
    config = configContainer.loadConfig(),
    commonMethods = new CommonMethods();

export default class HrController {
    constructor() {
        //
    }

    /**
     * Get About HR static page
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getAboutHr(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            msgCode = [];

        if (msgCode && msgCode.length) {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        } else {
            staticPagesModel.getStaticPage(enums.pageReferenceId.aboutHr)
                .then((aboutHr) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: aboutHr } });
                    res.status(200).json(response);
                })
                .catch((error) => {
                    let resp = commonMethods.catchError('hr-application-controller/getAboutHr', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }
    }


    /**
     * Get Error code response for testing 
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument
     */
    getErrorResponse(req, res, next) {
        let response = responseFormat.getResponseMessageByCodes(['common500'], { code: 500 });
        res.status(500).json(response);
    }
}