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
        if (req.body.isClinicallyReviewed && (!req.body.sourceUrl || !req.body.reviewerName)) {
            return res.status(400).json({ status: 'error', message: 'A source URL and reviewer name are required before publishing a clinical response.' });
        }
        const tpl = req.params.templateId
            ? await cbService.updateTemplate(req.params.templateId, req.body)
            : await cbService.upsertTemplate(req.body);
        await logAction(req.user.id, 'MANAGE_CHATBOT_FAQ', 'ChatbotTemplate', tpl.id, { trigger: req.body.triggerKeyword, language: req.body.language, isClinicallyReviewed: req.body.isClinicallyReviewed }, req);
        return successResponse(res, tpl, "Assistant knowledge entry saved", 200);
    } catch(err) { next(err); }
};

const getTemplates = async (req, res, next) => {
    try {
        return successResponse(res, await cbService.getTemplates(), 'Assistant knowledge entries loaded', 200);
    } catch (err) { next(err); }
};

const deleteTemplate = async (req, res, next) => {
    try {
        const template = await cbService.deleteTemplate(req.params.templateId);
        await logAction(req.user.id, 'DELETE_CHATBOT_KNOWLEDGE', 'ChatbotTemplate', template.id, { trigger: template.triggerKeyword, language: template.language }, req);
        return successResponse(res, { id: template.id }, 'Assistant knowledge entry deleted', 200);
    } catch (err) { next(err); }
};

module.exports = { initSession, getHistory, sendQuery, manageTemplate, getTemplates, deleteTemplate };
