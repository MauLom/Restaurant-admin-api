const Analysis = require('../models/analysis');

exports.saveAnalysis = async (req, res) => {
  try {
    const newAnalysis = new Analysis(req.body);
    await newAnalysis.save();
    res.status(201).json(newAnalysis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    await Analysis.findByIdAndDelete(id);
    res.status(200).json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getAnalyses = async (req, res) => {
    try {
      const analyses = await Analysis.find();
      res.status(200).json(analyses);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
