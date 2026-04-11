const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMERGENCY_REGEX = /(blood|breathing|choking|seizure|unconscious|911|emergency|not breathing|bleeding heavily|convulsing|poison|swallowed)/i;
const DOMAIN_SCOPE_REGEX = /(pediatric|child|baby|infant|toddler|kid|fever|cough|vomit|vomiting|diarrhea|rash|vaccine|vaccination|immunization|appointment|teleconsult|doctor|health record|medical|emergency|growth|nutrition|medication|allergy|chatbot|dashboard|profile|portal)/i;
const BLOCKED_OFF_TOPIC_REGEX = /(trade|stock|crypto|bitcoin|forex|politics|election|war|movie|music|celebrity|football|soccer|nba|nfl|fashion|programming|javascript|python|travel|restaurant|real estate|marketing|seo)/i;

const EMERGENCY_RESPONSE = "🚨 **EMERGENCY WARNING** 🚨\nThe symptoms described may require immediate medical attention. Please stop chatting and dial emergency services (911) or visit the nearest emergency room immediately. I am an AI, not a doctor. Please explicitly consult with a physical human professional.";
const FALLBACK_AI_RESPONSES = [
    "I can help best if you share your child's age and symptoms (for example: fever for 2 days, cough at night). I can then give safer next-step pediatric guidance.",
    "Tell me the main symptom and how long it has lasted, and I will give practical pediatric guidance plus when to seek urgent care.",
    "I can guide you on child symptoms, vaccines, appointments, teleconsultation, and health records. What specific pediatric concern do you want help with?"
];
const OFF_TOPIC_RESPONSE = "I can only help with Pediatric Health Hub and pediatric-care related topics such as child symptoms, vaccines, appointments, teleconsultation, and health records.";
const INTENT_RESPONSES = [
    {
        pattern: /^(hi|hello|hey|salam|asalaam|asc)\b/i,
        response: "Hi. I can help with pediatric symptoms, vaccines, appointments, teleconsultation, and using this app. What child-health concern do you want to discuss?"
    },
    {
        pattern: /(thank you|thanks|thx)/i,
        response: "You are welcome. If you want, I can help you with next steps such as booking an appointment or checking vaccine guidance."
    },
    {
        pattern: /(cancer|tumou?r|leukemia|lymphoma|oncology)/i,
        response: "Cancer is a disease where abnormal cells grow uncontrollably. In children, warning signs can include unusual lumps, unexplained weight loss, persistent fever, prolonged fatigue, or ongoing bone pain. This is not a diagnosis, so please arrange a pediatric consultation as soon as possible for proper evaluation."
    },
    {
        pattern: /(vaccine schedule|immunization schedule|which vaccine|vaccination due)/i,
        response: "I can help with vaccine-related guidance. You can use the vaccine tracker in this app and book a doctor appointment for missed or due doses."
    },
    {
        pattern: /(book|schedule).*(appointment|doctor)/i,
        response: "You can book a consultation from the Appointments section in your dashboard. Choose your child profile first, then pick an available doctor slot."
    },
    {
        pattern: /(what is|define|meaning of).*(pediatric health|child health)/i,
        response: "Pediatric health means the physical, mental, and developmental well-being of infants, children, and adolescents. It includes growth checks, vaccinations, nutrition, prevention of illness, and early treatment when symptoms appear."
    },
    {
        pattern: /(pediatric symptoms|child symptoms|symptoms in children)/i,
        response: "Common pediatric symptoms include fever, cough, vomiting, diarrhea, rash, breathing difficulty, poor feeding, and unusual sleepiness. If you share your child’s age and exact symptoms, I can give focused next-step guidance and red flags."
    }
];

