const API_BASE = 'http://127.0.0.1:5000';
let currentUserId = 'user123';

/*
TODO:
-Add reviews
-fix user changing
-update the UI, make it more appealing and more modern
-add search filters
-allow users to delete user_profiles
-make sure you cannot have one book twice in your favorites
*/


// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadHomeData();
    loadUserLists();
});

// User management
function setUserId() {
    const input = document.getElementById('userIdInput');
    currentUserId = input.value.trim() || 'user123';
    document.getElementById('currentUser').textContent = `Current User: ${currentUserId}`;
    loadUserLists();
    loadHomeData();
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');

    // Load data when switching sections
    if (sectionId === 'favorites') loadFavorites();
    else if (sectionId === 'read') loadReadBooks();
    else if (sectionId === 'want-to-read') loadWantToReadBooks();
    else if (sectionId === 'home') loadHomeData();
}

// Search functionality
function searchBooks() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    showSection('search');
    document.querySelector('[onclick="showSection(\'search\')"]').classList.add('active');
    
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<div class="loading">Searching...</div>';

    response2 = fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(books => {
            displayBooks(books, 'searchResults');
        })
        .catch(error => {
            console.error('Search error:', error);
            resultsDiv.innerHTML = '<div class="error">Error searching books. Please try again.</div>';
        });
    console.log(response2)
}

// Load home data
function loadHomeData() {
    loadMostFavorites();
    loadRecommendations();
}

function loadMostFavorites() {
    fetch(`${API_BASE}/most_favorites`)
        .then(response => response.json())
        .then(data => {
            const bookIds = data.most_favorites.slice(0, 6);
            if (bookIds.length === 0) {
                document.getElementById('popularBooks').innerHTML = '<p style="text-align: center; color: #666;">No popular books yet</p>';
                return;
            }
            
            const promises = bookIds.map(id => 
                fetch(`${API_BASE}/get_book/${id}`).then(r => r.json())
            );
            
            Promise.all(promises)
                .then(books => {
                    displayBooks(books, 'popularBooks');
                })
                .catch(error => {
                    console.error('Error loading popular books:', error);
                    document.getElementById('popularBooks').innerHTML = '<div class="error">Error loading popular books</div>';
                });
        })
        .catch(error => {
            console.error('Error loading most favorites:', error);
            document.getElementById('popularBooks').innerHTML = '<div class="error">Error loading popular books</div>';
        });
}

function loadRecommendations() {
    fetch(`${API_BASE}/recommendations/${currentUserId}`)
        .then(response => response.json())
        .then(data => {
            const books = data.recommendations.items || [];
            displayBooks(books.slice(0, 6), 'recommendedBooks');
        })
        .catch(error => {
            console.error('Error loading recommendations:', error);
            document.getElementById('recommendedBooks').innerHTML = '<div class="error">Error loading recommendations</div>';
        });
}

// Load user lists
function loadUserLists() {
    loadFavorites();
    loadReadBooks();
    loadWantToReadBooks();
}

function loadFavorites() {
    fetch(`${API_BASE}/favorite_books/${currentUserId}`)
        .then(response => {
            if (response.status === 404) {
                document.getElementById('favoriteBooks').innerHTML = '<p style="text-align: center; color: #666;">No favorite books yet</p>';
                return;
            }
            return response.json();
        })
        .then(books => {
            if (books) {
                displayBooks(books, 'favoriteBooks');
            }
        })
        .catch(error => {
            console.error('Error loading favorites:', error);
            document.getElementById('favoriteBooks').innerHTML = '<div class="error">Error loading favorites</div>';
        });
}

function loadReadBooks() {
    fetch(`${API_BASE}/read_book_objects/${currentUserId}`)
        .then(response => {
            if (response.status === 404) {
                document.getElementById('readBooks').innerHTML = '<p style="text-align: center; color: #666;">No read books yet</p>';
                return;
            }
            return response.json();
        })
        .then(books => {
            if (books) {
                displayBooks(books, 'readBooks');
            }
        })
        .catch(error => {
            console.error('Error loading read books:', error);
            document.getElementById('readBooks').innerHTML = '<div class="error">Error loading read books</div>';
        });
}

function loadWantToReadBooks() {
    fetch(`${API_BASE}/want_to_read_books/${currentUserId}`)
        .then(response => {
            if (response.status === 404) {
                document.getElementById('wantToReadBooks').innerHTML = '<p style="text-align: center; color: #666;">No want to read books yet</p>';
                return;
            }
            return response.json();
        })
        .then(books => {
            if (books) {
                displayBooks(books, 'wantToReadBooks');
            }
        })
        .catch(error => {
            console.error('Error loading want to read books:', error);
            document.getElementById('wantToReadBooks').innerHTML = '<div class="error">Error loading want to read books</div>';
        });
}

