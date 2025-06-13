// backend/controllers/userController.js
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Buscar o perfil do usuário logado
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({
        id: user._id, email: user.email, name: user.name,
        avatarUrl: user.avatarUrl, address: user.address
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno do servidor ao buscar perfil.' });
  }
};

// ATUALIZAR o perfil
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, address } = req.body;
    const userToUpdate = await User.findById(req.userId);
    if (!userToUpdate) return res.status(404).json({ message: 'Usuário não encontrado.' });

    if (name !== undefined) userToUpdate.name = name;
    
    if (address) {
      if (!userToUpdate.address) userToUpdate.address = {};
      userToUpdate.address.street = address.street;
      userToUpdate.address.number = address.number; // Linha crucial que faltava
      userToUpdate.address.complement = address.complement;
      userToUpdate.address.neighborhood = address.neighborhood;
      userToUpdate.address.city = address.city;
      userToUpdate.address.state = address.state;
      userToUpdate.address.zipcode = address.zipcode;
    }

    const updatedUser = await userToUpdate.save();
    res.json({
        id: updatedUser._id, email: updatedUser.email, name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl, address: updatedUser.address
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
  }
};

// Upload de avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
    const user = await User.findById(req.userId);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    
    const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = avatarRelativePath;
    await user.save();

    res.json({ message: 'Avatar atualizado com sucesso!', avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno do servidor ao fazer upload do avatar.' });
  }
};