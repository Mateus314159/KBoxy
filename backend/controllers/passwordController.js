// backend/controllers/passwordController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');
const bcrypt = require('bcryptjs'); // Adicionado para criptografar a nova senha

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
        <p>Olá,</p>
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


// +++ INÍCIO DA CORREÇÃO +++
// Nova função para redefinir a senha
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Valida se o token e a nova senha foram enviados
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }

    // Verifica a validade do token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Retorna erro se o token for inválido ou tiver expirado
      return res.status(401).json({ message: 'Token inválido ou expirado. Solicite uma nova redefinição de senha.' });
    }

    // Criptografa a nova senha antes de salvar
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Encontra o usuário pelo ID (extraído do token) e atualiza a senha
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('resetPassword Error:', err);
    res.status(500).json({ message: 'Ocorreu um erro interno ao redefinir sua senha.' });
  }
};
// +++ FIM DA CORREÇÃO +++