const API_BASE = 'http://localhost:5000';
let currentUserId = 'user123';
let currentReviewBookId = null;
let currentReviewRating = 0;
let isEditingReview = false;
let currentReviewId = null;
let userFavorites = new Set();
let userReviews = {};


/*
TODO:
-fix reviews
-update the UI, make it more appealing and more modern
-fix book modal

*/


// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setUserId(false);
    loadHomeData();
    loadUserLists();
    initializeStarRating();
});

// Star rating functionality
function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            currentReviewRating = parseInt(this.dataset.rating);
            updateStarDisplay();
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });

    document.querySelector('.rating-container').addEventListener('mouseleave', function() {
        updateStarDisplay();
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function updateStarDisplay() {
    highlightStars(currentReviewRating);
}

// User management
function setUserId(showmsg=true) {
    const input = document.getElementById('userIdInput');
    const newUserId = input.value.trim();
    if (!newUserId) {
        showMessage('Please enter a valid user ID', 'error');
        return;
    }
    
    currentUserId = newUserId;
    document.getElementById('currentUser').textContent = `Current User: ${currentUserId}`;
    
    // Clear existing data
    userFavorites.clear();
    userReviews = {};

    loadUserLists();
    loadHomeData();
    if (showmsg){ 
        showMessage('User changed successfully!', 'success');
    }
}

function deleteUser() {
    // if (!confirm(`Are you sure you want to delete the profile for ${currentUserId}? This action cannot be undone.`)) {
    //     return;
    // }

    const deletePromises = [
        fetch(`${API_BASE}/favorites/${currentUserId}`, { method: 'DELETE' }).catch(() => {}),
        fetch(`${API_BASE}/read_books/${currentUserId}`, { method: 'DELETE' }).catch(() => {}),
        fetch(`${API_BASE}/want_to_reads/${currentUserId}`, { method: 'DELETE' }).catch(() => {}),
        fetch(`${API_BASE}/reviews/${currentUserId}`, { method: 'DELETE' }).catch(() => {})
    ];

    Promise.allSettled(deletePromises)
        .then(() => {
            showMessage('User profile deleted successfully!', 'success');
            // Reset to default user
            currentUserId = 'user123';
            document.getElementById('userIdInput').value = currentUserId;
            document.getElementById('currentUser').textContent = `Current User: ${currentUserId}`;
            userFavorites.clear();
            userReviews = {};
            loadUserLists();
            loadHomeData();
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            showMessage('Error deleting user profile', 'error');
        });
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
    else if (sectionId === 'reviews') loadUserReviews();
    else if (sectionId === 'home') loadHomeData();
}

// Search functionality
function searchBooks() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        showMessage('Please enter a search term', 'error');
        return;
    }

    showSection('search');
    document.querySelector('[onclick="showSection(\'search\')"]').classList.add('active');
    
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<div class="loading">Searching...</div>';

    // Build search URL with filters
    let searchUrl = `${API_BASE}/search/${encodeURIComponent(query.replace(" ", "+"))}`;
    
    const genre = document.getElementById('genreFilter').value;
    const language = document.getElementById('languageFilter').value;
    const sort = document.getElementById('sortFilter').value;
    
    if (genre) searchUrl += `+subject:'${encodeURIComponent(genre)}'`;
    if (language) searchUrl += `&langRestrict=${language}`;
    if (sort !== 'relevance') searchUrl += `&orderBy=${sort}`;

    fetch(searchUrl)
        .then(response => response.json())
        .then(books => {
            displayBooks(books, 'searchResults');
        })
        .catch(error => {
            console.error('Search error:', error);
            resultsDiv.innerHTML = '<div class="error">Error searching books. Please try again.</div>';
        });
    console.log(searchUrl)
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
            displayBooks(books.slice(0, 10), 'recommendedBooks');
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
    loadUserReviews();
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
                // Store favorite book IDs for duplicate checking
                userFavorites.clear();
                books.forEach(book => userFavorites.add(book.id));
                displayBooks(books, 'favoriteBooks', true);
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
                displayBooks(books, 'readBooks', true);
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
                displayBooks(books, 'wantToReadBooks', true);
            }
        })
        .catch(error => {
            console.error('Error loading want to read books:', error);
            document.getElementById('wantToReadBooks').innerHTML = '<div class="error">Error loading want to read books</div>';
        });
}

function loadUserReviews() {
    fetch(`${API_BASE}/reviews_user/${currentUserId}`)
        .then(response => {
            if (response.status === 404) {
                document.getElementById('userReviews').innerHTML = '<p style="text-align: center; color: #666;">No reviews yet</p>';
                return;
            }
            return response.json();
        })
        .then(reviews => {
            reviews = reviews.reviews
            // if (reviews) {
                displayReviews(reviews);
            // }
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
            document.getElementById('userReviews').innerHTML = '<div class="error">Error loading reviews</div>';
        });
}


