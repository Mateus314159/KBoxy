const express = require('express');
const path = require('path');
const router = express.Router();

// GET /purchase?plan=xxx
router.get('/', (req, res) => {
  // Envia o HTML estático de checkout sem checar autorização
  return res.sendFile(
    path.join(__dirname, '..', '..', 'checkout.html')
  );
});

module.exports = router;
