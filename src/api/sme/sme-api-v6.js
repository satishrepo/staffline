
/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import SmeController from '../../controllers/sme/sme-controller';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let smeController = new SmeController();


router.get('/sme/content', smeController.getSmeContent.bind(smeController));
router.post('/sme/apply', smeController.apply.bind(smeController));
router.get('/sme/availability', smeController.getSmeAvailability.bind(smeController));
router.post('/sme/availability', smeController.saveSmeAvailability.bind(smeController));
router.delete('/sme/availability/:smeAvailabilityId', smeController.deleteSmeAvailability.bind(smeController));

router.get('/sme/interviews', smeController.getInterviews.bind(smeController));
router.get('/sme/interview/:interviewRequestId', smeController.getInterviewDetails.bind(smeController));
router.post('/sme/updateinterview', smeController.updateInteviewStatus.bind(smeController));
router.post('/sme/feedback', smeController.saveFeedback.bind(smeController));

router.get('/sme/compensations', smeController.getCompensations.bind(smeController));
router.get('/sme/compensation/:interviewId', smeController.getCompensationDetails.bind(smeController));



module.exports = router;