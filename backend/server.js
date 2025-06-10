const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');



const app = express();
app.use(cors());
app.use(express.json());

const freteRoutes = require('./routes/api/frete');
app.use('/api', freteRoutes);

// 1. SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND (index.html, checkout.html, CSS, JS, imagens, etc.)
app.use(express.static(path.join(__dirname, '..')));

// ─── Servir página de redefinição de senha ───
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'reset-password.html'));
});
// ────────────────────────────────────────────

// 2. SERVIR UPLOADS (AVATARES, IMAGENS, ETC.), se existir pasta de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. CONECTAR AO MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// 4. IMPORTAR ROTAS EXISTENTES (autenticação, pedidos, usuários)
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

// 4.1. IMPORTAR A NOVA ROTA DE PAGAMENTO
const paymentRoutes = require('./routes/paymentRoutes');

// 4.2. IMPORTAR A ROTA DE CHECKOUT (purchase)
const purchaseRoutes = require('./routes/purchaseRoutes');

const subscriptionRoutes = require('./routes/subscriptionRoutes');

// 5. MONTAR ROTAS DE API
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// 5.1. MONTAR AS ROTAS DE PAGAMENTO
app.use('/api/payment', paymentRoutes);

// 5.2. MONTAR A ROTA /purchase → envia checkout.html
app.use('/purchase', purchaseRoutes);

// 5.3. MONTAR A ROTA DE ASSINATURAS
app.use('/api/subscription', subscriptionRoutes);

// NOVA ROTA PARA A PÁGINA DE REDEFINIÇÃO DE SENHA
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'reset-password.html'));
});

// 6. INICIAR O SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
