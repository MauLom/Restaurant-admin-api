const express = require('express');
const {
  getRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe,
  uploadImage, uploadMiddleware,
} = require('../controllers/recipe.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/upload-image', authMiddleware, uploadMiddleware, uploadImage);
router.get('/', authMiddleware, getRecipes);
router.get('/:recipeId', authMiddleware, getRecipeById);
router.post('/', authMiddleware, createRecipe);
router.put('/:recipeId', authMiddleware, updateRecipe);
router.delete('/:recipeId', authMiddleware, deleteRecipe);

module.exports = router;
