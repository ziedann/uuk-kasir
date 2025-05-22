const Category = require('../models/category');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const category = new Category({
            name: req.body.name
        });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get or create category by name
exports.getOrCreateCategoryByName = async (name) => {
    try {
        let category = await Category.findOne({ name: name });
        if (!category) {
            category = await new Category({ name: name }).save();
        }
        return category;
    } catch (error) {
        throw error;
    }
}; 