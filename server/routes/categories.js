const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/categoryController');

router.get('/', ctrl.getAll);

router.use(protect, restrictTo('admin'));

router.post('/', [
  body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Nome inválido.'),
  body('iconColor').optional().isIn(['green','gold','olive','dark-green','red','blue']),
], ctrl.create);

router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
