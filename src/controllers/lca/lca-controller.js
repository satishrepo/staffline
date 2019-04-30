/**
 * -------Import all classes and packages -------------
 */
import accountModel from '../../models/accounts/accounts-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import LcaModel from '../../models/lca/lca-model';
import enums from '../../core/enums';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    lcaModel = new LcaModel();

class LcaController {

    /**
    * Get About HR static page
    * @param {*} req : HTTP request argument
    * @param {*} res : HTTP response argument
    * @param {*} next : Callback argument
    */
    getLca(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            respData = {},
            employeeDetailsId = req.tokenDecoded.data.employeeDetailsId;

        if (!employeeDetailsId) {
            response = responseFormat.getResponseMessageByCodes(['invalidAuthToken'], { code: 417 });
            res.status(200).json(response);
        } else {
            accountModel.getUserById(employeeDetailsId)
                .then((isUsers) => {
                    if (isUsers) {
                        lcaModel.getAllLcaFiling(isUsers.PJEmployee_Id)
                            .then((details) => {
                                response = responseFormat.getResponseMessageByCodes('', { content: { dataList: details } });
                                res.status(200).json(response);
                            }).catch((error) => {
                                let resp = commonMethods.catchError('lca-controller/getAllLcaFiling', error);
                                response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                                res.status(resp.code).json(response);
                            })

                    }
                }).catch((error) => {
                    let resp = commonMethods.catchError('lca-controller/getlca', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                })
        }

    }
}

module.exports = LcaController;