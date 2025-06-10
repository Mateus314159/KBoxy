const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// +++ INÍCIO DA CORREÇÃO +++
// Importa ambas as funções do controller de senha
const { requestPasswordReset, resetPassword } = require('../controllers/passwordController');
// +++ FIM DA CORREÇÃO +++

router.post('/register', register);
router.post('/login', login);

// Rota para solicitar o e-mail de redefinição (já existente)
router.post('/forgot-password', requestPasswordReset);

// +++ INÍCIO DA CORREÇÃO +++
// Nova rota para efetivamente redefinir a senha com o token
router.post('/reset-password', resetPassword);
// +++ FIM DA CORREÇÃO +++

module.exports = router;