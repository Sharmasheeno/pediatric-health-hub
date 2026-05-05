const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMERGENCY_REGEX = /(blood|breathing|choking|seizure|unconscious|911|emergency|not breathing|bleeding heavily|convulsing|poison|swallowed)/i;

const EMERGENCY_RESPONSE = "🚨 **EMERGENCY WARNING** 🚨\nThe symptoms described may require immediate medical attention. Please stop chatting and dial emergency services (911) or visit the nearest emergency room immediately. I am an AI, not a doctor. Please explicitly consult with a physical human professional.";

// Intelligent response engine with pediatric knowledge base
const KNOWLEDGE_BASE = {
    // Greetings
    greetings: {
        patterns: /^(hi|hello|hey|good morning|good afternoon|good evening|assalamu alaykum|howdy|what's up|how are you|greetings)/i,
        response: "Hello! 👋 I'm your Pediatric Health Assistant. I can help with general guidance about:\n\n• **Child symptoms** (fever, cough, rash, vomiting, etc.)\n• **Nutrition & feeding** advice\n• **Growth & development** milestones\n• **Vaccination** schedules\n• **Sleep** tips for children\n• **When to see a doctor**\n\nHow can I help you today?"
    },
    // General Symptoms Inquiry
    generalSymptoms: {
        patterns: /child symptoms|common symptoms|what are symptoms|what symptoms|sick child|my child is sick/i,
        response: "🩺 **Pediatric Guideline: Common Symptoms**\n\nChildren frequently experience a range of common symptoms as their immune systems develop. I can provide specific guidance on any of the following:\n\n• 🌡️ **Fever** (high temperature)\n• 🤧 **Cough & Cold** (runny nose, congestion)\n• 🤢 **Stomach Issues** (vomiting, diarrhea, belly pain)\n• 🔴 **Skin Conditions** (rashes, eczema, hives)\n• 👂 **Ear & Throat** (earache, pulling ear, sore throat)\n\nPlease tell me exactly what symptom your child is experiencing (e.g., 'My child has a fever' or 'Guidance for baby cough')."
    },
    // Fever
    fever: {
        patterns: /fever|high temperature|hot|warm|temp/i,
        response: "🌡️ **Pediatric Guideline: Fever**\n\nA fever is a body temperature of 100.4°F (38°C) or higher. It's usually a sign the body is fighting an infection.\n\n**Home care:**\n• Keep your child hydrated with plenty of fluids\n• Dress them in lightweight clothing\n• Use age-appropriate fever reducers (acetaminophen or ibuprofen) *only* as directed by a pediatrician. Never give aspirin.\n\n🚨 **Call a doctor immediately if:**\n• Your infant is **under 3 months old** with a fever\n• The fever lasts more than 5 days\n• Your child is unresponsive, won't drink fluids, or has a stiff neck"
    },
    // Cough
    cough: {
        patterns: /cough|coughing|hacking|wheez|croup/i,
        response: "🤧 **Pediatric Guideline: Coughing**\n\nCoughs help clear the airways but can disrupt sleep.\n\n**Home care:**\n• **Under 1 year:** Use a cool-mist humidifier. Use saline drops and a bulb syringe for a congested nose.\n• **Over 1 year:** You can offer 1/2 to 1 teaspoon of honey to soothe the throat. Keep a humidifier running.\n• Keep the child hydrated to thin mucus.\n\n🚨 **Seek immediate care if your child:**\n• Is working hard to breathe (nostrils flaring, ribs showing)\n• Has a 'barking' seal-like cough (croup) with breathing difficulty\n• Is wheezing or breathing very rapidly"
    },
    // Rash
    rash: {
        patterns: /rash|spots|redness|hives|bumps|skin/i,
        response: "🔴 **Pediatric Guideline: Rashes**\n\nRashes are very common in children and have many causes (viral infections, allergies, heat, eczema).\n\n**Home care:**\n• Avoid scrubbing the skin; pat dry after baths\n• Use fragrance-free, hypoallergenic moisturizers\n• Keep the child cool to avoid heat exacerbating the rash\n\n🚨 **Call a doctor if the rash:**\n• Looks like tiny purple/red dots that *do not fade* when pressed (petechiae)\n• Is accompanied by a high fever or lethargy\n• Looks infected (oozing, extreme swelling, red streaks)\n• Spreads very rapidly"
    },
    // Vomiting / Diarrhea
    stomach: {
        patterns: /vomit|throw up|throwing up|puke|diarrhea|poop|stomach|bellyache|tummy/i,
        response: "🤢 **Pediatric Guideline: Vomiting & Diarrhea**\n\nThe biggest risk with stomach bugs is **dehydration**.\n\n**Home care:**\n• **Hydration is key.** Offer small, frequent sips of an oral rehydration solution (like Pedialyte).\n• Wait 30-60 mins after vomiting before offering liquids.\n• For babies, continue breastfeeding or formula in smaller amounts.\n• Avoid sugary drinks (juice, sports drinks) which can worsen diarrhea.\n\n🚨 **See a doctor if:**\n• There are signs of severe dehydration (no wet diapers for 6-8 hours, no tears when crying, sunken eyes)\n• There is blood in the vomit or stool\n• Vomit is bright green (bile)\n• Vomiting lasts more than 24 hours"
    },
    // Sleep
    sleep: {
        patterns: /sleep|nap|bedtime|wake|waking|tired/i,
        response: "😴 **Pediatric Guideline: Healthy Sleep**\n\n**General sleep needs by age (including naps):**\n• **Newborns:** 14-17 hours (erratic schedule)\n• **Infants (4-11 mos):** 12-15 hours\n• **Toddlers (1-2 yrs):** 11-14 hours\n• **Preschoolers (3-5 yrs):** 10-13 hours\n\n**Tips for better sleep:**\n• Establish a consistent, calming bedtime routine (bath, book, bed)\n• Keep the bedroom cool, dark, and quiet\n• Avoid screens for at least 1 hour before bedtime\n• For babies, always place them to sleep on their back on a firm, flat surface (SIDS prevention)."
    },
    // Nutrition
    nutrition: {
        patterns: /food|eat|nutrition|meal|diet|picky|vitamin/i,
        response: "🍎 **Pediatric Guideline: Nutrition**\n\n**General Tips:**\n• **Variety:** Offer a rainbow of fruits and vegetables.\n• **Portions:** Toddler portions are smaller than you think (about 1 tablespoon per year of age for each food type).\n• **Picky Eaters:** This is normal! Keep offering foods without pressure. It can take 10-15 exposures before a child accepts a new food.\n• **Hydration:** Water and milk are best. Limit juice to 4 oz a day (and none before age 1).\n\n⚠️ **Choking Hazards (under age 4):** Avoid whole grapes, popcorn, nuts, hard candies, and chunks of peanut butter."
    },
    // Teething
    teething: {
        patterns: /teeth|teething|tooth|dental|gum|drool/i,
        response: "🦷 **Pediatric Guideline: Teething**\n\nTeething typically begins around 6 months of age.\n\n**Common symptoms:**\n• Increased drooling and fussiness\n• Swollen, tender gums\n• Chewing on objects\n• Mild temperature (below 100.4°F)\n\n**Home care:**\n• Offer a clean, cold teething ring\n• Gently rub gums with a clean finger\n• Use age-appropriate pain relief (consult dosage with your doctor)\n\n⚠️ **See a doctor if:** High fever, diarrhea, or rash accompanies teething — these are NOT normal teething symptoms."
    },
    // Allergies
    allergies: {
        patterns: /allerg|allergic|anaphyl|eczema|itchy|itching/i, // removed hives/swelling so general rash catches them, or anaphylaxis catches severe
        response: "🏥 **Pediatric Guideline: Allergies**\n\n**Common childhood allergies:**\n• Food (milk, eggs, peanuts, tree nuts)\n• Environmental (pollen, dust mites, pet dander)\n• Skin reactions (eczema, contact dermatitis)\n\n**Mild reactions — Home care:**\n• Antihistamine (age-appropriate dose)\n• Cool compresses for skin irritation\n• Remove the allergen source\n\n🚨 **URGENT — Signs of anaphylaxis:**\n• Difficulty breathing or wheezing\n• Swelling of face/throat\n• Rapid heartbeat, dizziness\n→ **Use EpiPen if available and call 911 immediately**\n\nPlease book a consultation to discuss allergy testing."
    },
    // Ear infection
    earInfection: {
        patterns: /ear|earache|ear pain|pulling ear|ear infection/i,
        response: "🏥 **Pediatric Guideline: Ear Problems**\n\n**Signs of ear infection in children:**\n• Pulling or tugging at the ear\n• Fussiness, especially when lying down\n• Difficulty sleeping\n• Fluid draining from the ear\n• Fever\n• Balance problems\n\n**Home care while waiting for appointment:**\n• Warm compress against the ear\n• Keep child upright when possible\n• Age-appropriate pain relief\n\n📅 **Recommendation:** Book an appointment — most ear infections require examination and may need antibiotics."
    },
    // Cold/flu
    coldFlu: {
        patterns: /cold|flu|influenza|runny nose|stuffy|congestion|sore throat|sneezing/i,
        response: "🏥 **Pediatric Guideline: Cold & Flu**\n\n**Home care:**\n• Rest and plenty of fluids\n• Saline nasal drops for congestion\n• Honey for cough (only if >1 year old)\n• Cool-mist humidifier in the room\n• Age-appropriate fever reducers\n\n**When to see a doctor:**\n• Symptoms lasting more than 10 days\n• Fever above 104°F (40°C)\n• Difficulty breathing\n• Not drinking fluids\n• Ear pain\n• Symptoms that improve then suddenly worsen\n\n💡 **Prevention:** Annual flu vaccine is recommended for children 6 months and older."
    },
    // Growth/development
    growth: {
        patterns: /grow|height|weight|milestone|develop|crawl|walk|talk|speech|language|motor/i,
        response: "📊 **Pediatric Guideline: Growth & Development**\n\n**Key developmental milestones:**\n• **2 months:** Social smile, lifts head\n• **6 months:** Sits with support, babbles\n• **9 months:** Crawls, says 'mama/dada'\n• **12 months:** Walks with help, 1-2 words\n• **18 months:** Walks alone, 10+ words\n• **2 years:** Runs, 2-word phrases\n• **3 years:** Climbs, short sentences\n\n💡 **Tip:** Use our **Growth Tracker** on your dashboard to monitor your child's height and weight percentiles against WHO standards.\n\n⚠️ Every child develops at their own pace. Consult your pediatrician if you have concerns about delays."
    },
    // Breastfeeding
    breastfeeding: {
        patterns: /breastfeed|nursing|lactation|breast milk|formula|bottle|feeding|weaning/i,
        response: "🍼 **Pediatric Guideline: Infant Feeding**\n\n**0-6 months:** Exclusive breastmilk or formula\n• Feed on demand (every 2-3 hours)\n• Signs of good feeding: 6+ wet diapers/day\n\n**6-12 months:** Introduce solids gradually\n• Start with single-ingredient purees\n• Iron-rich foods first (cereals, pureed meat)\n• Continue breastmilk/formula\n\n**12+ months:** Transition to whole milk\n• 2-3 cups of whole milk per day\n• Offer variety of table foods\n\n⚠️ **Avoid before 1 year:** Honey, whole cow's milk, choking hazards (whole grapes, popcorn, nuts)"
    },
    // Vaccination
    vaccine: {
        patterns: /vaccin|immuniz|shot|jab|booster|mmr|dtap|polio/i,
        response: "💉 **Pediatric Vaccination Schedule**\n\n**Key vaccination ages:**\n• **Birth:** Hepatitis B (1st dose)\n• **2 months:** DTaP, IPV, Hib, PCV13, Rotavirus\n• **4 months:** DTaP, IPV, Hib, PCV13, Rotavirus\n• **6 months:** DTaP, Hib, PCV13, Influenza\n• **12-15 months:** MMR, Varicella, Hepatitis A\n• **4-6 years:** DTaP, IPV, MMR, Varicella boosters\n\n💡 **Track vaccines** using our Vaccination Tracker on your dashboard for personalized reminders.\n\n⚠️ **Side effects** like mild fever, fussiness, and soreness at injection site are normal and usually resolve in 1-2 days."
    },
    // Diaper/skin
    diaper: {
        patterns: /diaper|nappy|cream|lotion|dry skin|moistur/i, // removed skin/rash to not overlap with general rash
        response: "🏥 **Pediatric Guideline: Diaper Rash & Skin Care**\n\n**Prevention:**\n• Change diapers frequently\n• Use fragrance-free wipes\n• Apply barrier cream (zinc oxide) with each change\n• Allow air-dry time\n\n**Treatment:**\n• Apply thick layer of zinc oxide cream\n• Use warm water instead of wipes on inflamed skin\n• Avoid tight-fitting diapers\n\n⚠️ **See a doctor if:**\n• Rash doesn't improve in 3 days\n• Blisters or open sores appear\n• Rash spreads beyond diaper area\n• Signs of yeast infection (bright red with satellite spots)"
    },
    // Identity
    identity: {
        patterns: /who are you|what are you|what can you do|how do you work|what is this|your name/i,
        response: "I'm the **Pediatric Health Hub AI Assistant** 🤖\n\nI provide general pediatric health guidance based on established clinical guidelines. I can help with:\n• Symptom assessment & home care tips\n• Growth & development questions\n• Vaccination information\n• Nutrition guidance\n• Sleep & behavioral advice\n\n⚠️ **Important:** I'm not a licensed doctor. For specific diagnoses or prescriptions, please book an appointment with your pediatrician through the dashboard."
    },
    // Thank you
    thanks: {
        patterns: /thank you|thanks|thank|thx|appreciate|helpful/i,
        response: "You're welcome! 😊 I'm glad I could help. Remember, for any persistent symptoms or concerns, please don't hesitate to:\n\n• 📅 **Book an appointment** with your pediatrician\n• 📹 **Start a teleconsultation** for quick advice\n• 🚨 **Call 911** for any medical emergencies\n\nIs there anything else I can help with?"
    },
    // How did you do / capability
    capability: {
        patterns: /how did you|how do you do|what can|can you help|help me/i,
        response: "I'm here to provide pediatric health guidance! Here's how I can assist:\n\n🩺 **Symptom Guidance** — Describe your child's symptoms and I'll provide general advice\n📊 **Growth Tracking** — Questions about height, weight, and developmental milestones\n💉 **Vaccines** — Information about immunization schedules\n🍎 **Nutrition** — Feeding guidelines by age\n😴 **Sleep** — Age-appropriate sleep recommendations\n\nJust type your question and I'll do my best to help!"
    },
    // Goodbye
    goodbye: {
        patterns: /bye|goodbye|see you|take care|got it|okay thanks|that's all/i,
        response: "Take care! 👋 Remember:\n\n• 📅 Book regular checkups with your pediatrician\n• 💉 Keep vaccinations up to date\n• 📊 Track your child's growth on your dashboard\n• 🚨 Call 911 for any emergencies\n\nI'm always here if you have more questions. Stay healthy! 💙"
    }
};

const createSession = async (userId) => {
    const existing = await prisma.chatbotSession.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    if (existing) return existing;
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

    // 4. Knowledge Base Pattern Matching (intelligent responses)
    for (const [key, entry] of Object.entries(KNOWLEDGE_BASE)) {
        if (entry.patterns.test(messageText)) {
            return prisma.chatbotMessage.create({
                data: { sessionId, sender: 'AI', message: entry.response }
            });
        }
    }

    // 5. Moderation Hook Phase 2 (Database Template Match)
    const templates = await prisma.chatbotTemplate.findMany();
    for (const t of templates) {
        if (messageText.toLowerCase().includes(t.triggerKeyword.toLowerCase())) {
            return prisma.chatbotMessage.create({
                data: { sessionId, sender: 'AI', message: t.response }
            });
        }
    }

    // 6. Intelligent Fallback (context-aware)
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const fallbackResponse = `I appreciate your question! While I don't have a specific guideline for that topic, here's what I recommend:\n\n🩺 **General Advice:**\n• If your child has symptoms that concern you, it's always best to consult with your pediatrician\n• Use our **Teleconsultation** feature for a quick video call with a doctor\n• Check our **Health Education** section for curated articles\n\n💡 **Try asking me about:**\n• Common symptoms (fever, cough, rash, vomiting)\n• Nutrition & feeding guidelines\n• Vaccination schedules\n• Growth & developmental milestones\n• Sleep tips for children\n• Teething, allergies, ear infections\n\nHow else can I help you?`;

    return prisma.chatbotMessage.create({
        data: { sessionId, sender: 'AI', message: fallbackResponse }
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
