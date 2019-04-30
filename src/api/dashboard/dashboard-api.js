/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import DashboardController from '../../controllers/dashboard/dashboard-controller';

/**
 *  -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let dashboardController = new DashboardController();

/**
 *  -------Declare all routes-------------
 */
let routerGetDashboard = router.route('/dashboard');
let routerPostDashboardTimeCard = router.route('/dashboard/timecard');
let routerPostContactUs = router.route('/dashboard/contactus');

router.post('/dashboard/broadcast', dashboardController.getBroadcast)
router.put('/dashboard/broadcast', dashboardController.updateBroadcast)


/**
 *  ------ Bind all routes with related controller method-------------
 */

routerGetDashboard
    .get(dashboardController.getDashboardData.bind(dashboardController));

routerPostDashboardTimeCard
    .post(dashboardController.getDashboardTimeCardData.bind(dashboardController));

routerPostContactUs
    .post(dashboardController.postContactUs.bind(dashboardController));

module.exports = router;

