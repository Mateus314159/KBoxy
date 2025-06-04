// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  { // Objeto da definição do Schema (primeiro argumento)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: '' }, // Para o nome do usuário
    avatarUrl: { type: String, default: '' }, // Para a URL da foto do perfil // << VÍRGULA ADICIONADA AQUI
    // **** CÓDIGO NOVO - Objeto de Endereço ****
    address: {
      street: { type: String, default: '' },
      complement: { type: String, default: '' },
      neighborhood: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' }, // Adicionado Estado
      zipcode: { type: String, default: '' }
    }
    // **** FIM DO CÓDIGO NOVO ****
  },
  { // Objeto de opções do Schema (segundo argumento)
    timestamps: true // Adicionar timestamps é uma boa prática
  }
);

module.exports = mongoose.model('User', userSchema);