// Display books
function displayBooks(books, containerId) {
    const container = document.getElementById(containerId);
    
    if (!books || books.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No books found</p>';
        return;
    }

    container.innerHTML = books.map(book => {
        const volumeInfo = book.volumeInfo || {};
        const title = volumeInfo.title || 'Unknown Title';
        const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author';
        const thumbnail = volumeInfo.imageLinks?.thumbnail || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="193" fill="%23ddd"><rect width="128" height="193" fill="%23f8f9fa"/><text x="64" y="100" text-anchor="middle" fill="%23666" font-size="12">No Image</text></svg>';
        const bookId = book.id;

        return `
            <div class="book-card">
                <img src="${thumbnail}" alt="${title}" class="book-cover" onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"128\\" height=\\"193\\" fill=\\"%23ddd\\"><rect width=\\"128\\" height=\\"193\\" fill=\\"%23f8f9fa\\"/><text x=\\"64\\" y=\\"100\\" text-anchor=\\"middle\\" fill=\\"%23666\\" font-size=\\"12\\">No Image</text></svg>'">
                <div class="book-title">${title}</div>
                <div class="book-author">${authors}</div>
                <div class="book-actions">
                    <button class="action-btn favorite" onclick="addToList('favorites', '${bookId}')">❤️</button>
                    <button class="action-btn read" onclick="addToList('read_books', '${bookId}')">✅</button>
                    <button class="action-btn want-to-read" onclick="addToList('want_to_reads', '${bookId}')">📖</button>
                </div>
            </div>
        `;
    }).join('');
}

// Add book to list
function addToList(listType, bookId) {
    // First check if user exists, if not create them
    fetch(`${API_BASE}/${listType}/${currentUserId}`)
        .then(response => {
            if (response.status === 404) {
                // Create new list for user
                return fetch(`${API_BASE}/${listType}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: currentUserId,
                        book_list_id: { list: [] }
                    })
                });
            }
            return response;
        })
        .then(() => {
            // Add book to list
            return fetch(`${API_BASE}/${listType}/${currentUserId}/add/${bookId}`, {
                method: 'POST'
            });
        })
        .then(response => response.json())
        // .then(data => {
        //     console.log(data.book_list_id)
        //     const bookList = data.book_list_id.list || [];
        //     console.log(bookList)
        //     console.log(bookId in bookList)

        //     const isBookInList = bookList.includes(bookId);
        //     console.log(isBookInList)

        //     if (isBookInList) {
        //         // Book exists, remove it
        //         return fetch(`${API_BASE}/${listType}/${currentUserId}/delete/${bookId}`, {
        //             method: 'POST'
        //         }).then(() => {
        //             showMessage('Book removed from list.', 'info');
        //         });
        //     } else {
        //         // Book does not exist, add it
        //         return fetch(`${API_BASE}/${listType}/${currentUserId}/add/${bookId}`, {
        //             method: 'POST'
        //         }).then(() => {
        //             showMessage('Book added successfully!', 'success');
        //         });
        //     }
        // })
        .then(data => {
            showMessage('Book added successfully!', 'success');
            // Refresh the current list if we're viewing it
            if (listType === 'favorites' && document.getElementById('favorites').classList.contains('active')) {
                loadFavorites();
            } else if (listType === 'read_books' && document.getElementById('read').classList.contains('active')) {
                loadReadBooks();
            } else if (listType === 'want_to_reads' && document.getElementById('want-to-read').classList.contains('active')) {
                loadWantToReadBooks();
            }
        })
        .catch(error => {
            console.error('Error adding book:', error);
            showMessage('Error adding book. It might already be in your list.', 'error');
        });

    // setUserId();
}

// Chat functionality
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const messagesDiv = document.getElementById('chatMessages');
    
    // Add user message
    messagesDiv.innerHTML += `<div class="message user">${message}</div>`;
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Send to API
    fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            user_id: currentUserId
        })
    })
    .then(response => response.json())
    .then(data => {
        messagesDiv.innerHTML += `<div class="message bot">${data.response}</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    })
    .catch(error => {
        console.error('Chat error:', error);
        messagesDiv.innerHTML += `<div class="message bot">Sorry, I'm having trouble responding right now. Please try again.</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Utility functions
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = text;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.padding = '15px 20px';
    messageDiv.style.borderRadius = '10px';
    messageDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Search on enter key
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBooks();
    }
});