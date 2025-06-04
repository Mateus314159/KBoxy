// controllers/userController.js
const User = require('../models/User');
const fs = require('fs'); // Para manipulação de arquivos, se necessário deletar o antigo
const path = require('path'); // Para construir caminhos de arquivo

// Função para buscar o perfil do usuário logado
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        address: user.address
    });
  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err.message);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar perfil.' }); // Corrigido: error para message
  }
};

// Função para ATUALIZAR o perfil
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, address } = req.body;
    const userId = req.userId;

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (name !== undefined) {
      userToUpdate.name = name;
    }

    if (address) {
      if (!userToUpdate.address) {
        userToUpdate.address = {};
      }
      if (address.street !== undefined) userToUpdate.address.street = address.street;
      if (address.complement !== undefined) userToUpdate.address.complement = address.complement;
      if (address.neighborhood !== undefined) userToUpdate.address.neighborhood = address.neighborhood;
      if (address.city !== undefined) userToUpdate.address.city = address.city;
      if (address.state !== undefined) userToUpdate.address.state = address.state;
      if (address.zipcode !== undefined) userToUpdate.address.zipcode = address.zipcode;
    }

    const updatedUser = await userToUpdate.save();

    res.json({
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
        address: updatedUser.address
    });

  } catch (err) {
    console.error('Erro ao atualizar perfil do usuário:', err.message, err.stack);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' }); // Corrigido: error para message
  }
};

// **** FUNÇÃO NOVA PARA UPLOAD DE AVATAR ****
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      // Se o usuário não for encontrado, talvez seja bom remover o arquivo que acabou de ser salvo
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
    }

    // Opcional: Deletar o avatar antigo do sistema de arquivos, se existir
    if (user.avatarUrl) {
      // Supondo que avatarUrl armazena um caminho relativo como '/uploads/avatars/nomearquivo.jpg'
      // E que o servidor está servindo estaticamente essa pasta, ou que o caminho é completo.
      // Para este exemplo, vamos assumir que o avatarUrl é o caminho relativo a partir da raiz do backend.
      // Se user.avatarUrl for uma URL completa (ex: de um serviço de nuvem), a lógica de deleção será diferente.
      try {
        const oldAvatarPath = path.join(__dirname, '..', user.avatarUrl); // Ajuste conforme sua estrutura
        if (fs.existsSync(oldAvatarPath) && user.avatarUrl.startsWith('/uploads/avatars/')) { // Verificação básica
          fs.unlinkSync(oldAvatarPath);
        }
      } catch (deleteError) {
        console.warn('Aviso: Não foi possível deletar o avatar antigo:', deleteError.message);
        // Não interrompa o processo principal se a deleção do antigo falhar
      }
    }

    // Atualiza o avatarUrl do usuário com o caminho do novo arquivo.
    // O req.file.path é o caminho completo no servidor.
    // Você provavelmente vai querer armazenar um caminho relativo ou uma URL acessível pelo frontend.
    // Exemplo: '/uploads/avatars/nome_do_arquivo.jpg'
    // Isso assume que você configurará seu servidor Express para servir arquivos estáticos da pasta 'uploads'.
    const avatarRelativePath = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = avatarRelativePath;
    await user.save();

    res.json({
      message: 'Avatar atualizado com sucesso!',
      avatarUrl: user.avatarUrl // Envie a nova URL para o frontend
    });

  } catch (err) {
    console.error('Erro ao fazer upload do avatar:', err.message, err.stack);
    // Se ocorreu um erro após o upload e o arquivo foi salvo, pode ser bom removê-lo
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Erro ao limpar arquivo após falha no upload do avatar:', cleanupError.message);
      }
    }
    // Verifica se o erro é do multer (ex: tipo de arquivo inválido)
    if (err.message.includes('Por favor, envie apenas arquivos de imagem')) {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao fazer upload do avatar.' });
  }
};