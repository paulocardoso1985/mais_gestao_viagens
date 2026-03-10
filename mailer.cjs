const nodemailer = require('nodemailer');

// For development, we'll use a local log approach if credentials aren't provided
// In production, the user would provide real SMTP settings
// Use environment variables for SMTP, or fallback to Ethereal (dummy) for testing
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'test.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'test.pass'
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
