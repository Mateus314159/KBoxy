// utils/mailer.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host:     process.env.SMTP_HOST,
  port:     parseInt(process.env.SMTP_PORT),
  secure:   process.env.SMTP_SECURE === 'true',
  auth: {
    user:   process.env.SMTP_USER,
    pass:   process.env.SMTP_PASS,
  },
});

// Função para ler o template e substituir os placeholders
const renderTemplate = (templateName, data) => {
  // O caminho __dirname aponta para a pasta onde o arquivo atual (mailer.js) está.
  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Loop para substituir todas as ocorrências de {{chave}} pelo valor correspondente
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, data[key]);
  }
  return html;
};

// Objeto de exportação CORRIGIDO
module.exports = {
  // Função original, mantida por segurança
  sendMail: (opts) => transporter.sendMail({
    from: process.env.EMAIL_FROM,
    ...opts
  }),
  
  // Nova função para enviar e-mails baseados em templates
  sendTemplatedMail: (to, subject, templateName, data) => {
    const html = renderTemplate(templateName, data);
    return transporter.sendMail({
      from: process.env.EMAIL_FROM, // Usa o e-mail do .env como remetente
      to,                          // 'to' é o destinatário (ex: 'kboxy.pop@gmail.com' ou o email do cliente)
      subject,                     // Assunto do e-mail
      html                         // Corpo do e-mail em HTML vindo do template
    });
  }
};