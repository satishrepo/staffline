/**
 *  -------Import all classes and packages -------------
 */

import StaffContactsModel from '../../models/staffContacts/staff-contacts';
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import enums from '../../core/enums';
import CommonMethods from '../../core/common-methods';

let staffContacts = new StaffContactsModel(),
  commonMethods = new CommonMethods(),
  config = configContainer.loadConfig();

export default class StaffContactController {
  constructor() { }


  /**
   * Search staff contacts
   * @param {*} req : HTTP request argument
   * @param {*} res : HTTP response argument
   * @param {*} next : Callback argument
   */
  getStaffContacts(req, res, next) {
    let response = responseFormat.createResponseTemplate();
    let pageCount = req.body.pageCount ? req.body.pageCount : enums.paging.pageCount;
    let pageSize = req.body.pageSize ? req.body.pageSize : enums.paging.pageSize;
    let searchText = (req.body.searchText) ? req.body.searchText : "";

    let msgCode = [];

    if ((pageCount) && !commonMethods.isValidInteger(pageCount)) {
      msgCode.push('pageCount');
    }
    if ((pageSize) && !commonMethods.isValidInteger(pageSize)) {
      msgCode.push('pageSize');
    }

    if (msgCode.length) {
      response = responseFormat.getResponseMessageByCodes(msgCode, { code: 417 });
      res.status(200).json(response);
    }
    else {
      staffContacts.getStaffContacts(searchText.trim(), pageCount, pageSize)
        .then((data) => {
          response = responseFormat.getResponseMessageByCodes([''], { content: { dataList: data } });
          res.status(200).json(response);
        })
        .catch((error) => {
          let resp = commonMethods.catchError('staff-contacts-controller/getStaffContacts.', error);
          response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
          res.status(resp.code).json(response);
        })
    }
  }
}