const normalizeText = (value = '') => {
    return value.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

const extractKeywords = (triggerKeyword) => {
    return triggerKeyword
        .split(/[,\n|]/)
        .map((k) => normalizeText(k))
        .filter(Boolean);
};

const findBestTemplateMatch = (messageText, templates) => {
    const normalizedMessage = normalizeText(messageText);
    if (!normalizedMessage) return null;

    let bestMatch = null;
    let bestKeywordLength = 0;

    for (const template of templates) {
        const keywords = extractKeywords(template.triggerKeyword);
        for (const keyword of keywords) {
            // Match on word boundaries to avoid accidental partial matches.
            const pattern = new RegExp(`(^|\\s)${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i');
            if (pattern.test(normalizedMessage) && keyword.length > bestKeywordLength) {
                bestMatch = template;
                bestKeywordLength = keyword.length;
            }
        }
    }

    return bestMatch;
};

const findIntentResponse = (messageText) => {
    for (const intent of INTENT_RESPONSES) {
        if (intent.pattern.test(messageText)) return intent.response;
    }
    return null;
};

const pickFallback = (messageText) => {
    const normalized = normalizeText(messageText);
    const hash = normalized.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return FALLBACK_AI_RESPONSES[hash % FALLBACK_AI_RESPONSES.length];
};

const formatDateTime = (date) => {
    try {
        return new Date(date).toLocaleString();
    } catch (_) {
        return String(date);
    }
};

const getLatestChildHealthRecordResponse = async (userId) => {
    const parentProfile = await prisma.parentProfile.findUnique({
        where: { userId },
        include: {
            children: {
                include: {
                    medicalRecords: { orderBy: { updatedAt: 'desc' }, take: 1 },
                    growthRecords: { orderBy: { updatedAt: 'desc' }, take: 1 },
                    vaccinations: { orderBy: { updatedAt: 'desc' }, take: 1 },
                    appointments: { orderBy: { updatedAt: 'desc' }, take: 1 }
                }
            }
        }
    });

    if (!parentProfile || !parentProfile.children.length) {
        return "I could not find child profiles linked to your account yet. Please add a child profile first, then I can summarize the latest health records.";
    }

    const latestRecords = [];
    for (const child of parentProfile.children) {
        const childName = `${child.firstName} ${child.lastName}`.trim();
        if (child.medicalRecords[0]) {
            latestRecords.push({
                childName,
                type: 'Medical record',
                date: child.medicalRecords[0].updatedAt,
                summary: child.medicalRecords[0].diagnosis
            });
        }
        if (child.growthRecords[0]) {
            latestRecords.push({
                childName,
                type: 'Growth record',
                date: child.growthRecords[0].updatedAt,
                summary: `Weight: ${child.growthRecords[0].weightKg} kg, Height: ${child.growthRecords[0].heightCm} cm`
            });
        }
        if (child.vaccinations[0]) {
            latestRecords.push({
                childName,
                type: 'Vaccination',
                date: child.vaccinations[0].updatedAt,
                summary: `${child.vaccinations[0].vaccineName} (${child.vaccinations[0].status})`
            });
        }
        if (child.appointments[0]) {
            latestRecords.push({
                childName,
                type: 'Appointment',
                date: child.appointments[0].updatedAt,
                summary: `Status: ${child.appointments[0].status}`
            });
        }
    }

    if (!latestRecords.length) {
        return "I found your child profile, but there are no medical, growth, vaccination, or appointment records yet. You can create records from the child dashboard and appointments section.";
    }

    latestRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = latestRecords[0];
    return `Latest child health update:\nChild: ${latest.childName}\nType: ${latest.type}\nWhen: ${formatDateTime(latest.date)}\nSummary: ${latest.summary}\n\nOpen Child Health Records or Appointments from the dashboard if you want full details.`;
};

const getPediatricDiseaseGuidance = () => {
    return "General pediatric disease guidance:\n1. Common childhood illnesses include viral fever, flu, gastroenteritis, ear infection, and asthma flare.\n2. Watch urgent warning signs: breathing difficulty, dehydration, persistent high fever, seizures, confusion, severe rash, or poor responsiveness.\n3. For mild symptoms, prioritize hydration, rest, and temperature monitoring.\n4. If symptoms worsen or last more than 24-48 hours, book a pediatric appointment.\n\nIf you tell me your child’s specific symptoms and age, I can give safer next-step guidance.";
};

const resolveDynamicIntent = async (session, messageText) => {
    const normalized = normalizeText(messageText);

    // App-specific data intent: latest child record summary
    if (/latest|recent|newest/.test(normalized) && /child|health|record|records/.test(normalized)) {
        if (session.user?.role !== 'PARENT') {
            return "Latest child health record lookup is currently available for parent accounts. For doctors/admins, use the patient/records dashboard views.";
        }
        return getLatestChildHealthRecordResponse(session.userId);
    }

    // Typos and variants of pediatric disease intent.
    if (
        /pedi|peri|child/.test(normalized) &&
        /disea|diesea|desea|illness|condition/.test(normalized)
    ) {
        return getPediatricDiseaseGuidance();
    }

    if (/general/.test(normalized) && /pediatric|child/.test(normalized) && /guidance|advice|help/.test(normalized)) {
        return getPediatricDiseaseGuidance();
    }

    // Symptom-focused guidance (not diagnosis), more helpful than generic fallback.
    if (/fever|cough|vomit|vomiting|diarrhea|rash|pain|headache|cold|flu|breath|breathing|wheeze|asthma/.test(normalized)) {
        return "I can provide general pediatric guidance for these symptoms, but not diagnosis. Please share: child age, main symptom, duration, fever level if any, and warning signs (breathing difficulty, dehydration, seizures, severe lethargy). Then I’ll suggest clear next steps.";
    }

    return null;
};

const createSession = async (userId) => {
    return prisma.chatbotSession.create({ data: { userId } });
};

const getSessionMessages = async (sessionId, userId) => {
    const session = await prisma.chatbotSession.findUnique({
        where: { id: sessionId },
        include: { user: { select: { role: true } } }
    });
    if (!session || session.userId !== userId) throw Object.assign(new Error("Unauthorized Context"), { statusCode: 403 });

    return prisma.chatbotMessage.findMany({ where: { sessionId }, orderBy: { timestamp: 'asc' } });
};

const processMessage = async (sessionId, userId, messageText) => {
    const safeMessageText = (messageText || '').trim();
    if (!safeMessageText) throw Object.assign(new Error("Message cannot be empty"), { statusCode: 400 });

    // 1. Ownership & Identity validation
    const session = await prisma.chatbotSession.findUnique({
        where: { id: sessionId },
        include: { user: { select: { role: true } } }
    });
    if (!session || session.userId !== userId) throw Object.assign(new Error("Unauthorized"), { statusCode: 403 });

    // 2. Transact User Matrix
    await prisma.chatbotMessage.create({
        data: { sessionId, sender: 'USER', message: safeMessageText }
    });

    // 3. Moderation Hook Phase 1 (Life-Threatening Traversal)
    if (EMERGENCY_REGEX.test(safeMessageText)) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: EMERGENCY_RESPONSE }
        });
    }

    // 3.5 Scope guard: keep assistant bounded to project/pediatric domain.
    if (BLOCKED_OFF_TOPIC_REGEX.test(safeMessageText) && !DOMAIN_SCOPE_REGEX.test(safeMessageText)) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: OFF_TOPIC_RESPONSE }
        });
    }

    // 4. Moderation Hook Phase 2 (Hardcoded Clinical Template Match)
    const templates = await prisma.chatbotTemplate.findMany({
        orderBy: { updatedAt: 'desc' }
    });
    const matchedTemplate = findBestTemplateMatch(safeMessageText, templates);
    if (matchedTemplate) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: matchedTemplate.response }
        });
    }

    const dynamicIntentResponse = await resolveDynamicIntent(session, safeMessageText);
    if (dynamicIntentResponse) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: dynamicIntentResponse }
        });
    }

    const intentResponse = findIntentResponse(safeMessageText);
    if (intentResponse) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: intentResponse }
        });
    }

    // 5. Generative AI Proxy (RAG Mock)
    // Here `fetch('https://api.openai.com/v1/chat/completions')` goes passing the strictest System-Prompt defined previously.
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency safely locally

    return prisma.chatbotMessage.create({
        data: { sessionId, sender: 'AI', message: pickFallback(safeMessageText) }
    });
};

const upsertTemplate = async (triggerKeyword, response) => {
    const normalizedKeywords = extractKeywords(triggerKeyword);
    if (!normalizedKeywords.length) {
        throw Object.assign(new Error("Trigger keyword cannot be empty"), { statusCode: 400 });
    }
    const normalizedTriggerKeyword = normalizedKeywords.join(', ');

    return prisma.chatbotTemplate.upsert({
        where: { triggerKeyword: normalizedTriggerKeyword },
        update: { response },
        create: { triggerKeyword: normalizedTriggerKeyword, response }
    });
};

module.exports = { createSession, getSessionMessages, processMessage, upsertTemplate };
