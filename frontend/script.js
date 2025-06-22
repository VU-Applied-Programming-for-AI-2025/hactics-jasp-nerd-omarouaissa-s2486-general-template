document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.getElementById('home-link');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userDisplay = document.getElementById('user-display');

    const homeSection = document.getElementById('home-section');
    const searchResultsSection = document.getElementById('search-results-section');
    const bookDetailSection = document.getElementById('book-detail-section');

    const searchResultsDiv = document.getElementById('search-results');
    const searchQueryDisplay = document.getElementById('search-query-display');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');

    const mostFavoritesList = document.getElementById('most-favorites-list');
    const recommendationsList = document.getElementById('recommendations-list');
    const recommendationGenreSpan = document.getElementById('recommendation-genre');

    const bookDetailContent = document.getElementById('book-detail-content');
    const backToSearchButton = document.getElementById('back-to-search');

    const reviewsList = document.getElementById('reviews-list');
    const reviewRatingInput = document.getElementById('review-rating');
    const reviewMessageInput = document.getElementById('review-message');
    const submitReviewButton = document.getElementById('submit-review-button');
    const updateReviewButton = document.getElementById('update-review-button');
    const deleteReviewButton = document.getElementById('delete-review-button');

    const reviewSortBySelect = document.getElementById('reviewSortBy');
    const reviewOrderBySelect = document.getElementById('reviewOrderBy');
    const applyReviewSortButton = document.getElementById('applyReviewSort');

    const chatButton = document.getElementById('chat-button');
    const chatPopup = document.getElementById('chat-popup');
    const closeChatButton = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat');

    const API_BASE_URL = 'http://127.0.0.1:5000'; // Your Flask backend URL
    let currentSearchQuery = '';
    let currentPage = 1;
    let currentUser = localStorage.getItem('bookbuddy_user_id') || 'guest_user'; // Default user for testing
    let currentBookId = null; // Stores the ID of the book currently being viewed in detail

    // --- Utility Functions ---
    function showSection(section) {
        homeSection.style.display = 'none';
        searchResultsSection.style.display = 'none';
        bookDetailSection.style.display = 'none';
        section.style.display = 'block';
    }

    // --- NEW: Helper to parse URL parameters ---
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    function renderBookCard(book, parentElement) {
        const bookId = book.id;
        const volumeInfo = book.volumeInfo;
        const title = volumeInfo.title || 'No Title';
        const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author';
        const thumbnail = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/100x150?text=No+Cover';

        const card = document.createElement('div');
        card.classList.add('book-card');
        card.innerHTML = `
            <img src="${thumbnail}" alt="${title} cover">
            <h3>${title}</h3>
            <p>${authors}</p>
        `;
        // --- MODIFIED: Navigate to a URL with book_id ---
        card.addEventListener('click', () => {
            // Assuming your main HTML file is 'index.html' or similar
            window.location.href = `index.html?book_id=${bookId}`;
        });
        parentElement.appendChild(card);
    }

    function updateLoginUI() {
        if (currentUser && currentUser !== 'guest_user') {
            userDisplay.textContent = `Welcome, ${currentUser}!`;
            userDisplay.style.display = 'inline';
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline';
        } else {
            userDisplay.style.display = 'none';
            loginButton.style.display = 'inline';
            logoutButton.style.display = 'none';
        }
    }

    // --- API Calls ---

    async function fetchMostFavoritedBooks() {
        try {
            const response = await fetch(`${API_BASE_URL}/most_favorites`);
            const data = await response.json();
            mostFavoritesList.innerHTML = ''; // Clear previous content
            if (data.most_favorites && data.most_favorites.length > 0) {
                for (const bookId of data.most_favorites) {
                    const bookResponse = await fetch(`${API_BASE_URL}/get_book/${bookId}`);
                    const bookData = await bookResponse.json();
                    if (bookData) {
                        renderBookCard(bookData, mostFavoritesList);
                    }
                }
            } else {
                mostFavoritesList.innerHTML = '<p>No favorited books yet.</p>';
            }
        } catch (error) {
            console.error('Error fetching most favorited books:', error);
            mostFavoritesList.innerHTML = '<p>Error loading most favorited books.</p>';
        }
    }

    async function fetchRecommendations() {
        try {
            const response = await fetch(`${API_BASE_URL}/recommendations/${currentUser}`);
            const data = await response.json();
            recommendationsList.innerHTML = ''; // Clear previous content
            if (data.recommendations && data.recommendations.items && data.recommendations.items.length > 0) {
                recommendationGenreSpan.textContent = data.genre || 'General';
                data.recommendations.items.forEach(book => renderBookCard(book, recommendationsList));
            } else {
                recommendationsList.innerHTML = '<p>No recommendations available. Try favoriting some books!</p>';
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            recommendationsList.innerHTML = '<p>Error loading recommendations.</p>';
        }
    }

    async function performSearch(query, page = 1) {
        currentSearchQuery = query;
        currentPage = page;
        showSection(searchResultsSection);
        searchResultsDiv.innerHTML = '<p>Loading search results...</p>';
        searchQueryDisplay.textContent = query;
        currentPageSpan.textContent = `Page ${currentPage}`;

        try {
            const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`);
            const books = await response.json();
            searchResultsDiv.innerHTML = ''; // Clear previous content

            if (books && books.length > 0) {
                books.forEach(book => renderBookCard(book, searchResultsDiv));
            } else {
                searchResultsDiv.innerHTML = '<p>No books found for your search.</p>';
            }
            prevPageButton.disabled = currentPage === 1;
            nextPageButton.disabled = books.length < 10;

        } catch (error) {
            console.error('Error during search:', error);
            searchResultsDiv.innerHTML = '<p>Error loading search results.</p>';
        }
    }

    async function fetchBookDetails(bookId) {
        currentBookId = bookId; // Store the book ID
        // No showSection here, as it's handled by initial page load
        bookDetailContent.innerHTML = '<p>Loading book details...</p>';
        reviewsList.innerHTML = '<p>Loading reviews...</p>';
        submitReviewButton.style.display = 'block';
        updateReviewButton.style.display = 'none';
        deleteReviewButton.style.display = 'none';
        reviewRatingInput.value = '';
        reviewMessageInput.value = '';


        try {
            const response = await fetch(`${API_BASE_URL}/get_book/${bookId}`);
            const book = await response.json();

            if (book && book.volumeInfo) {
                const volumeInfo = book.volumeInfo;
                const title = volumeInfo.title || 'N/A';
                const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'N/A';
                const description = volumeInfo.description || 'No description available.';
                const publishedDate = volumeInfo.publishedDate || 'N/A';
                const pageCount = volumeInfo.pageCount || 'N/A';
                const categories = volumeInfo.categories ? volumeInfo.categories.join(', ') : 'N/A';
                const thumbnail = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/200x300?text=No+Cover';
                const previewLink = volumeInfo.previewLink || '#';

                // Check if book is in user's lists
                const inFavorites = await checkBookInList('favorites', currentUser, bookId);
                const inRead = await checkBookInList('read_books', currentUser, bookId);
                const inWantToRead = await checkBookInList('want_to_reads', currentUser, bookId);

                bookDetailContent.innerHTML = `
                    <img src="${thumbnail}" alt="${title} cover">
                    <div class="book-info">
                        <h2>${title}</h2>
                        <p><strong>Author(s):</strong> ${authors}</p>
                        <p><strong>Published Date:</strong> ${publishedDate}</p>
                        <p><strong>Pages:</strong> ${pageCount}</p>
                        <p><strong>Categories:</strong> ${categories}</p>
                        <p><strong>Description:</strong> ${description}</p>
                        <p><a href="${previewLink}" target="_blank">Read Preview</a></p>
                        <div class="action-buttons">
                            <button id="add-favorite-btn" data-book-id="${bookId}" ${inFavorites ? 'class="remove-button">Remove from Favorites' : 'class="add-button">Add to Favorites'}</button>
                            <button id="add-read-btn" data-book-id="${bookId}" ${inRead ? 'class="remove-button">Remove from Read Books' : 'class="add-button">Add to Read Books'}</button>
                            <button id="add-want-to-read-btn" data-book-id="${bookId}" ${inWantToRead ? 'class="remove-button">Remove from Want to Read' : 'class="add-button">Add to Want to Read'}</button>
                        </div>
                    </div>
                `;

                // Add event listeners for action buttons
                document.getElementById('add-favorite-btn').addEventListener('click', toggleFavorite);
                document.getElementById('add-read-btn').addEventListener('click', toggleReadBook);
                document.getElementById('add-want-to-read-btn').addEventListener('click', toggleWantToRead);
                
                // Call fetchReviewsForBook with current sorting selections from dropdowns (which are set by URL on load)
                fetchReviewsForBook(bookId, reviewSortBySelect.value, reviewOrderBySelect.value);
            } else {
                bookDetailContent.innerHTML = '<p>Book details not found.</p>';
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
            bookDetailContent.innerHTML = '<p>Error loading book details.</p>';
        }
    }

    async function checkBookInList(listType, userId, bookId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${listType}/${userId}`);
            if (!response.ok) return false;
            const data = await response.json();
            return data.book_list_id && data.book_list_id.list.includes(bookId);
        } catch (error) {
            console.error(`Error checking book in ${listType}:`, error);
            return false;
        }
    }

    async function toggleBookInList(listType, bookId, actionButton) {
        if (!currentUser || currentUser === 'guest_user') {
            alert('Please login to add books to your lists.');
            return;
        }
    
        const isAdding = actionButton.classList.contains('add-button');
        const encodedUser = encodeURIComponent(currentUser);
        const encodedBookId = encodeURIComponent(bookId);

        const endpoint = isAdding
            ? `${listType}/${encodedUser}/add/${encodedBookId}`
            : `${listType}/${encodedUser}/delete/${encodedBookId}`;

        const method = 'POST';

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, { method: method });
            if (response.ok) {
                const actionText = isAdding ? 'Added to' : 'Removed from';
                console.log(`${actionText} ${listType}`);
                if (isAdding) {
                    actionButton.classList.remove('add-button');
                    actionButton.classList.add('remove-button');
                    actionButton.textContent = `Remove from ${capitalizeWords(listType.replace('_', ' '))}`;
                } else {
                    actionButton.classList.remove('remove-button');
                    actionButton.classList.add('add-button');
                    actionButton.textContent = `Add to ${capitalizeWords(listType.replace('_', ' '))}`;
                }
                if (listType === 'favorites') {
                    fetchMostFavoritedBooks();
                    fetchRecommendations();
                }
            } else {
                const errorData = await response.json();
                alert(`Failed to update list: ${errorData.error}`);
            }
        } catch (error) {
            console.error(`Error toggling book in ${listType}:`, error);
            alert('An error occurred while updating your list.');
        }
    }

    function capitalizeWords(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function toggleFavorite(event) {
        const bookId = event.target.dataset.bookId;
        toggleBookInList('favorites', bookId, event.target);
    }

    function toggleReadBook(event) {
        const bookId = event.target.dataset.bookId;
        toggleBookInList('read_books', bookId, event.target);
    }

    function toggleWantToRead(event) {
        const bookId = event.target.dataset.bookId;
        toggleBookInList('want_to_reads', bookId, event.target);
    }

    async function fetchReviewsForBook(bookId, sortBy = 'date', orderBy = 'desc') {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews_book/${bookId}?sort_by=${sortBy}&order=${orderBy}`);
            const data = await response.json();
            reviewsList.innerHTML = ''; // Clear previous reviews

            if (data.reviews && data.reviews.length > 0) {
                data.reviews.forEach(review => {
                    const reviewItem = document.createElement('div');
                    reviewItem.classList.add('review-item');
                    const reviewDate = new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                    reviewItem.innerHTML = `
                        <p><strong>User:</strong> ${review.user}</p>
                        <p class="rating"><strong>Rating:</strong> ${review.rating} / 5</p>
                        <p><strong>Message:</strong> ${review.message}</p>
                        <p class="date">Reviewed on: ${reviewDate}</p>
                    `;
                    reviewsList.appendChild(reviewItem);

                    if (review.user === currentUser) {
                        reviewRatingInput.value = review.rating;
                        reviewMessageInput.value = review.message;
                        submitReviewButton.style.display = 'none';
                        updateReviewButton.style.display = 'block';
                        deleteReviewButton.style.display = 'block';
                        
                        if (review.id) { 
                            updateReviewButton.dataset.reviewId = review.id;
                            deleteReviewButton.dataset.reviewId = review.id;
                        } else {
                             console.warn("Review ID not found in backend response for update/delete functionality. Please ensure your backend's /reviews_book/{book_id} route returns 'id' for each review.");
                        }
                    }
                });
            } else {
                reviewsList.innerHTML = '<p>No reviews yet for this book.</p>';
                submitReviewButton.style.display = 'block';
                updateReviewButton.style.display = 'none';
                deleteReviewButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            reviewsList.innerHTML = '<p>Error loading reviews.</p>';
        }
    }

    async function submitReview() {
        const rating = reviewRatingInput.value;
        const message = reviewMessageInput.value;

        if (!currentUser || currentUser === 'guest_user') {
            alert('Please login to submit a review.');
            return;
        }
        if (!currentBookId) {
            alert('No book selected for review.');
            return;
        }
        if (rating === '' || message.trim() === '') {
            alert('Please provide both a rating and a message for your review.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/submit_review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book_id: currentBookId,
                    user: currentUser,
                    rating: parseFloat(rating),
                    message: message.trim()
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.Message);
                // --- MODIFIED: Refresh page after submit ---
                // This will re-read URL params and re-fetch details/reviews
                window.location.reload(); 
            } else {
                alert(`Error: ${data.Error}`);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('An error occurred while submitting your review.');
        }
    }

    async function updateReview() {
        const rating = reviewRatingInput.value;
        const message = reviewMessageInput.value;
        const reviewId = updateReviewButton.dataset.reviewId;

        if (!reviewId) {
            alert('No review selected to update. This might be due to missing review ID from backend.');
            return;
        }
        if (rating === '' || message.trim() === '') {
            alert('Please provide both a rating and a message to update your review.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/update_review/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: parseFloat(rating),
                    message: message.trim()
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.Message);
                // --- MODIFIED: Refresh page after update ---
                window.location.reload();
            } else {
                alert(`Error: ${data.Error}`);
            }
        } catch (error) {
            console.error('Error updating review:', error);
            alert('An error occurred while updating your review.');
        }
    }

    async function deleteReview() {
        if (!currentUser || currentUser === 'guest_user') {
            alert('Please login to delete a review.');
            return;
        }
        if (!currentBookId) {
            alert('No book selected.');
            return;
        }
        
        const reviewIdToDelete = deleteReviewButton.dataset.reviewId;
        if (!reviewIdToDelete) {
            alert('Cannot delete review: Review ID not found.');
            return;
        }

        if (!confirm('Are you sure you want to delete your review?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/delete_review/${reviewIdToDelete}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.Message);
                // --- MODIFIED: Refresh page after delete ---
                window.location.reload();
            } else {
                alert(`Error: ${data.Error}`);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('An error occurred while deleting your review.');
        }
    }

    // --- Chat Functions ---
    function openChat() {
        chatPopup.style.display = 'flex';
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function closeChat() {
        chatPopup.style.display = 'none';
    }

    function appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        if (sender === 'user') {
            messageElement.textContent = message;
        } else {
            let formattedMessage = message;
            formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
            messageElement.innerHTML = formattedMessage;
        }

        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    async function sendChatMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        appendMessage(message, 'user');
        chatInput.value = '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message, user_id: currentUser })
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                appendMessage(data.response, 'bot');
            } else {
                appendMessage(`Error: ${data.error || 'Could not get response from AI.'}`, 'bot');
            }
        } catch (error) {
            console.error('Error sending chat message:', error);
            appendMessage('Error: Could not connect to the AI.', 'bot');
        }
    }

    // --- Event Listeners ---
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        // --- MODIFIED: Navigate to base URL for home ---
        window.location.href = 'index.html'; // Or just '/', depending on your server config
    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        } else {
            alert('Please enter a search query.');
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            performSearch(currentSearchQuery, currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', () => {
        performSearch(currentSearchQuery, currentPage + 1);
    });

    backToSearchButton.addEventListener('click', () => {
        // --- MODIFIED: Navigate to a URL for search results (simpler than reconstructing search state) ---
        // This will cause a full refresh and lose current search results/pagination state if not handled by URL params
        // For simplicity with full refresh, this goes back to home or a generic search page.
        // If you want to preserve search results, you'd need to encode search query and page in URL.
        window.location.href = 'index.html'; // Or a dedicated search page URL
    });

    loginButton.addEventListener('click', async () => {
        const userId = prompt("Enter your user ID (e.g., 'user123'):");
        if (userId) {
            localStorage.setItem('bookbuddy_user_id', userId);
            currentUser = userId;
            const encodedCurrentUserForInitialization = encodeURIComponent(currentUser);

            const listTypesToInitialize = ['favorites', 'read_books', 'want_to_reads'];
            for (const listType of listTypesToInitialize) {
                try {
                    const response = await fetch(`${API_BASE_URL}/${listType}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user: encodedCurrentUserForInitialization, book_list_id: { "list": [] } })
                    });
                    if (response.ok) {
                        console.log(`Successfully initialized empty ${listType} list for ${currentUser}.`);
                    } else {
                        console.warn(`Attempted to initialize ${listType} for ${currentUser}, but received status ${response.status}. Assuming list already exists or other non-critical issue:`, errorData.error || response.statusText);
                    }
                } catch (error) {
                    console.error(`Network error during ${listType} initialization for ${currentUser}:`, error);
                }
            }
            updateLoginUI();
            fetchMostFavoritedBooks();
            fetchRecommendations();
            alert(`Logged in as ${currentUser}`);
            window.location.reload(); // Reload after login to apply user state everywhere
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('bookbuddy_user_id');
        currentUser = 'guest_user';
        updateLoginUI();
        fetchMostFavoritedBooks();
        fetchRecommendations();
        alert('Logged out.');
        window.location.reload(); // Reload after logout
    });

    submitReviewButton.addEventListener('click', submitReview);
    updateReviewButton.addEventListener('click', updateReview);
    deleteReviewButton.addEventListener('click', deleteReview);

    // --- MODIFIED: Event Listener for Apply Sort Button to cause full page refresh ---
    applyReviewSortButton.addEventListener('click', () => {
        if (currentBookId) {
            // Get the current base URL (e.g., 'index.html' or '/')
            const baseUrl = window.location.pathname.split('/').pop() || 'index.html'; // Get the HTML file name
            const newUrl = `${baseUrl}?book_id=${currentBookId}&sort_by=${reviewSortBySelect.value}&order=${reviewOrderBySelect.value}`;
            window.location.href = newUrl; // This causes a full page reload
        } else {
            console.warn("No book ID available to sort reviews.");
        }
    });
    // --- END MODIFIED ---

    // Chat event listeners
    chatButton.addEventListener('click', openChat);
    closeChatButton.addEventListener('click', closeChat);
    sendChatButton.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // --- NEW: Initial Load Logic based on URL parameters ---
    const urlBookId = getUrlParameter('book_id');
    const urlSortBy = getUrlParameter('sort_by');
    const urlOrderBy = getUrlParameter('order');

    if (urlBookId) {
        // If a book_id is in the URL, go directly to book detail and load it
        currentBookId = urlBookId;
        
        // Set dropdowns if parameters are in URL, otherwise use default from HTML
        if (urlSortBy && reviewSortBySelect) reviewSortBySelect.value = urlSortBy;
        if (urlOrderBy && reviewOrderBySelect) reviewOrderBySelect.value = urlOrderBy;
        
        showSection(bookDetailSection); // Display the book detail section
        fetchBookDetails(currentBookId); // Fetch book details and reviews based on dropdowns
    } else {
        // Default to home section if no book_id in URL
        showSection(homeSection);
        fetchMostFavoritedBooks();
        fetchRecommendations();
    }
    // --- END NEW ---

    updateLoginUI(); // Always update UI on load
});