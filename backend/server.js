// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS
// =================================================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 21020;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

const path = require('path');

const app = express();

// =================================================================
// 2. CONFIGURAÇÃO DE MIDDLEWARE PRINCIPAL
// (Isto precisa vir antes de todas as rotas)
// =================================================================

// Configuração explícita do CORS para garantir a permissão
const corsOptions = {
  origin: [
    'https://www.kboxy.com.br', 
    'http://www.kboxy.com.br',
    'https://kboxy.com.br',
    'http://kboxy.com.br'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware para ler o corpo das requisições em JSON

// =================================================================
// 3. IMPORTAÇÃO DE TODAS AS ROTAS
// =================================================================
const freteRoutes = require('./routes/api/frete');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

// =================================================================
// 4. MONTAGEM DE TODAS AS ROTAS DE API
// (Todas as rotas da API devem ser declaradas aqui, ANTES de servir os arquivos estáticos)
// =================================================================
app.use('/api', freteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/newsletter', newsletterRoutes);


// =================================================================
// 5. SERVIR ARQUIVOS ESTÁTICOS (FRONTEND E UPLOADS)
// (Isto vem DEPOIS das rotas da API)
// =================================================================

// Servir a página de redefinição de senha
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'reset-password.html'));
});

// Servir os arquivos de uploads (avatares, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir todos os outros arquivos estáticos do frontend (HTML, CSS, JS, etc.)
// Esta deve ser uma das últimas rotas.
app.use(express.static(path.join(__dirname, '..')));


// =================================================================
// 6. CONEXÃO COM O BANCO DE DADOS
// =================================================================
const mongooseOptions = {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000  // falha em 10s se não conectar
};

mongoose
  .connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

// =================================================================
// 7. CÓDIGO DE DIAGNÓSTICO (Opcional)
// =================================================================
try {
  const Order = require('./models/Order'); 
  console.log('================================================');
  console.log('--- DIAGNÓSTICO DO ESQUEMA DO MODELO ORDER ---');
  console.log(Object.keys(Order.schema.paths));
  console.log('--- FIM DO DIAGNÓSTICO ---');
  console.log('================================================');
} catch (e) {
  console.log('🚨 ERRO AO CARREGAR MODELO ORDER PARA DIAGNÓSTICO:', e);
}

// Novo: só usa a porta que o ambiente (KingHost) injetar
const PORT = process.env.PORT;

if (!PORT) {
  console.error('🛑 A variável process.env.PORT não está definida!');
  process.exit(1);
}

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));