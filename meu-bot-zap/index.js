const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Sua Chave API e Modelo Super Estável
const genAI = new GoogleGenerativeAI("AIzaSyAdZiOfyTDYOCd_lPcwPmD4HKnPzVqyKwA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('👉 NOVO QR CODE GERADO!');
});

client.on('ready', () => {
    console.log('✅ Robô Conectado e Ativo!');
});

client.on('message', async (msg) => {
    if (msg.from.includes('@g.us')) return;

    try {
        const prompt = `Você é o atendente do nosso Delivery. Seja curto e mande o link: http://o08gsoo8kgk8g04swkoo48c4.187.77.34.112.sslip.io \n\n Cliente disse: ${msg.body}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        msg.reply(text);
    } catch (error) {
        console.error("ERRO DETALHADO:", error);
        // Agora ele vai te dizer o erro real no Zap!
        msg.reply("Erro na IA: " + error.message);
    }
});

client.initialize();
