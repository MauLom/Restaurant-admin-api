const Setting = require("../models/Settings.model");

exports.getSettingByKey = async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await Setting.findOne({ key });
      if (!setting) return res.status(404).json({ error: 'Setting not found' });
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching setting' });
    }
  };
  