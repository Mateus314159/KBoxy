// backend/controllers/passwordController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mailer = require('../utils/mailer'); // ALTERADO para importar o objeto mailer completo
const bcrypt = require('bcryptjs');

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'E-mail não cadastrado.' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'https://kboxy-teste-site.onrender.com'}/reset-password?token=${token}`;

    // +++ INÍCIO DA ATUALIZAÇÃO PARA TEMPLATE +++
    // Envia e-mail de redefinição usando o novo template profissional
    try {
      await mailer.sendTemplatedMail(
        user.email,
        'Redefinição de Senha da K-boxy',
        'passwordReset', // Nome do template: passwordReset.html
        {
          resetLink: resetLink
        }
      );
    } catch (emailError) {
      console.error('Falha ao enviar e-mail de redefinição de senha:', emailError);
      // Continua a resposta de sucesso para o usuário, mesmo que o e-mail falhe, por segurança.
    }
    // +++ FIM DA ATUALIZAÇÃO PARA TEMPLATE +++

    res.json({ message: 'E-mail de recuperação enviado.' });
  } catch (err) {
    console.error('requestPasswordReset:', err);
    res.status(500).json({ message: 'Erro ao processar recuperação de senha.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado. Solicite uma nova redefinição de senha.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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