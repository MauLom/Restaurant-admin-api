// routes/analysis.js
const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

router.post('/save', analysisController.saveAnalysis);
router.delete('/delete/:id', analysisController.deleteAnalysis);
router.get('/', analysisController.getAnalyses);

module.exports = router;
