const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); // <--- 1. IMPORTAR O MÓDULO 'path' DO NODE.JS

const app = express();
app.use(cors());
app.use(express.json());

// --- 2. CONFIGURAÇÃO PARA SERVIR ARQUIVOS ESTÁTICOS ---
// Qualquer requisição que comece com '/uploads' (ex: /uploads/avatars/nomearquivo.jpg)
// será servida a partir da pasta 'uploads' na raiz do seu projeto backend.
// Ex: se o frontend requisitar http://localhost:5000/uploads/avatars/foto.jpg,
// o Express procurará o arquivo em seu_projeto_backend/uploads/avatars/foto.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// __dirname é uma variável do Node.js que representa o diretório do arquivo atual (server.js)
// path.join é usado para construir caminhos de forma segura entre diferentes sistemas operacionais.

// Conecta no MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Importa as rotas
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

// Usa as rotas
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));