/**
 *  -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import TimecardsModel from '../../models/timecards/timecards-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import CommonMethods from '../../core/common-methods';
import enums from '../../core/enums';

/**
 *  -------Initialize global variabls-------------
 */
let timecardsModel = new TimecardsModel(),
    config = configContainer.loadConfig(),
    commonMethods = new CommonMethods();

export default class InterviewTipsController {
    constructor() {
        //
    }

    /**
     * get timecard content page
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getInterviewTips(req, res, next) {

        let response = responseFormat.createResponseTemplate();
        timecardsModel.getStaticContentPage(enums.pageReferenceId.interviewTips)
            .then((contentPage) => {
                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: contentPage } });
                res.status(200).json(response);
            })
            .catch((error) => {
                let resp = commonMethods.catchError('getInterview-tips-controller/getInterviewTips', error);
                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                res.status(resp.code).json(response);
            })

    }
}