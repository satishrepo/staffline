/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import BenefitsController from '../../controllers/benefits/benefits-controller.js';

/**
 *  -------Initialize global variables-------------
 */
let app = express();
let router = express.Router();
let benefitsController = new BenefitsController();

/**
 *  -------Declare all routes-------------
 */
router.get('/benefits', benefitsController.getBenefits.bind(benefitsController));
router.get('/benefit/all', benefitsController.getAllBenefit.bind(benefitsController));
router.get('/benefits/:benefitId', benefitsController.getBenefitsById.bind(benefitsController));
router.post('/chatbot/benefits/all', benefitsController.getEmployeeBenefits);
router.post('/chatbot/benefits/401k', benefitsController.getEmployee401KBenefits);





module.exports = router;

