const TelegramOrderSchema = new mongoose.Schema({
  items: [{
    item: String,
    quantity: Number
  }],
  createdByTelegramId: String,
  createdByAlias: String,  // New field for alias
  status: {
    type: String,
    enum: ['In Preparation', 'Ready for Delivery', 'Delivered'],
    default: 'In Preparation'
  },
  statusChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
