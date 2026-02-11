const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- CONFIGURAÇÃO ---
// Sua API Key (Estou usando a que você forneceu)
const genAI = new GoogleGenerativeAI("AIzaSyAdZiOfyTDYOCd_lPcwPmD4HKnPzVqyKwA");

// Usando o modelo Flash que é rápido e barato
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// --- QR CODE NA TELA ---
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('👉 QR CODE GERADO! ESCANEIE COM O WHATSAPP AGORA.');
});

// --- CONEXÃO PRONTA ---
client.on('ready', () => {
    console.log('✅ Tudo pronto! O Robô está online e ouvindo.');
});

// --- CÉREBRO DA IA ---
client.on('message', async (msg) => {
    // Ignora mensagens de grupos e status
    if (msg.from.includes('@g.us') || msg.from.includes('status')) return;

    console.log(`📩 Cliente disse: ${msg.body}`);

    try {
        // O PROMPT (A personalidade do vendedor)
        const prompt = `
        Você é o atendente virtual simpático do 'Boop Delivery'.
        Seu objetivo é convencer o cliente a pedir no nosso site.
        
        INSTRUÇÕES:
        1. Seja curto, educado e use emojis.
        2. Tire dúvidas básicas se souber.
        3. SEMPRE finalize mandando o link do cardápio.
        
        Link do Cardápio: http://o08gsoo8kgk8g04swkoo48c4.187.77.34.112.sslip.io
        
        Cliente disse: "${msg.body}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Envia a resposta
        await msg.reply(text);
        console.log('🤖 IA Respondeu:', text);

    } catch (error) {
        console.error("ERRO CRÍTICO:", error);
        // Se der erro mesmo assim, avisa de forma elegante
        await msg.reply("Desculpe, estou atualizando meu sistema. Tente novamente em 1 minuto! 🛠️");
    }
});

// Inicia o robô
client.initialize();
