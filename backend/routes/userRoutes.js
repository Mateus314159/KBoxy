// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, uploadAvatar } = require('../controllers/userController'); // Adicione uploadAvatar
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer para armazenamento de avatares
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars'); // Caminho para salvar: backend/uploads/avatars/
    // Cria o diretório se não existir
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Define um nome de arquivo único para evitar conflitos
    cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filtro para aceitar apenas imagens
const avatarFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Por favor, envie apenas arquivos de imagem (jpeg, png, gif)!'), false);
  }
};

const upload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB para o arquivo
});

// Rota para buscar o perfil do usuário logado
// GET /api/users/me
router.get('/me', auth, getUserProfile);

// Rota PUT para atualizar o perfil
// PUT /api/users/me
router.put('/me', auth, updateUserProfile);

// **** ROTA NOVA PARA UPLOAD DE AVATAR ****
// POST /api/users/me/avatar
router.post('/me/avatar', auth, upload.single('avatar'), uploadAvatar); // 'avatar' é o nome do campo no FormData

module.exports = router;