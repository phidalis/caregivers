/**
 * Mercy Senior Solutions — "Talk to a Senior Officer" AI Chat Widget
 * Include on every page:  <script src="senior-officer-chat.js"></script>
 *
 * Works exactly like the Ani Braids widget: fully self-contained (injects its
 * own styles + markup), loads its AI provider + API keys + knowledge base from
 * Firestore on every page load, and calls the AI provider directly from the
 * browser — no backend server needed.
 *
 * Supported providers: Gemini, OpenAI, Claude (Anthropic), Groq
 * Active provider + keys are managed in senior-officer-admin.html.
 *
 * Flow:
 *  1. User message → search local knowledge base (KB_ENTRIES)
 *  2. If confidence >= threshold → answer from KB  (no API call)
 *  3. If not → call active AI provider's API
 * Q/A pairs are logged to Firestore (aiChatLogs) for the admin panel.
 */

(function () {
  /* ─────────────────────────────────────────────
     FIRESTORE — Mercy Senior Solutions project
  ───────────────────────────────────────────────*/
  const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyAJokepO6XMuekfmiulWW1-kq13jxX5AQI",
    authDomain:        "caregivers-6fd93.firebaseapp.com",
    databaseURL:       "https://caregivers-6fd93.firebaseio.com",
    projectId:         "caregivers-6fd93",
    storageBucket:     "caregivers-6fd93.firebasestorage.app",
    messagingSenderId: "341618979293",
    appId:             "1:341618979293:web:d078675abd7412aaf10634",
    measurementId:     "G-BTSSHKGG25",
  };

  const CONTACT = {
    phone:  '(341) 618-9792',
    email:  'info@mercyseniorsolutions.com',
  };

  /* ─────────────────────────────────────────────
     CONFIG  (overridden by Firestore on load)
  ───────────────────────────────────────────────*/
  const CONFIG = {
    aiProvider:   'gemini',
    botName:      'Senior Officer',

    geminiKey:    '',
    geminiModel:  'gemini-2.0-flash',

    openaiKey:    '',
    openaiModel:  'gpt-4o-mini',

    claudeKey:    '',
    claudeModel:  'claude-haiku-4-5-20251001',

    groqKey:      '',
    groqModel:    'llama-3.3-70b-versatile',

    systemPrompt: `You are the Senior Officer virtual assistant for Mercy Senior Solutions, a compassionate senior care placement and consulting company based in California (serving families since 2020).
You help families and caregivers with questions about senior placement (assisted living, memory care, independent living, skilled nursing, adult family homes, respite care), caregiver services, healthcare provider consulting, and scheduling a free consultation.
Keep answers warm, concise, and professional. Use emojis sparingly.
IMPORTANT: When the visitor's message includes "knowledge base" context, answer using ONLY that provided context. Rephrase it naturally to match how they asked — do not add, invent, or assume extra facts.
If asked something you don't know, politely say you'll pass it to the team and suggest calling ${CONTACT.phone} or emailing ${CONTACT.email}.
Never give medical, legal, or financial advice — recommend speaking with a licensed professional instead. Never claim to be a human; if asked, say you're the Senior Officer virtual assistant.`,

    kbThreshold:  0.35,
    maxHistory:   10,
    enabled:      true,
  };

  /* ─────────────────────────────────────────────
     KNOWLEDGE BASE  (built-in presets)
     Custom entries from Firestore are prepended at load time
  ───────────────────────────────────────────────*/
  let KB_ENTRIES = [
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'helo', 'hii', 'start'],
      answer: '👋 Welcome to **Mercy Senior Solutions**! I\'m your Senior Officer assistant. I can help you with:\n- 🏠 Senior placement (assisted living, memory care, skilled nursing)\n- 💚 Caregiver services\n- 🩺 Healthcare provider consulting\n- 📅 Scheduling a free consultation\n\nWhat can I help you with today?'
    },
    {
      keywords: ['service', 'services', 'offer', 'offerings', 'what do you do', 'help with', 'care options', 'types of care'],
      answer: '🏠 Mercy Senior Solutions helps families find the right senior care, including:\n- **Senior placement** — assisted living, memory care, independent living, skilled nursing, adult family homes, respite care\n- **Caregiver services** — vetted, compassionate in-home caregivers\n- **Healthcare consulting** — support for providers & facilities\n\nWe also offer a **free consultation** to guide you through the options. Call ' + CONTACT.phone + ' to get started!'
    },
    {
      keywords: ['placement', 'senior placement', 'assisted living', 'memory care', 'independent living', 'skilled nursing', 'adult family home', 'respite care', 'find a facility', 'nursing home'],
      answer: '🏠 We specialize in **senior placement** — matching your loved one with the right assisted living, memory care, independent living, or skilled nursing community. We consider care needs, budget, location, and personality to shortlist the best options — at **no cost to families**. Start with a free consultation by calling ' + CONTACT.phone + '.'
    },
    {
      keywords: ['memory care', 'dementia', 'alzheimer', 'alzheimers', 'alzheimer\'s', 'confusion', 'wandering'],
      answer: '🧠 **Memory care** communities provide specialized support for those living with Alzheimer\'s, dementia, and other cognitive conditions — secure environments with trained staff and structured daily routines. We can help you find a memory care community that fits your loved one\'s needs. Call ' + CONTACT.phone + ' for a free consultation.'
    },
    {
      keywords: ['caregiver', 'caregiver services', 'home care', 'in-home care', 'in home', 'hire caregiver', 'private caregiver', 'companion', 'home health'],
      answer: '💚 Our **caregiver services** connect families with vetted, compassionate caregivers for in-home support — daily living assistance, companionship, medication reminders, and more. We help match the right caregiver to your loved one\'s needs and routine. Call ' + CONTACT.phone + ' to discuss your situation.'
    },
    {
      keywords: ['consulting', 'healthcare consulting', 'consultant', 'providers', 'provider network', 'facility consulting', 'business consulting', 'partner with'],
      answer: '🩺 Our **healthcare consulting** services support providers, facilities, and agencies with senior-care operations, placement partnerships, and growth strategies. If you\'re a provider or facility looking to partner with Mercy Senior Solutions, reach out at ' + CONTACT.email + ' or call ' + CONTACT.phone + '.'
    },
    {
      keywords: ['cost', 'price', 'pricing', 'how much', 'fee', 'charge', 'expensive', 'rates', 'afford', 'budget'],
      answer: '💰 Senior care costs vary widely depending on the type of care, location, and level of support needed. The good news: our **placement services are free for families** — the communities pay us. For caregiver services and consulting, we\'ll give you clear pricing based on your needs. Call ' + CONTACT.phone + ' for a free, no-obligation consultation.'
    },
    {
      keywords: ['insurance', 'medicare', 'medicaid', 'covered', 'coverage', 'medicare/medicaid', 'pay', 'paying'],
      answer: '📋 Coverage depends on the care type and community:\n- **Medicare** — covers short-term skilled nursing & rehab stays\n- **Medicaid** — may cover long-term care at qualifying communities\n- **Long-term care insurance** & private pay — vary by policy and facility\n\nWe help you understand which communities accept your coverage. Call ' + CONTACT.phone + ' and we\'ll walk you through it.'
    },
    {
      keywords: ['book', 'booking', 'schedule', 'appointment', 'consultation', 'free consult', 'call me', 'set up', 'speak to', 'talk to a'],
      answer: '📅 We\'d love to help! To schedule a **free consultation**, simply call ' + CONTACT.phone + ' or use the **Contact form** on our site and a Senior Officer will follow up with you. Tell us a little about your loved one\'s needs and we\'ll take it from there.'
    },
    {
      keywords: ['location', 'address', 'where are you', 'based', 'serve', 'serving', 'cities', 'areas', 'find', 'near me', 'california', 'state'],
      answer: '📍 Mercy Senior Solutions is **based in California** and serves families and facilities throughout the state. Because we\'re a placement & consulting company (not a single facility), we help you find communities in the locations that work best for you. Call ' + CONTACT.phone + ' and we\'ll point you in the right direction.'
    },
    {
      keywords: ['contact', 'email', 'phone', 'call', 'reach', 'message', 'get in touch', 'talk'],
      answer: '📞 You can reach us at:\n- **Phone:** ' + CONTACT.phone + '\n- **Email:** ' + CONTACT.email + '\n- **Contact page:** [Send a message](contact.html)\n\nWe respond within 24 hours on business days.'
    },
    {
      keywords: ['hours', 'open', 'opening', 'close', 'closing', 'time', 'when are you', 'business hours'],
      answer: '🕐 Our Senior Officers are available during regular business hours, and you can always leave a message through the **Contact form** — we\'ll follow up on the next business day. For urgent matters, call ' + CONTACT.phone + ' directly.'
    },
    {
      keywords: ['emergency', 'urgent', 'crisis', 'asap', 'right away', 'immediately', 'emergency care'],
      answer: '⚠️ If this is a **medical emergency**, please call 911 or go to your nearest emergency room right away. For urgent placement or care needs, call our office at ' + CONTACT.phone + ' and a Senior Officer will help you as quickly as possible.'
    },
    {
      keywords: ['careers', 'career', 'job', 'jobs', 'employment', 'hiring', 'work for', 'apply', 'position', 'open role'],
      answer: '💼 Thank you for your interest in joining Mercy Senior Solutions! Visit our [Careers page](careers.html) to see current openings and submit an application — or email your resume to ' + CONTACT.email + '.'
    },
    {
      keywords: ['provider', 'providers', 'join our network', 'partner', 'facility', 'community partner', 'refer clients'],
      answer: '🤝 Are you a care provider or facility? We partner with communities and agencies across California to connect families with quality care. Visit our [Providers page](providers.html) or email ' + CONTACT.email + ' to start the conversation.'
    },
    {
      keywords: ['review', 'testimonial', 'feedback', 'rating', 'experience', 'referral', 'refer'],
      answer: '⭐ We\'d love your feedback! Read what families say on our [Testimonials page](testimonials.html), and if you know someone who could use our help, we\'d be honored to assist them too. You can also use our **referral program** from your portal — thank you for your trust!'
    },
    {
      keywords: ['resources', 'guides', 'blog', 'articles', 'tips', 'learn', 'educational'],
      answer: '📚 We\'ve put together helpful guides and resources for families and caregivers — from planning senior care to understanding care levels. Browse our [Resources page](resources.html) for tips and tools to help you make confident decisions.'
    },
    {
      keywords: ['real person', 'human', 'are you a bot', 'are you real', 'who are you', 'your name', 'ai', 'robot'],
      answer: '🤖 I\'m the **Senior Officer virtual assistant** for Mercy Senior Solutions — an AI designed to help you quickly. When you\'re ready to talk with a real person, just call ' + CONTACT.phone + ' and a human Senior Officer will be happy to help.'
    },
    {
      keywords: ['privacy', 'confidential', 'personal info', 'secure', 'private', 'data', 'share my info'],
      answer: '🔒 Your privacy matters to us. Any information you share is treated confidentially and used only to help you find the right care. We never sell your personal information. If you have specific questions, email ' + CONTACT.email + '.'
    },
    {
      keywords: ['thank', 'thanks', 'thank you', 'thx', 'appreciate', 'great help', 'awesome'],
      answer: '😊 You\'re so welcome! It\'s our pleasure to help. If you have any more questions, I\'m always here — and don\'t forget, a free consultation is just a call away at ' + CONTACT.phone + '.'
    },
  ];

  /* ─────────────────────────────────────────────
     STYLES
  ───────────────────────────────────────────────*/
  const css = `
    #soc-chat-btn {
      position: fixed; bottom: 24px; right: 22px; z-index: 100001;
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg, #081B3A, #16315F);
      border: 2px solid #D4A33A; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 24px;
      box-shadow: 0 6px 24px rgba(8,27,58,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #soc-chat-btn:hover { transform: scale(1.07) translateY(-2px); box-shadow: 0 10px 30px rgba(212,163,58,0.45); }
    #soc-chat-btn .soc-notif {
      position: absolute; top: 4px; right: 4px;
      width: 13px; height: 13px; border-radius: 50%;
      background: #D4A33A; border: 2px solid #fff;
      display: none;
    }
    #soc-chat-window {
      position: fixed; bottom: 96px; right: 22px; z-index: 100001;
      width: 360px; max-width: calc(100vw - 40px);
      background: #fff; border-radius: 18px;
      box-shadow: 0 14px 50px rgba(8,27,58,0.25);
      border: 1px solid #e4e7ee;
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.9) translateY(20px); opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s;
      max-height: 82vh;
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    }
    #soc-chat-window.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }
    .soc-chat-header {
      background: linear-gradient(135deg, #081B3A, #16315F);
      padding: 15px 16px; display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .soc-chat-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: #D4A33A; color: #081B3A;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; flex-shrink: 0;
    }
    .soc-chat-header-info { flex: 1; min-width: 0; }
    .soc-chat-header-info strong { display: block; color: #fff; font-size: 14px; font-weight: 600; }
    .soc-chat-header-info span { color: rgba(255,255,255,0.75); font-size: 11.5px; }
    .soc-chat-close {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.8); font-size: 20px; padding: 4px;
      transition: color 0.15s; line-height: 1;
    }
    .soc-chat-close:hover { color: #fff; }
    .soc-chat-body {
      flex: 1; overflow-y: auto; padding: 14px 14px 8px;
      display: flex; flex-direction: column; gap: 12px;
      background: #F4F6FB;
      scroll-behavior: smooth;
    }
    .soc-chat-body::-webkit-scrollbar { width: 4px; }
    .soc-chat-body::-webkit-scrollbar-thumb { background: #c9d1e0; border-radius: 4px; }
    .soc-msg { display: flex; gap: 8px; align-items: flex-end; }
    .soc-msg.user { flex-direction: row-reverse; }
    .soc-msg-bubble {
      max-width: 80%; padding: 10px 14px; border-radius: 16px;
      font-size: 13.5px; line-height: 1.55; word-break: break-word;
    }
    .soc-msg.bot .soc-msg-bubble {
      background: #fff; color: #233047;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(8,27,58,0.10);
    }
    .soc-msg.user .soc-msg-bubble {
      background: linear-gradient(135deg, #081B3A, #16315F);
      color: #fff; border-bottom-right-radius: 4px;
    }
    .soc-msg-bubble a { color: #16315F; font-weight: 500; }
    .soc-msg.user .soc-msg-bubble a { color: #ffe9b0; }
    .soc-msg-bubble strong { font-weight: 600; }
    .soc-msg-avatar {
      width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #081B3A, #D4A33A);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .soc-typing { display: flex; align-items: center; gap: 5px; padding: 10px 14px; }
    .soc-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #081B3A; opacity: 0.35;
      animation: soc-bounce 1.2s infinite ease-in-out;
    }
    .soc-typing span:nth-child(2) { animation-delay: 0.2s; }
    .soc-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes soc-bounce {
      0%,80%,100% { transform: translateY(0); opacity: 0.35; }
      40% { transform: translateY(-6px); opacity: 1; }
    }
    .soc-quick-replies {
      display: flex; flex-wrap: wrap; gap: 7px; margin-top: 2px;
    }
    .soc-qr {
      background: #fff; border: 1.5px solid #081B3A; color: #081B3A;
      border-radius: 50px; padding: 5px 13px; font-size: 12px;
      cursor: pointer; transition: background 0.15s, color 0.15s;
      font-family: inherit; font-weight: 500;
    }
    .soc-qr:hover { background: #081B3A; color: #fff; }
    .soc-chat-footer {
      padding: 12px 14px 14px; background: #fff;
      border-top: 1px solid #e4e7ee;
      flex-shrink: 0;
    }
    .soc-input-row { display: flex; gap: 8px; align-items: flex-end; }
    .soc-input-row textarea {
      flex: 1; border: 1.5px solid #d6dcea; border-radius: 12px;
      padding: 9px 13px; font-size: 13.5px; font-family: inherit;
      resize: none; outline: none; max-height: 100px; min-height: 40px;
      line-height: 1.45; color: #233047; background: #fafbff;
      transition: border-color 0.2s;
    }
    .soc-input-row textarea:focus { border-color: #081B3A; }
    .soc-input-row textarea::placeholder { color: #9aa3b5; }
    .soc-send-btn {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #081B3A, #16315F);
      border: none; cursor: pointer; display: flex; align-items: center;
      justify-content: center; color: #D4A33A; font-size: 16px;
      transition: opacity 0.2s, transform 0.15s;
    }
    .soc-send-btn:hover { opacity: 0.9; transform: scale(1.05); }
    .soc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .soc-powered {
      text-align: center; font-size: 10.5px; color: #9aa3b5;
      margin-top: 7px;
    }
    .soc-powered span { color: #16315F; font-weight: 500; }
    @media (max-width: 480px) {
      #soc-chat-window { right: 10px; bottom: 84px; width: calc(100vw - 20px); }
      #soc-chat-btn { right: 16px; bottom: 18px; }
    }
  `;

  /* ─────────────────────────────────────────────
     INJECT STYLES & HTML
  ───────────────────────────────────────────────*/
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="soc-chat-btn" aria-label="Talk to a Senior Officer" title="Talk to a Senior Officer">
      <i class="fas fa-comments"></i>
      <div class="soc-notif" id="soc-notif"></div>
    </button>

    <div id="soc-chat-window" role="dialog" aria-label="Mercy Senior Solutions Chat">
      <div class="soc-chat-header">
        <div class="soc-chat-avatar">SO</div>
        <div class="soc-chat-header-info">
          <strong id="soc-bot-name">Talk to a Senior Officer</strong>
          <span id="soc-status-text">● Online now</span>
        </div>
        <button class="soc-chat-close" id="soc-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div class="soc-chat-body" id="soc-chat-body"></div>
      <div class="soc-chat-footer">
        <div class="soc-input-row">
          <textarea id="soc-chat-input" placeholder="Ask me anything…" rows="1" maxlength="500"></textarea>
          <button class="soc-send-btn" id="soc-send-btn" aria-label="Send message">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <div class="soc-powered">Powered by <span>Mercy Senior Solutions AI</span></div>
      </div>
    </div>
  `);

  /* ─────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────────*/
  let isOpen          = false;
  let isTyping        = false;
  let configReady;
  let conversationHistory = [];
  let hasGreeted      = false;
  let fsCache         = null;

  const chatBtn    = document.getElementById('soc-chat-btn');
  const chatWindow = document.getElementById('soc-chat-window');
  const chatBody   = document.getElementById('soc-chat-body');
  const chatInput  = document.getElementById('soc-chat-input');
  const sendBtn    = document.getElementById('soc-send-btn');
  const closeBtn   = document.getElementById('soc-chat-close');
  const notifDot   = document.getElementById('soc-notif');

  /* ─────────────────────────────────────────────
     FIRESTORE HELPERS (modular SDK, dynamic import)
  ───────────────────────────────────────────────*/
  async function getFS() {
    if (fsCache) return fsCache;
    const appMod   = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const fsMod    = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    fsCache = {
      initializeApp: appMod.initializeApp,
      getFirestore:  fsMod.getFirestore,
      getDoc:        fsMod.getDoc,
      getDocs:       fsMod.getDocs,
      doc:           fsMod.doc,
      collection:    fsMod.collection,
      addDoc:        fsMod.addDoc,
      serverTimestamp: fsMod.serverTimestamp,
    };
    return fsCache;
  }

  let db = null;
  let botName = CONFIG.botName;

  /* ─────────────────────────────────────────────
     LOAD CONFIG FROM FIRESTORE
  ───────────────────────────────────────────────*/
  async function loadFirestoreConfig() {
    try {
      const fs = await getFS();
      const app = fs.initializeApp(FIREBASE_CONFIG, 'senior-officer-chat');
      db = fs.getFirestore(app);

      const cfgSnap = await fs.getDoc(fs.doc(db, 'settings', 'aiChat'));
      if (cfgSnap.exists()) {
        const d = cfgSnap.data();
        if (d.aiProvider)                   CONFIG.aiProvider   = d.aiProvider;
        if (d.geminiKey)                    CONFIG.geminiKey    = d.geminiKey;
        if (d.geminiModel)                  CONFIG.geminiModel  = d.geminiModel;
        if (d.openaiKey)                    CONFIG.openaiKey    = d.openaiKey;
        if (d.openaiModel)                  CONFIG.openaiModel  = d.openaiModel;
        if (d.claudeKey)                    CONFIG.claudeKey    = d.claudeKey;
        if (d.claudeModel)                  CONFIG.claudeModel  = d.claudeModel;
        if (d.groqKey)                      CONFIG.groqKey      = d.groqKey;
        if (d.groqModel)                    CONFIG.groqModel    = d.groqModel;
        if (d.systemPrompt)                 CONFIG.systemPrompt = d.systemPrompt;
        if (typeof d.enabled === 'boolean') CONFIG.enabled      = d.enabled;
        if (d.kbThreshold)                  CONFIG.kbThreshold  = d.kbThreshold;
        if (d.botName)                      { CONFIG.botName = d.botName; botName = d.botName; }
      }

      // Load custom KB entries from Firestore (these take priority)
      const kbSnap = await fs.getDocs(fs.collection(db, 'aiKnowledge'));
      if (!kbSnap.empty) {
        const extra = [];
        kbSnap.forEach(d => {
          const e = d.data();
          if (e.keywords && e.answer) extra.push({ keywords: e.keywords, answer: e.answer });
        });
        KB_ENTRIES = [...extra, ...KB_ENTRIES];
      }

      // Apply bot name + disable widget if admin turned it off
      const nameEl = document.getElementById('soc-bot-name');
      if (nameEl) nameEl.textContent = botName;
      if (!CONFIG.enabled) {
        chatBtn.style.display = 'none';
        chatWindow.style.display = 'none';
      }
    } catch (err) {
      console.warn('[SeniorOfficerChat] Firestore config failed, using defaults:', err.message);
    }
  }

  /* ─────────────────────────────────────────────
     KNOWLEDGE BASE SEARCH
  ───────────────────────────────────────────────*/
  function searchKB(query) {
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);
    let best = { score: 0, answer: null };

    for (const entry of KB_ENTRIES) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw)) score += 2;
        else if (words.some(w => kw.includes(w) || w.includes(kw))) score += 1;
      }
      const norm = score / entry.keywords.length;
      if (norm > best.score) best = { score: norm, answer: entry.answer };
    }

    return best.score >= CONFIG.kbThreshold ? best.answer : null;
  }

  function getTopKBContext(query, maxEntries = 3) {
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);
    const scored = KB_ENTRIES.map(entry => {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw)) score += 2;
        else if (words.some(w => kw.includes(w) || w.includes(kw))) score += 1;
      }
      return { score: score / entry.keywords.length, answer: entry.answer };
    }).filter(e => e.score > 0).sort((a, b) => b.score - a.score);
    return scored.slice(0, maxEntries).map(e => e.answer).join('\n\n---\n\n');
  }

  /* ─────────────────────────────────────────────
     AI PROVIDER — ACTIVE KEY GETTER
  ───────────────────────────────────────────────*/
  function getActiveKey() {
    const p = CONFIG.aiProvider;
    if (p === 'gemini')  return CONFIG.geminiKey;
    if (p === 'openai')  return CONFIG.openaiKey;
    if (p === 'claude')  return CONFIG.claudeKey;
    if (p === 'groq')    return CONFIG.groqKey;
    return '';
  }

  function hasValidKey() {
    const key = getActiveKey();
    return key && key.length > 10;
  }

  /* ─────────────────────────────────────────────
     GEMINI API CALL
  ───────────────────────────────────────────────*/
  async function callGemini(userMessage) {
    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    if (conversationHistory.length > CONFIG.maxHistory * 2) {
      conversationHistory = conversationHistory.slice(-CONFIG.maxHistory * 2);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.geminiModel}:generateContent?key=${CONFIG.geminiKey}`;
    const payload = {
      system_instruction: { parts: [{ text: CONFIG.systemPrompt }] },
      contents: conversationHistory,
      generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err && err.error && err.error.message) || 'Gemini HTTP ' + res.status);
    }

    const data = await res.json();
    const reply = (data && data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts && data.candidates[0].content.parts[0].text)
      || ("I'm not sure about that one. Please call " + CONTACT.phone + " or email " + CONTACT.email + " and a Senior Officer will help.");

    conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
    return reply;
  }

  /* ─────────────────────────────────────────────
     OPENAI API CALL
  ───────────────────────────────────────────────*/
  async function callOpenAI(userMessage) {
    const messages = [
      { role: 'system', content: CONFIG.systemPrompt },
      ...conversationHistory.map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content || (m.parts ? m.parts[0].text : '')
      })),
      { role: 'user', content: userMessage }
    ];

    if (messages.length > CONFIG.maxHistory * 2 + 1) {
      const trimmed = messages.slice(0, 1).concat(messages.slice(-(CONFIG.maxHistory * 2)));
      messages.splice(0, messages.length, ...trimmed);
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CONFIG.openaiKey
      },
      body: JSON.stringify({
        model: CONFIG.openaiModel,
        messages,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err && err.error && err.error.message) || 'OpenAI HTTP ' + res.status);
    }

    const data = await res.json();
    const reply = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
      || ("I'm not sure about that one. Please call " + CONTACT.phone + " or email " + CONTACT.email + " and a Senior Officer will help.");

    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: reply });
    if (conversationHistory.length > CONFIG.maxHistory * 2) {
      conversationHistory = conversationHistory.slice(-CONFIG.maxHistory * 2);
    }

    return reply;
  }

  /* ─────────────────────────────────────────────
     CLAUDE (ANTHROPIC) API CALL
     Note: Claude's API doesn't allow direct browser calls without CORS
     support; the widget sends the CORS-allowed header and, if the
     provider fails, falls back to a friendly message. Prefer Gemini,
     OpenAI, or Groq for a fully serverless setup.
  ───────────────────────────────────────────────*/
  async function callClaude(userMessage) {
    const msgs = [];
    for (const m of conversationHistory) {
      const role = m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user';
      const content = m.content || (m.parts ? m.parts[0].text : '');
      if (content) msgs.push({ role, content });
    }
    msgs.push({ role: 'user', content: userMessage });

    const cleaned = [];
    for (const msg of msgs) {
      if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === msg.role) {
        cleaned[cleaned.length - 1].content += '\n' + msg.content;
      } else {
        cleaned.push({ ...msg });
      }
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.claudeKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-allow-cors': 'true'
      },
      body: JSON.stringify({
        model: CONFIG.claudeModel,
        max_tokens: 400,
        system: CONFIG.systemPrompt,
        messages: cleaned.slice(-CONFIG.maxHistory * 2)
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err && err.error && err.error.message) || 'Claude HTTP ' + res.status);
    }

    const data = await res.json();
    const reply = (data && data.content && data.content[0] && data.content[0].text)
      || ("I'm not sure about that one. Please call " + CONTACT.phone + " or email " + CONTACT.email + " and a Senior Officer will help.");

    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: reply });
    if (conversationHistory.length > CONFIG.maxHistory * 2) {
      conversationHistory = conversationHistory.slice(-CONFIG.maxHistory * 2);
    }

    return reply;
  }

  /* ─────────────────────────────────────────────
     GROQ API CALL  (OpenAI-compatible format)
  ───────────────────────────────────────────────*/
  async function callGroq(userMessage) {
    const messages = [
      { role: 'system', content: CONFIG.systemPrompt },
      ...conversationHistory.map(m => ({
        role: m.role === 'model' ? 'assistant' : (m.role === 'assistant' ? 'assistant' : 'user'),
        content: m.content || (m.parts ? m.parts[0].text : '')
      })),
      { role: 'user', content: userMessage }
    ];

    if (messages.length > CONFIG.maxHistory * 2 + 1) {
      const trimmed = messages.slice(0, 1).concat(messages.slice(-(CONFIG.maxHistory * 2)));
      messages.splice(0, messages.length, ...trimmed);
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CONFIG.groqKey
      },
      body: JSON.stringify({
        model: CONFIG.groqModel,
        messages,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err && err.error && err.error.message) || 'Groq HTTP ' + res.status);
    }

    const data = await res.json();
    const reply = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
      || ("I'm not sure about that one. Please call " + CONTACT.phone + " or email " + CONTACT.email + " and a Senior Officer will help.");

    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: reply });
    if (conversationHistory.length > CONFIG.maxHistory * 2) {
      conversationHistory = conversationHistory.slice(-CONFIG.maxHistory * 2);
    }

    return reply;
  }

  /* ─────────────────────────────────────────────
     UNIFIED AI CALL — dispatches to active provider
  ───────────────────────────────────────────────*/
  async function callAI(userMessage) {
    if (!hasValidKey()) {
      return "⚠️ AI responses aren't configured yet. Please contact us directly:\n📞 " + CONTACT.phone + "\n📧 " + CONTACT.email;
    }

    const p = CONFIG.aiProvider;
    if (p === 'gemini')  return await callGemini(userMessage);
    if (p === 'openai')  return await callOpenAI(userMessage);
    if (p === 'claude')  return await callClaude(userMessage);
    if (p === 'groq')    return await callGroq(userMessage);

    throw new Error('Unknown AI provider: ' + p);
  }

  /* ─────────────────────────────────────────────
     LOG Q/A TO FIRESTORE (for the admin panel)
  ───────────────────────────────────────────────*/
  async function logChat(question, answer, source, provider) {
    try {
      if (!db) return;
      const fs = await getFS();
      await fs.addDoc(fs.collection(db, 'aiChatLogs'), {
        question,
        answer,
        source,
        provider,
        page: window.location.pathname,
        createdAt: fs.serverTimestamp(),
      });
    } catch (err) {
      // Logging is non-critical
    }
  }

  /* ─────────────────────────────────────────────
     RENDER HELPERS
  ───────────────────────────────────────────────*/
  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function appendMessage(role, text, source) {
    const wrapper = document.createElement('div');
    wrapper.className = 'soc-msg ' + role;

    const avatarEl = document.createElement('div');
    avatarEl.className = 'soc-msg-avatar';
    avatarEl.textContent = role === 'bot' ? 'SO' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'soc-msg-bubble';
    bubble.innerHTML = formatMarkdown(text);

    if (role === 'bot') { wrapper.appendChild(avatarEl); wrapper.appendChild(bubble); }
    else { wrapper.appendChild(bubble); wrapper.appendChild(avatarEl); }

    chatBody.appendChild(wrapper);
    chatBody.scrollTop = chatBody.scrollHeight;
    return wrapper;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'soc-msg bot';
    el.id = 'soc-typing';
    el.innerHTML = `
      <div class="soc-msg-avatar">SO</div>
      <div class="soc-msg-bubble soc-typing">
        <span></span><span></span><span></span>
      </div>`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('soc-typing');
    if (el) el.remove();
  }

  function showQuickReplies(options) {
    const row = document.createElement('div');
    row.className = 'soc-quick-replies';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'soc-qr';
      btn.textContent = opt;
      btn.onclick = () => { row.remove(); handleSend(opt); };
      row.appendChild(btn);
    });
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  /* ─────────────────────────────────────────────
     SEND MESSAGE FLOW
  ───────────────────────────────────────────────*/
  async function handleSend(overrideText) {
    if (isTyping) return;
    const text = (overrideText || chatInput.value).trim();
    if (!text) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;
    isTyping = true;

    appendMessage('user', text);
    document.querySelectorAll('.soc-quick-replies').forEach(el => el.remove());
    showTyping();

    await configReady;

    const kbAnswer = searchKB(text);
    let reply, source;

    if (kbAnswer && hasValidKey()) {
      try {
        const kbContext = getTopKBContext(text);
        const rephraseMsg = 'The visitor asked: "' + text + '"\n\nHere is the relevant information from our knowledge base:\n\n' + kbContext + '\n\nUsing ONLY the information above, answer the visitor\'s question naturally and conversationally — as if you already knew it. Match the tone and phrasing of their question. Do not add information that is not in the knowledge base. Keep it concise.';
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        );
        reply = await Promise.race([callAI(rephraseMsg), timeout]);
        source = 'kb';
      } catch (err) {
        await new Promise(r => setTimeout(r, 500));
        reply = kbAnswer;
        source = 'kb';
      }
    } else if (kbAnswer && !hasValidKey()) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      reply = kbAnswer;
      source = 'kb';
    } else {
      try {
        const kbContext = getTopKBContext(text);
        const aiMsg = kbContext
          ? 'The visitor asked: "' + text + '"\n\nHere is some possibly relevant background from our knowledge base:\n\n' + kbContext + '\n\nAnswer naturally using this context if relevant, or use your general knowledge about Mercy Senior Solutions and senior care if the context doesn\'t help.'
          : text;
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        );
        reply = await Promise.race([callAI(aiMsg), timeout]);
        source = 'ai';
      } catch (err) {
        const isTimeout = err.message === 'timeout';
        reply = isTimeout
          ? '⏱ The AI is taking too long right now. Please try again or contact us:\n📞 ' + CONTACT.phone + '\n📧 ' + CONTACT.email
          : '⚠️ Couldn\'t reach the AI (' + err.message + '). Please contact us directly:\n📞 ' + CONTACT.phone + '\n📧 ' + CONTACT.email;
        source = null;
      }
    }

    removeTyping();
    appendMessage('bot', reply, source);
    logChat(text, reply, source, CONFIG.aiProvider);

    const lc = text.toLowerCase();
    if (lc.match(/book|schedule|consult|appointment/)) {
      showQuickReplies(['📞 Call to schedule', '💰 Cost & coverage', '🏠 Care options']);
    } else if (lc.match(/price|cost|how much|fee/)) {
      showQuickReplies(['🏠 Senior placement', '💚 Caregiver services', '📅 Free consultation']);
    } else if (lc.match(/hello|hi|hey|start/)) {
      showQuickReplies(['🏠 Senior placement', '💚 Caregiver services', '📞 Contact us']);
    } else if (lc.match(/placement|assisted|memory care/)) {
      showQuickReplies(['💰 Cost & coverage', '📍 Where do you serve?', '📅 Free consultation']);
    }

    sendBtn.disabled = false;
    isTyping = false;
  }

  /* ─────────────────────────────────────────────
     OPEN / CLOSE
  ───────────────────────────────────────────────*/
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    if (notifDot) notifDot.style.display = 'none';
    chatInput.focus();

    if (!hasGreeted) {
      hasGreeted = true;
      setTimeout(() => {
        appendMessage('bot',
          '👋 Hi there! I\'m **' + botName + '**, the Mercy Senior Solutions AI assistant. How can I help you today?',
          null
        );
        showQuickReplies(['🏠 Senior placement', '💚 Caregiver services', '🩺 Consulting', '📞 Contact us']);
      }, 300);
    }
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
  }

  if (chatBtn) chatBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  window.socChatOpen   = openChat;
  window.socChatClose  = closeChat;
  window.socChatToggle = () => isOpen ? closeChat() : openChat();

  sendBtn.addEventListener('click', () => handleSend());
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────*/
  setTimeout(() => {
    if (!isOpen && notifDot) notifDot.style.display = 'block';
  }, 4000);

  configReady = loadFirestoreConfig();

})();