// Display functions
function displayBooks(books, containerId, showRemoveButton = false) {
    const container = document.getElementById(containerId);
    
    if (!books || books.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No books found</p>';
        return;
    }

    container.innerHTML = books.map(book => {
        const volumeInfo = book.volumeInfo || {};
        const title = volumeInfo.title || 'Unknown Title';
        const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author';
        const thumbnail = volumeInfo.imageLinks?.thumbnail || 'no_cover.png';
        const bookId = book.id;

        let actionButtons = `
            <button class="action-btn favorite" onclick="addToList('favorites', '${bookId}')" title="Add to Favorites">❤️</button>
            <button class="action-btn read" onclick="addToList('read_books', '${bookId}')" title="Mark as Read">✅</button>
            <button class="action-btn want-to-read" onclick="addToList('want_to_reads', '${bookId}')" title="Want to Read">📖</button>
            <button class="action-btn review" onclick="openReviewModal('${bookId}')" title="Write Review">⭐</button>
        `;

        if (showRemoveButton) {
            const listType = containerId === 'favoriteBooks' ? 'favorites' : 
                            containerId === 'readBooks' ? 'read_books' : 'want_to_reads';
            actionButtons += `<button class="action-btn remove" onclick="removeFromList('${listType}', '${bookId}')" title="Remove">🗑️</button>`;
        }
        
        // <div onclick="openBookModal('${title}', '${thumbnail}', '${authors}', '${encodeURIComponent(description)}')">
        
        return `
            <div class="book-card">
                <div onclick="openBookModal('${bookId}')">
                    <img src="${thumbnail}" alt="${title}" class="book-cover" onerror="this.onerror=null;this.src='no_cover.png';">
                    <div class="book-title">${title}</div>
                    <div class="book-author">${authors}</div>
                </div>
                <div class="book-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
}

function displayReviews(reviews) {
    const container = document.getElementById('userReviews');
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No reviews yet</p>';
        return;
    }

    // Store reviews for quick access
    userReviews = {};
    reviews.forEach(review => {
        userReviews[review.book_id] = review;
    });

    

    container.innerHTML = reviews.map(review => {
        // var obj;
        // fetch(`${API_BASE}/get_book/${review.book_id}`)
        // .then(res => res.json())
        // .then(data => {
        //     obj = data;
        // }).then(() => {
        //     console.log(obj);
        
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        return `
            <div class="review-item">
                <div class="review-header">
                    <div>
                        <strong>${review.title}</strong>
                        <div class="review-rating">${stars} (${review.rating}/5)</div>
                    </div>
                    <div class="review-actions">
                        <button class="review-btn edit" onclick="editReview('${review.book_id}')">Edit</button>
                        <button class="review-btn delete" onclick="deleteReview('${review.book_id}')">Delete</button>
                    </div>
                </div>
                <div class="review-text">${review.message}</div>
            </div>
        `;
    }).join('');
}

// List management functions
function addToList(listType, bookId) {
    // Check for duplicates in favorites
    if (listType === 'favorites' && userFavorites.has(bookId)) {
        showMessage('This book is already in your favorites!', 'error');
        return;
    }

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
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add book');
            }
            return response.json();
        })
        .then(data => {
            showMessage('Book added successfully!', 'success');
            
            // Update local favorites set
            if (listType === 'favorites') {
                userFavorites.add(bookId);
            }
            
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
}

function removeFromList(listType, bookId) {
    // if (!confirm('Are you sure you want to remove this book?')) {
    //     return;
    // }

    fetch(`${API_BASE}/${listType}/${currentUserId}/delete/${bookId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to remove book');
        }
        return response.json();
    })
    .then(data => {
        showMessage('Book removed successfully!', 'success');
        
        // Update local favorites set
        if (listType === 'favorites') {
            userFavorites.delete(bookId);
        }
        
        // Refresh the current list
        if (listType === 'favorites') {
            loadFavorites();
        } else if (listType === 'read_books') {
            loadReadBooks();
        } else if (listType === 'want_to_reads') {
            loadWantToReadBooks();
        }
    })
    .catch(error => {
        console.error('Error removing book:', error);
        showMessage('Error removing book', 'error');
    });
}

// Review functions
function openReviewModal(bookId) {
    currentReviewBookId = bookId;
    isEditingReview = false;
    currentReviewId = null;
    currentReviewRating = 0;
    
    document.getElementById('reviewModalTitle').textContent = 'Write a Review';
    document.getElementById('reviewText').value = '';
    updateStarDisplay();
    document.getElementById('reviewModal').style.display = 'block';
}

