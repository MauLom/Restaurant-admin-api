const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url: { type: String, default: '' },
  isUpload: { type: Boolean, default: false },
}, { _id: false });

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'unidad' },
  image: { type: ImageSchema, default: () => ({}) },
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null },
}, { _id: false });

const StepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: ImageSchema, default: () => ({}) },
}, { _id: false });

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  mainImage: { type: ImageSchema, default: () => ({}) },
  area: { type: String, enum: ['kitchen', 'bar'], default: 'kitchen' },
  servings: { type: Number, default: 1 },
  prepTime: { type: Number, default: 0 },
  cookTime: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  ingredients: { type: [IngredientSchema], default: [] },
  steps: { type: [StepSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Recipe', RecipeSchema);
