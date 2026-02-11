const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Configuração do Cérebro (Gemini 1.5 Flash - O mais estável)
const genAI = new GoogleGenerativeAI("AIzaSyAdZiOfyTDYOCd_lPcwPmD4HKnPzVqyKwA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('👉 ESCANEIE O NOVO QR CODE!');
});

client.on('ready', () => {
    console.log('✅ ROBÔ CONECTADO E ATIVO!');
});

client.on('message', async (msg) => {
    if (msg.from.includes('@g.us')) return;

    try {
        // Instrução de Vendedor
        const prompt = `Você é o atendente do nosso Delivery. Seja curto, simpático e use emojis. 
        Sempre mande o link do site: http://o08gsoo8kgk8g04swkoo48c4.187.77.34.112.sslip.io 
        
        Pergunta do cliente: ${msg.body}`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        await msg.reply(text);
        console.log('🤖 IA respondeu com sucesso!');

    } catch (error) {
        console.error("ERRO NA IA:", error);
        // Se der erro, ele vai te falar exatamente qual é no WhatsApp
        msg.reply("Ops, erro técnico: " + error.message);
    }
});

client.initialize();
