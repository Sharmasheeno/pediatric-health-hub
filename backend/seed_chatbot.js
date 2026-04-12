const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const templates = [
    {
        triggerKeyword: "fever",
        response: "🏥 **Pediatric Guideline: Fever**\nA fever is a sign the body is fighting an infection. Ensure they are hydrated and resting. \n• If your child is under 3 months: Any fever is an emergency.\n• Over 3 months: Treat with appropriate dosage of Acetaminophen (or Ibuprofen if >6mo).\n• **Monitor:** If fever persists over 3 days, or is accompanied by lethargy, please book a consultation."
    },
    {
        triggerKeyword: "temperature",
        response: "🏥 **Pediatric Guideline: High Temperature**\nA fever is a sign the body is fighting an infection. Ensure they are hydrated and resting. \n• If your child is under 3 months: Any fever is an emergency.\n• Over 3 months: Treat with appropriate dosage of Acetaminophen (or Ibuprofen if >6mo).\n• **Monitor:** If fever persists over 3 days, or is accompanied by lethargy, please book a consultation."
    },
    {
        triggerKeyword: "rash",
        response: "🏥 **Pediatric Guideline: Rashes**\nRashes have many causes (viral, allergic, heat). \n• **Non-urgent:** Light pink, blanching (disappears when pressed), no fever.\n• **Urgent:** Non-blanching (petechiae), accompanied by fever, spreading rapidly, or causing severe itching.\n• Please schedule a teleconsultation to have the rash visually inspected."
    },
    {
        triggerKeyword: "cough",
        response: "🏥 **Pediatric Guideline: Coughing**\nCoughing is a protective reflex. \n• **Home Care:** Honey (only if >1 year old!), a cool-mist humidifier, and plenty of fluids.\n• **When to worry:** Fast breathing, wheezing, structural chest indrawing, or a 'barking' seal-like cough (croup).\n• **Note:** Over-the-counter cough medicines are not recommended for children under 6."
    },
    {
        triggerKeyword: "vomit",
        response: "🏥 **Pediatric Guideline: Vomiting/Nausea**\nThe highest risk with vomiting is dehydration. \n• **Action:** Wait 30-60 mins after vomiting, then offer small, frequent sips of Oral Rehydration Solution (Pedialyte). Avoid plain water or juice initially.\n• **Urgent:** If there is blood, green bile, inability to keep liquids down for 12 hours, or signs of severe dehydration (no tears, dry mouth)."
    },
    {
        triggerKeyword: "diarrhea",
        response: "🏥 **Pediatric Guideline: Diarrhea**\nLike vomiting, diarrhea causes fluid loss. \n• Maintain hydration with Oral Rehydration Salts.\n• Continue a normal, age-appropriate diet (avoid extremely sugary or fatty foods).\n• **Consult Doctor if:** You see black/bloody stools, signs of dehydration, or if it lasts longer than 3-4 days."
    },
    {
        triggerKeyword: "sleep",
        response: "🏥 **Pediatric Guideline: Sleep Disruptions**\nNewborns sleep 14-17 hours; toddlers 11-14 hours. \n• Ensure a consistent bedtime routine.\n• Avoid screens 1 hour before bed.\n• If sudden sleep regressions are accompanied by pulling at ears, fever, or excessive irritability, it may indicate a minor infection. Consider scheduling a checkup."
    },
    {
        triggerKeyword: "crying",
        response: "🏥 **Pediatric Guideline: Excessive Crying**\n• Check the basics: Hungry, wet, tired, hot/cold?\n• **Colic:** Rule of 3s (crying >3 hours/day, >3 days/week, in an infant under 3 months).\n• **Red Flags:** A high-pitched, inconsolable cry entirely atypical for your infant requires medical evaluation."
    },
    {
        triggerKeyword: "nutrition",
        response: "🏥 **Pediatric Guideline: Diet & Nutrition**\n• Under 6 months: Exclusive breastmilk or formula.\n• Over 6 months: Introduce solids one at a time. Emphasize iron-rich foods.\n• Avoid whole cow's milk and honey before 1 year of age.\n• If you are concerned about growth percentiles, please review the Growth Tracker on your dashboard."
    }
];

async function seedChatbot() {
    console.log("Seeding Pediatric AI Chatbot templates...");
    
    for (const t of templates) {
        await prisma.chatbotTemplate.upsert({
            where: { triggerKeyword: t.triggerKeyword },
            update: { response: t.response },
            create: { triggerKeyword: t.triggerKeyword, response: t.response }
        });
        console.log(`Seeded: [${t.triggerKeyword}]`);
    }

    console.log("AI Chatbot successfully seeded.");
}

seedChatbot()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
