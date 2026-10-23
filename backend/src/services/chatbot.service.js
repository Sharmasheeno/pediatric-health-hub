const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMERGENCY_REGEX = /(?:choking|seizure|convulsing|unconscious|difficult to wake|hard to wake|not breathing|stopped breathing|(?:trouble|difficulty|struggling|hard|unable to|cannot|can't)\s+(?:to\s+)?breath(?:e|ing)|(?:breathing|breath)\s+(?:is\s+)?(?:difficult|very hard|laboured|labored)|blue lips|bleeding heavily|uncontrolled bleeding|bleeding that will not stop|coughing up blood|vomiting blood|swallowed (?:poison|a battery|a magnet|something toxic)|poison.{0,20}swallow|rash.{0,30}(?:does not|doesn't) fade|fever.{0,30}stiff neck|911|emergency)/i;

const EMERGENCY_RESPONSE = "🚨 **EMERGENCY WARNING** 🚨\nThe symptoms described may require immediate medical attention. Please stop chatting and contact your local emergency service or go to the nearest emergency facility now. I am an AI, not a doctor.";

// The assistant is rules-based, so route common Somali prompts to Somali
// guidance instead of an unrelated English fallback.
const SOMALI_LANGUAGE_REGEX = /\b(?:asc|asalaamu calaykum|ilmahayga|ilmahaygu|ilmaha|carruur|caruur|cunug|cunugga|cunuggayga|qandh\w*|xummad\w*|heerkul\w*|qufac\w*|tallaal\w*|nafaqo\w*|naasnuujin|matag\w*|shuban\w*|finan\w*|hurdo\w*|koritaan|dherer|miisaan|dhakhtar\w*|salaan|iska warran|maxaan sameeyaa|sidee loo|neef\w*|neefsasho|dhiig\w*)\b/i;
const SOMALI_EMERGENCY_REGEX = /(?:dhiig\s*bax|dhiig badan|neefsash(?:adu|ada|o)(?: way)? ku adag|neef qaadash(?:adu|ada) ku adag|(?:si dhib leh|ku dhibtoon|kari waay).*neefsan|neefsan(?:ayo|ayso).*(?:si dhib leh|ku adag)|neef la'aan|neefsan la'|ceejin|suuxdin|miyir la'aan|sumow|liqay sun|qoor adag|aan laga kicin|bushim(?:aha|o).*buluug|finan.{0,40}aan.*libdhin)/i;
const SOMALI_EMERGENCY_RESPONSE = "🚨 **DIGNIIN DEGDEG AH** 🚨\nCalaamadaha aad sheegtay waxay muujin karaan xaalad degdeg ah. Fadlan hadda wac adeegga gurmadka caafimaad ee deegaankaaga, ama u gee ilmaha xarunta gargaarka degdegga ah ee kuugu dhow. Ha sugin jawaab kale oo halkan ah. Kaaliyahani ma aha dhakhtar mana samayn karo ogaansho.";
const DEHYDRATION_WARNING_REGEX = /(?:no urine|not (?:urinating|peeing)|hasn't (?:urinated|peed)|has not (?:urinated|peed)|no wet nappies|no wet diapers|fewer wet (?:nappies|diapers)|very dry mouth|no tears|sunken eyes|kaadi\w*.{0,25}(?:yaraat|maqan|istaag|la'aan|joojin|ma iman|ma imaan)|xafaayad.{0,30}(?:qoyan.{0,10}(?:la'aan|maqan|yaraan)|aad u qalalan)|ilmo.{0,15}aan\s*kaadin)/i;
const DEHYDRATION_WARNING_EN = "⚠️ **Please contact a health professional urgently today.** Very little or no urine during vomiting or diarrhea can be a sign of dehydration in a child. Offer small, frequent sips of oral rehydration solution if the child is awake and able to swallow, and continue breastfeeding. Seek emergency care now if your child is difficult to wake, becomes very weak, or has trouble breathing. How old is your child, and when did they last urinate?";
const DEHYDRATION_WARNING_SO = "⚠️ **Fadlan maanta si degdeg ah ula xiriir xirfadle caafimaad.** Kaadi aad u yaraata ama istaagta marka matag ama shuban jiro waxay ilmaha ku noqon kartaa calaamad fuuqbax. Haddii ilmuhu soo jeedo oo wax liqi karo, sii kabashooyin yar-yar oo soo noqnoqda oo ORS ah, naasnuujintana sii wad. Haddii ay adag tahay in la kiciyo, uu aad u tabar-darroodo, ama neefsashadu ku adkaato, u gee gargaarka degdegga ah hadda. Ilmuhu imisa jir buu yahay, goormuuse ugu dambaysay kaadiyay?";

const extractAgeInMonths = (message, isSomali) => {
    const monthMatch = message.match(isSomali
        ? /\b(\d+)\s*(?:bilood|bil)\b/i
        : /\b(\d+)\s*-?\s*(?:months?|mos?|mo)\s*-?\s*(?:old)?\b/i);
    if (monthMatch) return Number(monthMatch[1]);

    const yearMatch = message.match(isSomali
        ? /\b(\d+)\s*(?:jir|sano)\b/i
        : /\b(\d+)\s*(?:-?\s*(?:years?|yrs?)\s*-?\s*old|\s*-\s*year\s*-\s*old)\b/i);
    return yearMatch ? Number(yearMatch[1]) * 12 : null;
};

const extractTemperatureC = message => {
    const celsius = message.match(/\b(\d{2}(?:[.,]\d)?)\s*°?\s*C\b/i);
    if (celsius) return Number(celsius[1].replace(',', '.'));
    const fahrenheit = message.match(/\b(\d{2,3}(?:[.,]\d)?)\s*°?\s*F\b/i);
    if (fahrenheit) return (Number(fahrenheit[1].replace(',', '.')) - 32) * 5 / 9;
    return null;
};

const extractSomaliDurationDays = message => {
    const numeric = message.match(/\b(\d+)\s*(?:maalin|maalmood)\b/i);
    if (numeric) return Number(numeric[1]);
    const somaliNumbers = { hal: 1, laba: 2, saddex: 3, afar: 4, shan: 5, lix: 6, toddoba: 7 };
    const written = message.match(/\b(hal|laba|saddex|afar|shan|lix|toddoba)\s*maalmood\b/i);
    return written ? somaliNumbers[written[1].toLowerCase()] : null;
};

const createSomaliCoughResponse = message => {
    const ageInMonths = extractAgeInMonths(message, true);
    const durationDays = extractSomaliDurationDays(message);
    const ageLabel = ageInMonths === null ? null : ageInMonths < 24
        ? `${ageInMonths} bilood jir`
        : `${Math.floor(ageInMonths / 12)} sano jir`;
    const durationLabel = durationDays === null ? null : `${durationDays} ${durationDays === 1 ? 'maalin' : 'maalmood'}`;
    const context = [ageLabel && `Da'da ilmahaagu waa ${ageLabel}.`, durationLabel && `Waxaad sheegtay in qufacu socday ${durationLabel}.`].filter(Boolean).join(' ');
    const detail = context ? `${context} ` : '';

    return `🤧 **Qufaca ilmaha**\n\nWaan fahmay in qufaca ilmahaagu walaac kugu abuuri karo. ${detail}Muddada qufaca oo keliya laguma go'aamin karo sababta ama darnaanta; waxaa muhiim ah in la ogaado sida ilmuhu u neefsanayo, inuu qandho leeyahay, inuu cabbayo, iyo inuu u baraarugsan yahay sidii caadiga ahayd.\n\nHaddii ilmuhu si caadi ah u neefsanayo oo cabbayo, sii cabitaan kuna dhiirrigeli nasasho. Ilmaha ka weyn hal sano, malab yar ayaa dejin kara cunaha; malab ha siin ilmaha ka yar hal sano.\n\n**Raadi gargaar degdeg ah** haddii neefsashadu ku adkaato, feeruhu gudaha u jiidmaan, bushimuhu buluug noqdaan, ama ay adag tahay in la kiciyo. Fadlan ii sheeg da'da ilmaha haddii aanad sheegin, iyo haddii qandho ama neefsasho dhib ahi jirto. Jawaabtani waa macluumaad guud, mana aha ogaansho.`;
};

const createSomaliFeverResponse = message => {
    const ageInMonths = extractAgeInMonths(message, true);
    const temperatureC = extractTemperatureC(message);
    const ageLabel = ageInMonths === null ? null : ageInMonths < 24
        ? `${ageInMonths} bilood jir`
        : `${Math.floor(ageInMonths / 12)} sano jir`;
    const temperatureLabel = temperatureC === null ? null : `${temperatureC.toLocaleString('en-US', { maximumFractionDigits: 1 })}°C`;

    if (ageInMonths !== null && temperatureC !== null) {
        if ((ageInMonths < 3 && temperatureC >= 38) || (ageInMonths >= 3 && ageInMonths < 6 && temperatureC >= 39)) {
            return `🚨 **Qiimeyn degdeg ah ayaa loo baahan yahay**\n\nWaxaad sheegtay in ilmuhu yahay ${ageLabel}, heerkulkiisuna yahay ${temperatureLabel}. Da'dan iyo heerkulkan awgood, fadlan hadda la xiriir xarun caafimaad ama adeegga gurmadka deegaankaaga. Ha sugin in qandhadu iskeed u degto.\n\nHaddii ilmuhu neefsashada ku dhibtoonayo, suuxayo, ama ay adag tahay in la kiciyo, u gee gargaarka degdegga ah isla markiiba. Jawaabtani ma beddelayso qiimeyn caafimaad.`;
        }

        if (ageInMonths >= 24 && temperatureC >= 38) {
            return `🌡️ **Qandho: talo ku salaysan xogta aad bixisay**\n\nWaxaad sheegtay in ilmahaagu yahay ${ageLabel} oo heerkulkiisu yahay ${temperatureLabel}. Heerkulkani waa qandho, laakiin keligiis ma caddeynayo in xaaladdu degdeg tahay. Haddii ilmuhu si caadi ah u neefsanayo, cabbayo, si fududna u baraarugayo, waxaad guriga ku siin kartaa cabitaan badan oo aad si joogto ah ula socon kartaa xaaladdiisa. U geli dhar raaxo leh; ha ku duubin dhar badan. Daawo qandho sii oo keliya haddii uu dhibsanayo, adigoo raacaya tilmaanta baakadka ama talada xirfadle caafimaad. Ha siin aspirin.\n\n**La xiriir dhakhtar:** haddii ilmuhu ka sii daro, qandhadu socoto in ka badan 3 maalmood, ama aad ka welwelsan tahay. **Raadi gargaar degdeg ah:** haddii neefsashadu ku adkaato, uu suuxo, ay adag tahay in la kiciyo, qoortu adkaato, ama finan guduud/madow ahi aanay libdhin marka la cadaadiyo.\n\nWaan fahamsanahay in qandhada ilmahaagu walaac kugu abuuri karto. Jawaabtani waa macluumaad guud, mana aha ogaansho.`;
        }
    }

    return `🌡️ **Qandho: tallaabada xigta**\n\nHeerkul 38°C ama ka badan badanaa waxaa loo tixgeliyaa qandho. Si aan xaaladda si ka habboon uga jawaabo, fadlan ii sheeg da'da ilmaha, heerkulka saxda ah iyo sida loo cabbiray, muddada qandhadu socotay, iyo haddii uu si caadi ah u neefsanayo, wax u cabbayo, una baraarugayo.\n\nInta ka horreysa, sii cabitaan ama naasnuujin, si joogto ah ula soco xaaladdiisa, hana siin aspirin. Ilmo ka yar 3 bilood oo heerkulkiisu yahay 38°C ama ka badan, ama ilmo 3 ilaa 6 bilood jir ah oo heerkulkiisu yahay 39°C ama ka badan, wuxuu u baahan yahay talo caafimaad oo degdeg ah. Neefsasho ku adag, suuxdin, qoorta oo adkaata, ama in ilmaha ay adag tahay in la kiciyo waxay u baahan yihiin gargaar degdeg ah.\n\nJawaabtani ma beddelayso qiimeyn uu sameeyo xirfadle caafimaad.`;
};

const createEnglishFeverResponse = message => {
    const ageInMonths = extractAgeInMonths(message, false);
    const temperatureC = extractTemperatureC(message);
    const ageLabel = ageInMonths === null ? null : ageInMonths < 24
        ? `${ageInMonths} ${ageInMonths === 1 ? 'month' : 'months'} old`
        : `${Math.floor(ageInMonths / 12)} ${Math.floor(ageInMonths / 12) === 1 ? 'year' : 'years'} old`;
    const temperatureLabel = temperatureC === null ? null : `${temperatureC.toLocaleString('en-US', { maximumFractionDigits: 1 })}°C`;

    if (ageInMonths !== null && temperatureC !== null) {
        if ((ageInMonths < 3 && temperatureC >= 38) || (ageInMonths >= 3 && ageInMonths < 6 && temperatureC >= 39)) {
            return `🚨 **Please seek urgent medical advice now**\n\nYou said your child is ${ageLabel} and has a temperature of ${temperatureLabel}. At this age and temperature, contact a clinician or local urgent medical service now. Do not wait for the fever to settle on its own.\n\nIf your child is struggling to breathe, has a seizure, or is difficult to wake, go to emergency care immediately. This guidance cannot replace an in-person assessment.`;
        }

        if (ageInMonths >= 24 && temperatureC >= 38) {
            return `🌡️ **Fever guidance for your child**\n\nYou said your child is ${ageLabel} and has a temperature of ${temperatureLabel}. This is a fever, but the temperature alone does not show that it is an emergency. If your child is breathing comfortably, drinking, and waking and responding normally, you can offer fluids and check on them regularly at home. Keep them comfortable and avoid wrapping them in too many clothes. Use a fever medicine only if they are uncomfortable, following the package directions or advice from a clinician or pharmacist. Do not give aspirin.\n\n**Contact a clinician** if your child gets worse, the fever lasts more than 3 days, or you are concerned. **Seek urgent care now** for trouble breathing, a seizure, difficulty waking, a stiff neck, or a rash that does not fade when pressed.\n\nI understand that your child's fever can be worrying. This is general information, not a diagnosis.`;
        }
    }

    return `🌡️ **Fever: what to do next**\n\nA temperature of 38°C (100.4°F) or higher is generally considered a fever. To tailor this guidance, please tell me your child's age, the measured temperature and how you took it, how long the fever has lasted, and whether your child is breathing, drinking, and waking normally.\n\nFor now, offer fluids and check on your child regularly. Do not give aspirin. A baby under 3 months with a temperature of 38°C or higher, or a baby aged 3 to 6 months with a temperature of 39°C or higher, needs urgent medical advice. Trouble breathing, a seizure, a stiff neck, or difficulty waking needs immediate medical attention.\n\nThis guidance cannot replace assessment by a health professional.`;
};

const SOMALI_KNOWLEDGE_BASE = [
    {
        patterns: /^(salaan|asc|assalaamu calaykum|asalaamu calaykum|iska warran|subax wanaagsan|galab wanaagsan)\b/i,
        response: "Ku soo dhawoow. Waxaan ahay Kaaliyaha Caafimaadka Carruurta. Waxaan ku siin karaa macluumaad guud oo ku saabsan caafimaadka carruurta. Fadlan sheeg da'da ilmaha, calaamadda ama su'aasha aad qabto, iyo muddada ay xaaladdu jirtay."
    },
    {
        patterns: /qandho|xummad|heerkul/i,
        response: "🌡️ **Qandhada ilmaha**\n\nFadlan sheeg da'da ilmaha, heerkulka la cabbiray, iyo muddada qandhadu socotay si aan jawaabta ugu waafajiyo xaaladdiisa."
    },
    {
        patterns: /qufac|xiiq|hargab.*qufac/i,
        response: "🤧 **Qufaca ilmaha**\n\nSii ilmaha cabitaan ku filan, kuna dhiirrigeli inuu nasto. Ilmaha ka weyn hal sano, malab yar ayaa dejin kara cunaha; malab ha siin ilmaha ka yar hal sano.\n\n**Raadi gargaar degdeg ah** haddii neefsashadu ku adkaato, feeruhu gudaha u jiidmaan, bushimuhu buluug noqdaan, ama ilmuhu aad u tabar darnaado. La xiriir xirfadle caafimaad haddii qufacu sii xumaado ama aad ka welwelsan tahay. Si aan talo kuu khusaysa u bixiyo, sheeg da'da ilmaha, muddada qufaca, iyo haddii uu qandho leeyahay."
    },
    {
        patterns: /matag|shuban|calool xanuun|calool.*wareer/i,
        response: "🤢 **Matag iyo shuban**\n\nMatagga iyo shubanku waxay keeni karaan fuuqbax. Sii ilmaha dareeraha fuuq-celinta afka (ORS) kabashooyin yar-yar oo soo noqnoqda, haddii uu awoodo inuu cabbo. Sii wad naasnuujinta ama caanaha caadiga ah.\n\n**La xiriir xirfadle caafimaad** haddii ilmuhu cabitaanka hayn kari waayo, kaadidu yaraato, afku qalalo, dhiig saxarada ama matagga ku jiro, ama mataggu cagaar yahay. **Raadi gargaar degdeg ah** haddii ay adag tahay in la kiciyo. Fadlan sheeg da'da ilmaha iyo muddada calaamaduhu socdeen si jawaabta loo waafajiyo xaaladdiisa."
    },
    {
        patterns: /finan|cuncun|maqaarka/i,
        response: "🔴 **Finanka maqaarka**\n\nFinanku sababo kala duwan ayay yeelan karaan, mana suurtagasho in sababtooda lagu go'aamiyo qoraal keliya. Ka fogow waxyaabaha cusub ee maqaarka kicin kara, hana xoqin finanka.\n\n**Raadi gargaar degdeg ah** haddii finanku yihiin guduud ama madow oo aan libdhin marka la cadaadiyo, ama ay la socdaan neefsasho ku adag, barar wejiga ama carrabka ah, qandho, ama xaalad guud oo aad u liidata. Fadlan sheeg meesha finanku ka soo baxeen, muddada ay jireen, iyo haddii qandho ama cuncun jiro."
    },
    {
        patterns: /tallaal|tallaalka|tallaalada|tallaallo/i,
        response: "💉 **Tallaalka ilmaha**\n\nJadwalka tallaalku wuxuu ku xiran yahay da'da ilmaha iyo barnaamijka tallaalka ee dalkaaga. Ka eeg buugga tallaalka ama la xiriir xarunta caafimaadka si aad u xaqiijiso tallaalka xiga iyo taariikhdiisa.\n\nQandho fudud ama xanuun meesha cirbadda laga duray way dhici karaan. Haddii neefsashadu ku adkaato ama wejiga/carrabku bararo tallaalka ka dib, raadi gargaar degdeg ah. Haddii aad ii sheegto da'da ilmaha iyo tallaalka aad ka hadlayso, waxaan ku siin karaa macluumaad guud oo ka sii habboon."
    },
    {
        patterns: /nafaqo|cunto|quudin|naasnuujin|naas nuujin|caanaha/i,
        response: "🍎 **Nafaqada iyo quudinta**\n\nBaahida nafaqadu waxay ku xiran tahay da'da iyo xaaladda ilmaha. Guud ahaan, naasnuujinta ama caanaha carruurta ayaa ah cuntada ugu weyn lixda bilood ee ugu horreeya. Cuntooyin dhammaystir ah ayaa si tartiib ah loo bilaabi karaa qiyaastii lix bilood, iyadoo naasnuujinta ama caanaha carruurta la sii wado. Ha siin malab ilmaha ka yar hal sano.\n\nFadlan sheeg da'da ilmaha iyo waxa aad ka walaacsan tahay—tusaale ahaan cunto diid, quudin, ama miisaan—si aan jawaabta ugu waafajiyo su'aashaada. La xiriir xirfadle caafimaad haddii ilmuhu si liidata u quuto ama miisaankiisu kordhi waayo."
    },
    {
        patterns: /koritaan|dherer|miisaan|horumar|socod|hadal/i,
        response: "📊 **Koritaanka iyo horumarka ilmaha**\n\nCarruurtu isku xawaare kuma koraan. Dhererka iyo miisaanka waxaa ugu habboon in lagu qiimeeyo booqashooyinka caafimaadka, iyadoo la adeegsanayo jaantuska koritaanka iyo talada xirfadle caafimaad.\n\nFadlan sheeg da'da ilmaha iyo horumarka gaarka ah ee aad ka walaacsan tahay. Haddii ilmuhu lumiyo xirfad uu hore u lahaa, kala hadal dhakhtarka carruurta sida ugu dhakhsaha badan."
    },
    {
        patterns: /hurdo|seexan|seexasho/i,
        response: "😴 **Hurdada ilmaha**\n\nJadwal hurdo oo joogto ah iyo jawi deggan ayaa caawin kara. Dhallaanka, mar kasta u seexi dhabarka sariir adag oo siman; sariirta ha dhigin barkimo, bustayaal dabacsan, ama alaab kale oo dabooli karta wejiga.\n\nFadlan sheeg da'da ilmaha iyo dhibaatada hurdada si taladu ugu habboonaato. Haddii hurdadu la socoto neefsasho dhib leh ama ilmuhu aad u xanuunsan yahay, la xiriir xarun caafimaad."
    },
    {
        patterns: /dhakhtar|maxaan sameeyaa|talo guud|caawi/i,
        response: "Waxaan ku siin karaa macluumaad caafimaad oo guud, balse kama samayn karo ogaansho mana qori karo daawo. Fadlan sheeg calaamadda aad aragtay, da'da ilmaha, goorta ay bilaabatay, iyo waxa aad rabto inaad ogaato. Haddii xaaladdu degdeg tahay ama ilmuhu aad u xanuunsan yahay, la xiriir xarun caafimaad."
    }
];

const SOMALI_FALLBACK_RESPONSE = "Waan fahmay su'aashaada, balse ma hayo macluumaad la isku halayn karo oo igu filan oo aan si badbaado leh uga jawaabo arrintan. Fadlan sheeg da'da ilmaha iyo calaamadda ama arrinta gaarka ah ee aad ka welwelsan tahay; markaas waxaan isku dayi doonaa inaan bixiyo macluumaad guud oo si toos ah ugu habboon su'aashaada. Ma samayn karo ogaansho ama ma qori karo daawo. Haddii ilmuhu neefsashada ku dhibtoonayo, ay adag tahay in la kiciyo, ama xaaladdiisu si degdeg ah uga sii darayso, hadda raadi gargaar caafimaad.";

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
        response: "🌡️ **Pediatric Guideline: Fever**\n\nA temperature of 38°C (100.4°F) or higher is generally considered a fever. It is often part of the body's response to an infection.\n\n**Home care:**\n• Offer frequent fluids and dress your child comfortably in light clothing.\n• Do not give aspirin. Use fever medicine only at the dose recommended for your child's age and weight by a clinician or pharmacist.\n\n🚨 **Seek urgent medical advice:**\n• A baby **under 3 months** with a temperature of 38°C (100.4°F) or higher.\n• A baby **3 to 6 months** with a temperature of 39°C (102.2°F) or higher.\n• Any child who is difficult to wake, has trouble breathing, has a seizure or stiff neck, or is getting worse.\n• For a child **2 years or older**, contact a clinician if the fever lasts more than 3 days."
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
            response: "🏥 **Pediatric Guideline: Allergies**\n\n**Common childhood allergies:**\n• Food (milk, eggs, peanuts, tree nuts)\n• Environmental (pollen, dust mites, pet dander)\n• Skin reactions (eczema, contact dermatitis)\n\n**Mild reactions — Home care:**\n• Antihistamine (age-appropriate dose)\n• Cool compresses for skin irritation\n• Remove the allergen source\n\n🚨 **URGENT — Signs of anaphylaxis:**\n• Difficulty breathing or wheezing\n• Swelling of face/throat\n• Rapid heartbeat, dizziness\n→ **Use an epinephrine auto-injector if available and contact local emergency services immediately**\n\nPlease book a consultation to discuss allergy testing."
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
        response: "You're welcome! 😊 I'm glad I could help. For persistent symptoms or concerns, you can:\n\n• 📅 **Book an appointment** with your pediatrician\n• 📹 **Start a teleconsultation** for quick advice\n• 🚨 **Contact local emergency services** for a medical emergency\n\nIs there anything else I can help with?"
    },
    // How did you do / capability
    capability: {
        patterns: /how did you|how do you do|what can|can you help|help me/i,
        response: "I'm here to provide pediatric health guidance! Here's how I can assist:\n\n🩺 **Symptom Guidance** — Describe your child's symptoms and I'll provide general advice\n📊 **Growth Tracking** — Questions about height, weight, and developmental milestones\n💉 **Vaccines** — Information about immunization schedules\n🍎 **Nutrition** — Feeding guidelines by age\n😴 **Sleep** — Age-appropriate sleep recommendations\n\nJust type your question and I'll do my best to help!"
    },
    // Goodbye
    goodbye: {
        patterns: /bye|goodbye|see you|take care|got it|okay thanks|that's all/i,
        response: "Take care! 👋 Remember:\n\n• 📅 Book regular checkups with your pediatrician\n• 💉 Keep vaccinations up to date\n• 📊 Track your child's growth on your dashboard\n• 🚨 Contact local emergency services for an emergency\n\nI'm always here if you have more questions. Stay healthy! 💙"
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

const processMessage = async (sessionId, userId, messageText, preferredLanguage) => {
    // 1. Ownership & Identity validation
    const session = await prisma.chatbotSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw Object.assign(new Error("Unauthorized"), { statusCode: 403 });

    // 2. Transact User Matrix
    await prisma.chatbotMessage.create({
        data: { sessionId, sender: 'USER', message: messageText }
    });

    // Route Somali prompts to Somali intents so they never receive the English
    // generic fallback when the user asks a common child-health question.
    const isSomali = preferredLanguage ? preferredLanguage === 'so' : SOMALI_LANGUAGE_REGEX.test(messageText);

    // Check urgent symptoms before the topic matcher. Mixed Somali/English
    // messages should receive the same safety guidance as either language.
    if (EMERGENCY_REGEX.test(messageText) || SOMALI_EMERGENCY_REGEX.test(messageText)) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: isSomali ? SOMALI_EMERGENCY_RESPONSE : EMERGENCY_RESPONSE }
        });
    }

    if (DEHYDRATION_WARNING_REGEX.test(messageText)) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: isSomali ? DEHYDRATION_WARNING_SO : DEHYDRATION_WARNING_EN }
        });
    }

    if (isSomali) {
        const response =
            /qandh\w*|xummad\w*|heerkul\w*/i.test(messageText)
                ? createSomaliFeverResponse(messageText)
                : /qufac|xiiq|hargab.*qufac/i.test(messageText)
                    ? createSomaliCoughResponse(messageText)
                    : SOMALI_KNOWLEDGE_BASE.find(entry => entry.patterns.test(messageText))?.response
                        || SOMALI_FALLBACK_RESPONSE;
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: response }
        });
    }

    // 3. Moderation Hook Phase 1 (Life-Threatening Traversal)
    if (/fever|high temperature|temperature/i.test(messageText)) {
        return prisma.chatbotMessage.create({
            data: { sessionId, sender: 'AI', message: createEnglishFeverResponse(messageText) }
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
    const templates = await prisma.chatbotTemplate.findMany({
        where: { language: isSomali ? 'so' : 'en', isClinicallyReviewed: true }
    });
    for (const t of templates) {
        const keywords = t.triggerKeyword.split(',').map(keyword => keyword.trim().toLowerCase()).filter(Boolean);
        if (keywords.some(keyword => messageText.toLowerCase().includes(keyword))) {
            return prisma.chatbotMessage.create({
                data: { sessionId, sender: 'AI', message: t.response }
            });
        }
    }

    // 6. Intelligent Fallback (context-aware)
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const fallbackResponse = `I understand what you're asking. I don't have enough reliable information about this topic to answer safely. If this is about your child, tell me their age and the specific symptom or concern, and I'll try to give relevant general guidance. I can't diagnose or prescribe treatment. If your child is struggling to breathe, is difficult to wake, or is getting worse quickly, seek urgent medical care now.`;

    return prisma.chatbotMessage.create({
        data: { sessionId, sender: 'AI', message: fallbackResponse }
    });
};

const upsertTemplate = async ({ triggerKeyword, response, language = 'en', sourceUrl = null, reviewerName = null, isClinicallyReviewed = false }) => {
    return prisma.chatbotTemplate.upsert({
        where: { language_triggerKeyword: { language, triggerKeyword } },
        update: {
            response,
            sourceUrl,
            reviewerName,
            isClinicallyReviewed,
            reviewedAt: isClinicallyReviewed ? new Date() : null
        },
        create: {
            triggerKeyword,
            response,
            language,
            sourceUrl,
            reviewerName,
            isClinicallyReviewed,
            reviewedAt: isClinicallyReviewed ? new Date() : null
        }
    });
};

const getTemplates = async () => prisma.chatbotTemplate.findMany({ orderBy: [{ language: 'asc' }, { updatedAt: 'desc' }] });
const updateTemplate = async (id, { response, language, triggerKeyword, sourceUrl = null, reviewerName = null, isClinicallyReviewed = false }) => prisma.chatbotTemplate.update({
    where: { id },
    data: {
        response,
        language,
        triggerKeyword,
        sourceUrl,
        reviewerName,
        isClinicallyReviewed,
        reviewedAt: isClinicallyReviewed ? new Date() : null
    }
});
const deleteTemplate = async id => prisma.chatbotTemplate.delete({ where: { id } });

module.exports = { createSession, getSessionMessages, processMessage, upsertTemplate, updateTemplate, getTemplates, deleteTemplate };
