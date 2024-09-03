const express = require('express');
const db = require('./utils/config');
const cors = require('cors');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const app = express();
app.use(cors());
const port = 3001;

app.use(express.json());

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory to save images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Rename file to avoid conflicts
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

app.get('/products', async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM products');
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
});

// Route to handle product creation with file upload and validation
app.post(
    '/products',
    upload.single('img'), // Multer middleware to handle single image upload
    [
        // Validation rules for other fields
        body('name').isString().notEmpty().withMessage('Name is required and should be a string.'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
        body('description').isString().isLength({ min: 20 }).withMessage('Description should be at least 20 characters long.'),
        body('qty').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer.')
    ],
    async (req, res) => {
        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if file was uploaded successfully
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        try {
            const { name, price, description, qty } = req.body;
            const imgPath = req.file.path; // Get the path of the uploaded file

            // Insert into the database
            const [result] = await db.promise().query(
                'INSERT INTO products (name, img, price, description, qty) VALUES (?,?,?,?,?)',
                [name, imgPath, price, description, qty]
            );

            res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
);

app.get('/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const [results] = await db.promise().query('SELECT * FROM products WHERE id = ?', [productId]);
        
        // Check if the product was found
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ message: error.message });
    }
});


app.listen(port, () => {
    console.log("Server running on port", port);
});
