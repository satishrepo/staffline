/**
 * -------Import all classes and packages -------------
 */
import BenefitsModel from '../../models/benefits/benefits-model';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import StaticPagesModel from '../../models/staticPages/staticPages-model';
import enums from '../../core/enums';
import accountModel from '../../models/accounts/accounts-model';
import async from 'async';
import CommonMethods from '../../core/common-methods';

/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    benefitsModel = new BenefitsModel(),
    commonMethods = new CommonMethods(),
    staticPagesModel = new StaticPagesModel();


export default class BenefitsController {
    constructor() {
        //
    }
    getContents(detail) {
        staticPagesModel.getStaticPage(enums.sectionStaticPages.hrBenefits)
        .then((pageContent) => {
            return pageContent[0].contents;
        })
    }
    /**
     * Get all Benefits list
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument

     */

    getBenefits(req, res, next) {
        let self = this,
            response = responseFormat.createResponseTemplate();

        benefitsModel.getAllBenefits(enums.getBenefits.status, enums.getBenefits.showOnEmpPortal)
        .then((benefitsDetails) => {
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: benefitsDetails } });
            res.status(200).json(response);
        })
        .catch((error) => {
            let resp = commonMethods.catchError('benefits-controller/getBenefits', error);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        });
    }

    getAllBenefit(req, res, next){
        let self = this,
            response = responseFormat.createResponseTemplate();

        benefitsModel.getAllBenefitsWithoutHtml(enums.getBenefits.status, enums.getBenefits.showOnEmpPortal)
        .then((benefitsDetails) => {
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: benefitsDetails } });
            res.status(200).json(response);
        })
        .catch((error) => {
            let resp = commonMethods.catchError('benefits-controller/getAllBenefit', error);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        });
    }

    getBenefitsById(req, res, next){
        let self = this,
            response = responseFormat.createResponseTemplate();
        let benefitId = req.params.benefitId;

        benefitsModel.getAllBenefitById(benefitId, enums.getBenefits.status, enums.getBenefits.showOnEmpPortal)
        .then((benefitsDetails) => {
            response = responseFormat.getResponseMessageByCodes('', { content: { dataList: benefitsDetails } });
            res.status(200).json(response);
        })
        .catch((error) => {
            let resp = commonMethods.catchError('benefits-controller/getBenefitsById', error);
            response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
            res.status(resp.code).json(response);
        })
    }

    getEmployeeBenefits(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded ? req.tokenDecoded.data.employeeDetailsId : 0;
        let msgCode = [];
        let userInfo = {};

        let guid = req.body.guid || '';

        if(guid == '' && employeeDetailsId == 0)
        {
            msgCode.push('guid');
        }

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {

            async.series([
                function(done)
                {
                    if(employeeDetailsId == 0)
                    {
                        accountModel.getUserCredentialByGuid(guid)
                        .then( rs => {
                            if(rs)
                            {
                                employeeDetailsId = rs.employeeDetailsId;
                                done();
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['guid'], { code: 417 });
                                res.status(200).json(response);
                            }
                        }).catch(err => {
                            done(err)
                        })

                    }
                    else
                    {
                        done();
                    }
                },
                function(done)
                {
                    benefitsModel.getUserDetails(employeeDetailsId)
                    .then( rs => {
                        if(rs)
                        {
                            userInfo['firstName'] = rs.firstName;
                            userInfo['lastName'] = rs.lastName;
                            userInfo['email'] = rs.emailId;
                            userInfo['workAuthorization'] = rs.authorisationStatus;
                            userInfo['userType'] = rs.employeeType;
                            userInfo['userTypeId'] = rs.employeeTypeId;
                            userInfo['contactNumber'] = rs.contactNumber;
                            userInfo['onProject'] = rs.activeProjects < 1 ? 'no' : 'yes';
                            done();
                        }
                        else
                        {
                            done('User not found')
                        }
                    })
                },
                function(done)
                {
                    benefitsModel.getEmployeeBenefits(employeeDetailsId)
                    .then((benefitsDetails) => {
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [{userInfo: userInfo, benefits: benefitsDetails}] } });
                        res.status(200).json(response);
                    })
                    .catch((error) => {
                        done(error);
                    })
                }
            ],function(err, result) {
                if(err)
                {
                    let resp = commonMethods.catchError('benefits-controller/getEmployeeBenefits', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
            })

        }

    }

    getEmployee401KBenefits(req, res, next)
    {
        let response = responseFormat.createResponseTemplate();
        let employeeDetailsId = req.tokenDecoded ? req.tokenDecoded.data.employeeDetailsId : 0;
        let msgCode = [];
        let userInfo = {};
        let guid = req.body.guid || '';

        if(guid == '' && employeeDetailsId == 0)
        {
            msgCode.push('guid');
        }

        if(msgCode.length)
        {
            response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
            res.status(200).json(response);
        }
        else
        {

            async.series([
                function(done)
                {
                    if(employeeDetailsId == 0)
                    {
                        accountModel.getUserCredentialByGuid(guid)
                        .then( rs => {
                            if(rs)
                            {
                                employeeDetailsId = rs.employeeDetailsId;
                                done();
                            }
                            else
                            {
                                response = responseFormat.getResponseMessageByCodes(['guid'], { code: 417 });
                                res.status(200).json(response);
                            }
                        }).catch(err => {
                            done(err)
                        })

                    }
                    else
                    {
                        done();
                    }
                },
                function(done)
                {
                    benefitsModel.getUserDetails(employeeDetailsId)
                    .then( rs => {
                        if(rs)
                        {

                            userInfo['firstName'] = rs.firstName;
                            userInfo['lastName'] = rs.lastName;
                            userInfo['email'] = rs.emailId;
                            userInfo['workAuthorization'] = rs.authorisationStatus;
                            userInfo['userType'] = rs.employeeType;
                            userInfo['userTypeId'] = rs.employeeTypeId;
                            userInfo['contactNumber'] = rs.contactNumber;
                            userInfo['onProject'] = rs.activeProjects < 1 ? 'no' : 'yes';
                            done();
                        }
                        else
                        {
                            done('User not found')
                        }
                    })
                },
                function(done)
                {
                    benefitsModel.get401KEmployeeBenefits(employeeDetailsId)
                    .then((benefitsDetails) => {
                        response = responseFormat.getResponseMessageByCodes('', { content: { dataList: [{userInfo: userInfo, benefits: benefitsDetails}] } });
                        res.status(200).json(response);
                    })
                    .catch((error) => {
                        done(error);
                    })
                }
            ],function(err, result) {
                if(err)
                {
                    let resp = commonMethods.catchError('benefits-controller/get401KEmployeeBenefits', err);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                }
            })

        }

    }
}