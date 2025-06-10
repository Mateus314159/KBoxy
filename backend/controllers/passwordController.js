// backend/controllers/passwordController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user  = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'E-mail não cadastrado.' });
    }

    // 1) criar token que expira em 1h
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 2) montar link que o front vai usar
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // 3) enviar e-mail
    await sendMail({
      to: user.email,
      subject: '🔒 Redefinição de senha K-Boxy',
      html: `
        <p>Olá ${user.name || ''},</p>
        <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha (válido por 1h):</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    });

    res.json({ message: 'E-mail de recuperação enviado.' });
  } catch (err) {
    console.error('requestPasswordReset:', err);
    res.status(500).json({ message: 'Erro ao processar recuperação de senha.' });
  }
};
