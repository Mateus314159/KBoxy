// backend/controllers/newsletterController.js
const Subscriber = require('../models/Subscriber');
const mailer = require('../utils/mailer');

exports.subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'O e-mail é obrigatório.' });
  }

  try {
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(200).json({ message: 'Este e-mail já está em nossa lista VIP!' });
    }

    await Subscriber.create({ email });

    await mailer.sendTemplatedMail(
      email,
      '🤫 Você entrou para o círculo secreto da K-boxy...',
      'newsletter-welcome',
      {
        currentYear: new Date().getFullYear()
      }
    );

    return res.status(201).json({ message: 'Inscrição VIP confirmada! Confira seu e-mail.' });

  } catch (error) {
    console.error('Erro na inscrição da newsletter:', error);
    return res.status(500).json({ message: 'Erro interno ao processar sua inscrição.' });
  }
};