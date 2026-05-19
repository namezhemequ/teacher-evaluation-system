const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authMiddleware, permissionMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', planController.getPlans);
router.get('/:id', planController.getPlanById);
router.post('/', permissionMiddleware('admin'), planController.createPlan);
router.put('/:id', permissionMiddleware('admin'), planController.updatePlan);
router.put('/:id/publish', permissionMiddleware('admin'), planController.publishPlan);
router.delete('/:id', permissionMiddleware('admin'), planController.deletePlan);

module.exports = router;