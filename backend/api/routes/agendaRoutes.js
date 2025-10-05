const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', agendaController.listAgendas);
router.get('/:id', agendaController.getAgenda);
router.post('/', authMiddleware, adminMiddleware, agendaController.createAgenda);
router.put('/:id', authMiddleware, adminMiddleware, agendaController.updateAgenda);
router.delete('/:id', authMiddleware, adminMiddleware, agendaController.deleteAgenda);

module.exports = router;
