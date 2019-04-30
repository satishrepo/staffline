/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import MyProjectsController from '../../controllers/myProjects/my-projects-controller';

/**
 *  -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let myProjectsController = new MyProjectsController();

/**
 *  -------Declare all routes-------------
 */
let routerGetLookUpdata = router.route('/myprojects/lookupdata');
let routerGetCurrentProject = router.route('/myprojects/currentprojects');
let routerGetPastProjects = router.route('/myprojects/pastprojects');
let routerGetProjectByProjectId = router.route('/myprojects/:projectDetailId([0-9]+)');
let routerPutUpdateProject = router.route('/myprojects');
router.post('/myprojects/projectend', myProjectsController.informToAm)

/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetLookUpdata
    .get(myProjectsController.getLookUpdata.bind(myProjectsController));

routerGetCurrentProject
    .get(myProjectsController.getCurrentProject.bind(myProjectsController));

routerGetPastProjects
    .get(myProjectsController.getPastProjects.bind(myProjectsController));

routerGetProjectByProjectId
    .get(myProjectsController.getProjectByProjectId.bind(myProjectsController));

routerPutUpdateProject
    .put(myProjectsController.putUpdateProject.bind(myProjectsController));


module.exports = router;