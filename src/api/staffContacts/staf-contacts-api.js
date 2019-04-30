/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import StaffContactController from '../../controllers/staffContacts/staff-contacts-controller';


/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let staffContactController = new StaffContactController();

/**
 *  -------Declare all routes-------------
 */
let routerGetStaffContact = router.route('/staffcontacts');

routerGetStaffContact
  .post(staffContactController.getStaffContacts.bind(staffContactController));


module.exports = router;