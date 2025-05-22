const Product = require('../models/produk');
const { getOrCreateCategoryByName } = require('./categoryController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/products';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: fileFilter
});

const handleUpload = (req, res, next) => {
    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

const productController = {
    // Get all products
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find().populate('category');
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get single product
    getProductById: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id).populate('category');
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Middleware for handling file uploads
    uploadImage: handleUpload,

    // Create new product
    createProduct: async (req, res) => {
        try {
            console.log('Request body:', req.body);
            console.log('File:', req.file);
            console.log('User:', req.user);

            // Handle category
            let categoryId;
            try {
                const category = await getOrCreateCategoryByName(req.body.category);
                categoryId = category._id;
            } catch (error) {
                return res.status(400).json({ message: 'Invalid category' });
            }

            const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

            const productData = {
                name: req.body.name,
                description: req.body.description,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock),
                imageUrl: imageUrl,
                category: categoryId,
                createdBy: req.user.id
            };

            console.log('Creating product with data:', productData);

            const product = new Product(productData);
            const newProduct = await product.save();
            
            // Populate category before sending response
            const populatedProduct = await Product.findById(newProduct._id).populate('category');
            
            console.log('Product created successfully:', populatedProduct);
            
            res.status(201).json(populatedProduct);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(400).json({ 
                message: error.message,
                details: error.errors ? Object.values(error.errors).map(e => e.message) : null
            });
        }
    },

    // Update product
    updateProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) { 
                return res.status(404).json({ message: 'Product not found' });
            }

            // Handle category
            let categoryId;
            if (req.body.category) {
                try {
                    const category = await getOrCreateCategoryByName(req.body.category);
                    categoryId = category._id;
                } catch (error) {
                    return res.status(400).json({ message: 'Invalid category' });
                }
            }

            const updates = {
                name: req.body.name || product.name,
                description: req.body.description || product.description,
                price: req.body.price ? parseFloat(req.body.price) : product.price,
                stock: req.body.stock ? parseInt(req.body.stock) : product.stock,
                category: categoryId || product.category
            };

            if (req.file) {
                updates.imageUrl = `/uploads/products/${req.file.filename}`;
                
                // Delete old image if exists
                if (product.imageUrl) {
                    const oldImagePath = path.join(__dirname, '..', product.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                updates,
                { new: true }
            ).populate('category');

            res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete product
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Delete image if exists
            if (product.imageUrl) {
                const imagePath = path.join(__dirname, '..', product.imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await Product.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = productController;