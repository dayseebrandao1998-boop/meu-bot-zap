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
        const prompt = `Você é o atendente virtual do nosso Delivery.
        Seu objetivo é ser super educado, tirar dúvidas rápidas e SEMPRE direcionar o cliente para fazer o pedido no nosso site.
        Link do nosso site: http://o08gsoo8kgk8g04swkoo48c4.187.77.34.112.sslip.io

        Regras:
        1. Seja curto, direto e use emojis.
        2. Não invente preços ou produtos que não existem.
        3. Termine a mensagem convidando o cliente para acessar o link do site para ver o cardápio e pedir.

        Mensagem do cliente: ${msg.body}`;
        
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
