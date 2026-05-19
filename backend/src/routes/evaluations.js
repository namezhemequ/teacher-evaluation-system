const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/plans/:planId/evaluations', evaluationController.getEvaluationsByPlan);
router.post('/plans/:planId/evaluations', evaluationController.submitEvaluation);
router.get('/evaluations/:id', evaluationController.getEvaluationById);
router.put('/evaluations/:id/status', evaluationController.archiveEvaluation);

module.exports = router;