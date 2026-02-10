const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Conecta com a Inteligência Artificial usando sua chave
const genAI = new GoogleGenerativeAI("AIzaSyAdZiOfyTDYOCd_lPcwPmD4HKnPzVqyKwA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 2. Configura o WhatsApp para rodar no Servidor (VPS)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// 3. Gera o QR Code na tela preta
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('👉 ESCANEIE O QR CODE ACIMA COM SEU WHATSAPP!');
});

// 4. Avisa quando conectou
client.on('ready', () => {
    console.log('✅ Robô conectado e pronto para conversar!');
});

// 5. Ouve as mensagens e responde
client.on('message', async (msg) => {
    // Ignora mensagens de grupos para não fazer bagunça
    if (msg.from.includes('@g.us')) return;

    console.log(`📩 Mensagem recebida: ${msg.body}`);

    try {
        // Dá uma "personalidade" para a IA e manda a mensagem do cliente
        const prompt = "Você é um atendente de delivery muito simpático e prestativo. Responda a esta mensagem de forma curta e amigável: " + msg.body;
        
        const result = await model.generateContent(prompt);
        const respostaIA = result.response.text();

        // Manda a resposta da IA de volta no WhatsApp
        msg.reply(respostaIA);
        console.log(`🤖 Resposta enviada: ${respostaIA}`);
        
    } catch (error) {
        console.error("Erro na IA:", error);
        msg.reply("Desculpe, deu um tilt no meu cérebro agora. 😅");
    }
});

// Liga o robô
client.initialize();