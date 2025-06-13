// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailer = require('../utils/mailer'); // ALTERADO para importar o objeto mailer completo

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email já cadastrado.' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashed });

    // +++ INÍCIO DA ATUALIZAÇÃO PARA TEMPLATE +++
    // Envia e-mail de boas-vindas usando o novo template profissional
    try {
      await mailer.sendTemplatedMail(
        newUser.email,
        'Bem-vindo(a) à K-boxy!',
        'welcome', // Nome do template: welcome.html
        {
          customerName: newUser.email.split('@')[0], // Usa a parte local do email como nome
          serverUrl: process.env.FRONTEND_URL || 'https://kboxy-teste-site.onrender.com',
          currentYear: new Date().getFullYear()
        }
      );
    } catch (emailError) {
      console.error('Falha ao enviar e-mail de boas-vindas:', emailError);
      // O erro no envio de e-mail não deve impedir o sucesso do cadastro.
    }
    // +++ FIM DA ATUALIZAÇÃO PARA TEMPLATE +++

    res.status(201).json({ message: 'Usuário criado com sucesso.' });
  } catch (err) {
    console.error('Erro no register:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Senha incorreta.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      token,
      userId: user._id,
      avatarUrl: user.avatarUrl || ''
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: err.message });
  }
};