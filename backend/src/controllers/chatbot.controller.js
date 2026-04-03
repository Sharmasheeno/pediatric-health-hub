const cbService = require('../services/chatbot.service');
const { logAction } = require('../services/audit.service');
const { successResponse } = require('../utils/responseWrapper');

const initSession = async (req, res, next) => {
    try {
        const sess = await cbService.createSession(req.user.id);
        await logAction(req.user.id, 'START_CHATBOT', 'ChatbotSession', sess.id, null, req);
        return successResponse(res, sess, "Conversation session initialized safely", 201);
    } catch(err) { next(err); }
};

const getHistory = async (req, res, next) => {
    try {
        const msgs = await cbService.getSessionMessages(req.params.sessionId, req.user.id);
        return successResponse(res, msgs, "Conversation restored securely");
    } catch(err) { next(err); }
};

const sendQuery = async (req, res, next) => {
    try {
        const aiResponse = await cbService.processMessage(req.params.sessionId, req.user.id, req.body.message);
        return successResponse(res, aiResponse, "Semantic proxy completed securely", 200);
    } catch(err) { next(err); }
};

const manageTemplate = async (req, res, next) => {
    try {
        const tpl = await cbService.upsertTemplate(req.body.triggerKeyword, req.body.response);
        await logAction(req.user.id, 'MANAGE_CHATBOT_FAQ', 'ChatbotTemplate', tpl.id, { trigger: req.body.triggerKeyword }, req);
        return successResponse(res, tpl, "Global Template strict-mapped successfully", 200);
    } catch(err) { next(err); }
};

module.exports = { initSession, getHistory, sendQuery, manageTemplate };
