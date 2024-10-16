const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config;
const app = express();
const port = process.env.PORT || 3000;


// Connect to MongoDB Atlas
const mongoURI = process.env.MONGODB_URI
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define book schema with validation
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    pages: { type: Number, required: true },
    read: { type: Boolean, default: false }
});

// Book model
const Book = mongoose.model('Book', bookSchema);

// Create a book
app.post('/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        const newBook = await book.save();
        res.status(201).send(newBook);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Retrieve all books
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find({});
        res.status(200).send(books);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete a book
app.delete('/books/:id', async (req, res) => {
    try {
        await Book.findByIdAndRemove(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).send(err);
    }
});

// Serve the HTML file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
