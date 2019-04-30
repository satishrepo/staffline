/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import ChatController from '../../controllers/chat/chat-controller.js';

/**
 *  -------Initialize global variables-------------
 */
let app = express();
let router = express.Router();
let chatController = new ChatController();

// routes 

router.post('/chat/send', chatController.createChat.bind(chatController));
router.post('/chat/savehistory', chatController.saveHistory.bind(chatController));

router.post('/chat/getmessage', chatController.getLatestMessageByChatId.bind(chatController));
router.post('/chat/checkstatus', chatController.checkUserStatus.bind(chatController));

router.get('/chat/groups', chatController.getChatGroups.bind(chatController));
router.get('/chat/getissuetype/:groupId([0-9]+)', chatController.getIssueTypeByGroupId.bind(chatController));

router.post('/chat/conversations', chatController.getCoversationByChat.bind(chatController));
router.post('/chat/startconversations', chatController.startCoversation.bind(chatController));

router.get('/chat/unreadconversations', chatController.getUnreadConversations.bind(chatController));


module.exports = router;

