/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import LcaController from '../../controllers/lca/lca-controller';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let lcaController=new LcaController();

/**
 *  -------Declare all routes-------------
 */

let routerGetLca=router.route('/lca');


/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetLca
    .get(lcaController.getLca.bind(lcaController));

module.exports=router;