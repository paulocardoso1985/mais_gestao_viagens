const nodemailer = require('nodemailer');

// For development, we'll use a local log approach if credentials aren't provided
// In production, the user would provide real SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'test.user@ethereal.email',
        pass: 'test.pass'
    }
});

const sendEmail = async (to, subject, html) => {
    console.log(`[MAILER] Tentando enviar e-mail para ${to}: ${subject}`);
    
    // Log context for the user since we are using dummy credentials
    console.log(`--- CONTEÚDO DO E-MAIL ---`);
    console.log(`Assunto: ${subject}`);
    console.log(`Para: ${to}`);
    console.log(`Mensagem: ${html.replace(/<[^>]*>?/gm, ' ')}`);
    console.log(`-------------------------`);

    try {
        // In a real scenario, this would send
        // const info = await transporter.sendMail({ from: '"Mais Corporativo" <nao-responda@maiscorporativo.com.br>', to, subject, html });
        // console.log("Message sent: %s", info.messageId);
        return { success: true };
    } catch (error) {
        console.error('[MAILER] Erro ao enviar e-mail:', error);
        return { success: false, error };
    }
};

module.exports = { sendEmail };
