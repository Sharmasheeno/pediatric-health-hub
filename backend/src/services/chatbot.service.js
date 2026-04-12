const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMERGENCY_REGEX = /(blood|breathing|choking|seizure|unconscious|911|emergency|not breathing|bleeding heavily|convulsing|poison|swallowed)/i;

const EMERGENCY_RESPONSE = "🚨 **EMERGENCY WARNING** 🚨\nThe symptoms described may require immediate medical attention. Please stop chatting and dial emergency services (911) or visit the nearest emergency room immediately. I am an AI, not a doctor. Please explicitly consult with a physical human professional.";

const createSession = async (userId) => {
    return prisma.chatbotSession.create({ data: { userId } });
};

const getSessionMessages = async (sessionId, userId) => {
    const session = await prisma.chatbotSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw Object.assign(new Error("Unauthorized Context"), { statusCode: 403 });

    return prisma.chatbotMessage.findMany({ where: { sessionId }, orderBy: { timestamp: 'asc' } });
};

const processMessage = async (sessionId, userId, messageText) => {
    // 1. Ownership & Identity validation
    const session = await prisma.chatbotSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw Object.assign(new Error("Unauthorized"), { statusCode: 403 });

    // 2. Transact User Matrix
    await prisma.chatbotMessage.create({
        data: { sessionId, sender: 'USER', message: messageText }
    });

    // 3. Moderation Hook Phase 1 (Life-Threatening Traversal)
    if (EMERGENCY_REGEX.test(messageText)) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: EMERGENCY_RESPONSE }
        });
    }

    // 4. Moderation Hook Phase 2 (Hardcoded Clinical Template Match)
    const templates = await prisma.chatbotTemplate.findMany();
    for (const t of templates) {
        if (messageText.toLowerCase().includes(t.triggerKeyword.toLowerCase())) {
            return prisma.chatbotMessage.create({
                data: { sessionId, sender: 'AI', message: t.response }
            });
        }
    }

    // 5. Generative AI Proxy (RAG Mock)
    // Here `fetch('https://api.openai.com/v1/chat/completions')` goes passing the strictest System-Prompt defined previously.
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency safely locally
    
    const simulatedAIResponse = "Based on general pediatric guidelines, this appears broadly observational. However, I am the Health Assistant AI and cannot provide a definitive medical diagnosis. For confirmed safety, I explicitly instruct you to book an appointment with your Pediatrician via the main dashboard.";

    return prisma.chatbotMessage.create({
        data: { sessionId, sender: 'AI', message: simulatedAIResponse }
    });
};

const upsertTemplate = async (triggerKeyword, response) => {
    return prisma.chatbotTemplate.upsert({
        where: { triggerKeyword },
        update: { response },
        create: { triggerKeyword, response }
    });
};

module.exports = { createSession, getSessionMessages, processMessage, upsertTemplate };
