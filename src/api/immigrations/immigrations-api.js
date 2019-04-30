/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import ImmigrationController from '../../controllers/immigrations/immigrations-application-controller';


/**
 *  -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let immigrationController = new ImmigrationController();


/**
 *  -------Declare all routes-------------
 */
let routerGetAllImmigrationapplications = router.route('/immigrationapplications');
let routerGetImmigrationapplicationsById = router.route('/immigrationapplications/:legalAppId');
let routerGetLookups = router.route('/immigrationapplications/lookup/data');
let routerPostImmigrationapplications = router.route('/immigrationapplications');
let routerPutImmigrationapplications = router.route('/immigrationapplications');
let routerGetDocumentsByAppType = router.route('/immigrationdocuments/:appTypeId');
let routerPostDocuments = router.route('/immigrationdocuments');
let routerDeleteDocuments = router.route('/immigrationdocuments/:checkListId');
let routerGetImmigrationFiling = router.route('/immigrationfiling');

router.post('/immigrationapplications/documents', immigrationController.getImmigrationDocumentByEmpId.bind(immigrationController));
router.post('/immigrationapplications/uploadattachment', immigrationController.uploadAttachment.bind(immigrationController));


router.post('/chatbot/immigrationlist', immigrationController.getImmigrationapplicationsAllByEmpId.bind(immigrationController));


/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetAllImmigrationapplications
    .get(immigrationController.getAllImmigrationapplicationsByEmpId.bind(immigrationController));

routerGetImmigrationapplicationsById
    .get(immigrationController.getImmigrationapplicationsById.bind(immigrationController));

routerGetLookups
    .get(immigrationController.getAllLookups.bind(immigrationController));

routerGetDocumentsByAppType
    .get(immigrationController.getDocumentsByAppType.bind(immigrationController));

routerPostImmigrationapplications
    .post(immigrationController.postAddImmigrationapplications.bind(immigrationController));

routerPutImmigrationapplications
    .put(immigrationController.putUpdateImmigrationapplications.bind(immigrationController));

routerPostDocuments
    .post(immigrationController.postAddDocuments.bind(immigrationController));

routerDeleteDocuments
    .delete(immigrationController.deleteImmigrationDocuments.bind(immigrationController));

routerGetImmigrationFiling
    .get(immigrationController.getImmigrationFiling.bind(immigrationController));


module.exports = router;