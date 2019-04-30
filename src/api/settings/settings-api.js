/**
 *  -------Import all classes and packages -------------
 */
import express from 'express';
import SettingsController from '../../controllers/settings/settings-controller';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let settingsController = new SettingsController();


/**
 *  -------Declare all routes-------------
 */

router.get('/settings/lookupdata', settingsController.lookupData);
router.get('/settings/alert', settingsController.getAlert);
router.post('/settings/alert', settingsController.saveAlert);
router.get('/settings/notifications', settingsController.getNotifications);
router.put('/settings/notifications', settingsController.markAsRead);

router.post('/settings/message', settingsController.message.bind(settingsController));
router.put('/settings/setmessage', settingsController.markMessage);
router.get('/settings/details/:messageid', settingsController.getMessageDetails);
router.post('/settings/reply', settingsController.replyMessage);
router.get('/settings/counts', settingsController.getMessageCounts);
router.get('/settings/messagecounts', settingsController.getMessageCountWithId);

router.get('/settings/test', settingsController.test);


module.exports = router;