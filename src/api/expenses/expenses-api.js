/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import ExpensesController from '../../controllers/expenses/expenses-controller.js';

/**
 *  -------Initialize global variables-------------
 */
let app = express();
let router = express.Router();
let expensesController = new ExpensesController();
/**
 *  -------Declare all routes-------------
 */

let routerGetExpenses = router.route('/expenses');
let routerPostExpenses = router.route('/expenses');

/**
 *  ------ Bind all routes with related controller method-------------
 */

/**
 * Get Expenses list
 */
routerGetExpenses
    .get(expensesController.getExpenses.bind(expensesController));

/**
* Save Expenses list
*/
routerPostExpenses
    .post(expensesController.postExpenses.bind(expensesController));

module.exports = router;