function editReview(bookId) {
    const review = userReviews[bookId];
    if (!review) return;

    console.log(review)

    currentReviewBookId = bookId;
    isEditingReview = true;
    currentReviewId = review.id;
    currentReviewRating = review.rating;
    
    document.getElementById('reviewModalTitle').textContent = 'Edit Review';
    document.getElementById('reviewText').value = review.message;
    updateStarDisplay();
    document.getElementById('reviewModal').style.display = 'block';
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    currentReviewBookId = null;
    currentReviewRating = 0;
    isEditingReview = false;
    currentReviewId = null;
}

function saveReview() {
    const reviewText = document.getElementById('reviewText').value.trim();
    
    if (!reviewText) {
        showMessage('Please write a review', 'error');
        return;
    }
    
    if (currentReviewRating === 0) {
        showMessage('Please select a rating', 'error');
        return;
    }

    const reviewData = {
        book_id: currentReviewBookId,
        user: currentUserId,
        rating: currentReviewRating,
        message: reviewText
    };

    console.log(isEditingReview, currentReviewId)

    let url = `${API_BASE}/submit_review`;
    let method = 'POST';

    if (isEditingReview && currentReviewId) {
        url = `${API_BASE}/update_review/${currentReviewId}`;
        method = 'PUT';
    }

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save review');
        }
        return response.json();
    })
    .then(data => {
        showMessage(isEditingReview ? 'Review updated successfully!' : 'Review saved successfully!', 'success');
        closeReviewModal();
        loadUserReviews();
        console.log(data)
    })
    .catch(error => {
        console.error('Error saving review:', error);
        showMessage('Error saving review', 'error');
    });
}

function deleteReview(bookId) {
    // if (!confirm('Are you sure you want to delete this review?')) {
    //     return;
    // }
    let method = "DELETE"

    url = `${API_BASE}/delete_review`
    const delete_data = {
        user: currentUserId,
        book_id: bookId
    }
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(delete_data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete review');
        }
        showMessage('Review deleted successfully!', 'success');
        loadUserReviews();
    })
    .catch(error => {
        console.error('Error deleting review:', error);
        showMessage('Error deleting review', 'error');
    });
}

// function openBookModal(title, thumbnail, authors, description){
function openBookModal(bookId){
    fetch(`${API_BASE}/get_book/${bookId}`)
    .then(response => response.json())
    .then((json) => {
        document.getElementById('bookModalTitle').textContent = json.volumeInfo.title;
        document.getElementById('bookThumbnail').src = json.volumeInfo.imageLinks?.thumbnail || 'no_cover.png';;
        document.getElementById('bookAuthors').textContent = json.volumeInfo.authors ? json.volumeInfo.authors.join(', ') : 'Unknown Author';;
        document.getElementById('bookDescription').innerHTML = json.volumeInfo.description;
    });
    loadBookReviews(bookId);

    document.getElementById('bookModal').style.display = 'block';
}

function closeBookModal(){
    document.getElementById('bookModal').style.display = 'none';
}

function loadBookReviews(bookId) {
    const reviewsContainer = document.getElementById("bookReviewsContainer");
    reviewsContainer.innerHTML = '<div class="loading">Loading reviews...</div>';

    fetch(`${API_BASE}/reviews_book/${encodeURIComponent(bookId)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load reviews.");
            }
            return response.json();
        })
        .then(bookReviews => {
            bookReviews = bookReviews.reviews
            if (!bookReviews || bookReviews.length === 0) {
                reviewsContainer.innerHTML = "<p>No reviews yet for this book.</p>";
                return;
            }

            reviewsContainer.innerHTML = "";
            bookReviews.forEach(review => {
                const reviewElement = document.createElement("div");
                reviewElement.classList.add("review-item");

                reviewElement.innerHTML = `
                    <div class="review-header">
                        <span class="review-user"><b>${review.user || "Anonymous"}</b></span>
                        <span class="review-rating">${"★".repeat(review.rating)}</span>
                    </div>
                    <div class="review-text">${review.message || ""}</div>
                `;
                reviewsContainer.appendChild(reviewElement);
            });
        })
        .catch(error => {
            console.error(error);
            reviewsContainer.innerHTML = `<div class="error">Failed to load reviews.</div>`;
        });
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
        messagesDiv.innerHTML += `<div class="message bot">${data.response.replaceAll("*", "")}</div>`;
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
    messageDiv.style.zIndex = '1001';
    messageDiv.style.padding = '15px 20px';
    messageDiv.style.borderRadius = '15px';
    messageDiv.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
    messageDiv.style.backdropFilter = 'blur(10px)';
    messageDiv.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Event listeners
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBooks();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const reviewModal = document.getElementById('reviewModal');
    const bookModal = document.getElementById('bookModal');
    if (event.target === reviewModal) {
        closeReviewModal();
    }
    else if (event.target === bookModal){
        closeBookModal();
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);