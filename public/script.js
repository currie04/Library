document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById("book_display");
    const addBookButton = document.getElementById('addBookButton');
    const addBookForm = document.getElementById('bookForm');

    // Show the form when the button is clicked
    addBookButton.addEventListener('click', () => {
        if (addBookForm.style.display === 'none') {
            addBookForm.style.display = 'block';
        } else {
            addBookForm.style.display = 'none';
        }
    });

    // Fetch books from the backend
    function fetchBooks() {
        fetch('/books')
            .then(response => response.json())
            .then(data => {
                Library.length = 0;
                data.forEach(bookData => {
                    Library.push(new Book(bookData.title, bookData.author, bookData.pages, bookData.read, bookData._id));
                });
                displayBooks();
            })
            .catch(error => console.error('Error fetching books:', error));
    }

    // Display books
    function displayBooks() {
        grid.innerHTML = ""; // Clear the grid before displaying
        Library.forEach((book, index) => {
            let card = document.createElement("div");
            card.className = "card";
            grid.appendChild(card);

            let title = document.createElement("p");
            title.className = "attribute";
            title.textContent = `Title: ${book.title}`;
            card.appendChild(title);

            let author = document.createElement("p");
            author.className = "attribute";
            author.textContent = `Author: ${book.author}`;
            card.appendChild(author);

            let pages = document.createElement("p");
            pages.className = "attribute";
            pages.textContent = `Number of pages: ${book.pages}`;
            card.appendChild(pages);

            let read = document.createElement("p");
            read.className = "attribute";
            read.textContent = book.read ? "Read" : "Not read yet";
            card.appendChild(read);

            // Add toggle read status button
            let toggleReadButton = document.createElement("button");
            toggleReadButton.textContent = "Toggle Read Status";
            toggleReadButton.setAttribute("data-id", book.id); // Set the data-id attribute
            toggleReadButton.className = "toggleReadButton";
            card.appendChild(toggleReadButton);

            // Add remove button
            let removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.setAttribute("data-id", book.id); // Set the data-id attribute
            removeButton.className = "removeButton";
            card.appendChild(removeButton);
        });

        // Attach event listeners to toggle read buttons
        const toggleReadButtons = document.querySelectorAll(".toggleReadButton");
        toggleReadButtons.forEach(button => {
            button.addEventListener("click", function() {
                const id = this.getAttribute("data-id");
                toggleReadStatus(id);
            });
        });

        // Attach event listeners to all remove buttons
        const removeButtons = document.querySelectorAll(".removeButton");
        removeButtons.forEach(button => {
            button.addEventListener("click", function() {
                const id = this.getAttribute("data-id");
                removeBookFromLibrary(id);
            });
        });
    }

    // Toggle read status of a book
    function toggleReadStatus(id) {
        const book = Library.find(book => book.id === id);
        if (book) {
            book.toggleReadStatus();
            fetch(`/books/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ read: book.read })
            })
            .then(() => displayBooks())
            .catch(error => console.error('Error updating book:', error));
        }
    }

    // Add a new book to the library
    function addBookToLibrary(title, author, pages, read) {
        const newBook = { title, author, pages, read };
        fetch('/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        })
        .then(response => response.json())
        .then(data => {
            Library.push(new Book(data.title, data.author, data.pages, data.read, data._id));
            displayBooks();
            addBookForm.style.display = 'none'; // Hide the form after submission
        })
        .catch(error => console.error('Error adding book:', error));
    }

    // Remove a book from the library
    function removeBookFromLibrary(id) {
        fetch(`/books/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            const bookIndex = Library.findIndex(book => book.id === id);
            Library.splice(bookIndex, 1);
            displayBooks();
        })
        .catch(error => console.error('Error removing book:', error));
    }

    // Initialize library on page load
    fetchBooks();

    // Add event listener for form submission
    addBookForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const pages = parseInt(document.getElementById('pages').value);
        const read = document.getElementById('read').checked;
        addBookToLibrary(title, author, pages, read);
    });
});

// Constructor for a book
function Book(title, author, pages, read, id) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
    this.id = id; // Add id property

    this.info = function() {
        let n = "";
        if (read) {
            n = "read";
        } else {
            n = "not read yet";
        }
    }
}

// Add a method to toggle the read status to the Book prototype
Book.prototype.toggleReadStatus = function() {
    this.read = !this.read;
}

// Initialize an empty library array
const Library = [];
