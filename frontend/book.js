const BACKEND_URL = "http://127.0.0.1:5000";

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function loadBook() {
  const bookId = getQueryParam('id');
  if (!bookId) return;

  // Fetch book details from backend
  const res = await fetch(`${BACKEND_URL}/get_book/${bookId}`);
  const book = await res.json();

  // Display book details
  const detailsDiv = document.getElementById('book-details');
  const title = book.volumeInfo?.title || 'No Title';
  const authors = book.volumeInfo?.authors?.join(', ') || 'Unknown Author';
  const description = book.volumeInfo?.description || 'No description available.';
  let imgSrc = "images/placeholder.jpg";
  if (book.volumeInfo?.imageLinks?.thumbnail) {
    imgSrc = book.volumeInfo.imageLinks.thumbnail.replace(/^http:\/\//i, 'https://');
  }

  // Set background image and overlay
  document.body.style.backgroundImage = `url('${imgSrc}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.position = 'relative';
  // Add overlay if not already present
  if (!document.getElementById('bg-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'bg-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(30, 24, 18, 0.82)'; // dark academia semi-transparent
    overlay.style.zIndex = 0;
    overlay.style.pointerEvents = 'none';
    document.body.prepend(overlay);
  }
  // Ensure all main content is above overlay
  document.body.querySelectorAll('a, #book-details, #reviews-section').forEach(el => {
    el.style.position = 'relative';
    el.style.zIndex = 1;
  });

  detailsDiv.innerHTML = `
    <div class="sidebar">
      <a href="index.html">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
      <div class="sidebar-dropdown">
        <button id="dropdown-btn" class="sidebar-dropbtn">Reviews &#9654;</button>
        <div id="dropdown-content" class="sidebar-dropdown-content">
          <button id="open-review-popup" class="popup-btn">Leave a Review</button>
          <button id="open-reviews-popup" class="popup-btn">See All Reviews</button>
        </div>
      </div>
      <div class="sidebar-actions">
        <button id="add-favorite" class="sidebar-action-btn">Add to Favorites</button>
        <button id="add-read" class="sidebar-action-btn">Mark as Read</button>
        <button id="add-want" class="sidebar-action-btn">Want to Read</button>
      </div>
    </div>
    <div class="book-main-layout">
      <div class="book-main-left">
        <img src="${imgSrc}" alt="${title}" class="book-main-cover">
      </div>
      <div class="book-main-right">
        <h1>${title}</h1>
        <h3>by <span class="author">${authors}</span></h3>
        <div class="section">
          <h4>Synopsis</h4>
          <p class="description">${description}</p>
        </div>
      </div>
    </div>
    <div id="review-popup" class="popup-modal">
      <div class="popup-content">
        <span class="close-popup" id="close-review-popup">&times;</span>
        <h4>Leave a Review</h4>
        <form id="review-form">
          <input type="text" id="review-user" placeholder="Your name" required>
          <select id="review-rating" required>
            <option value="">Rating</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <textarea id="review-message" placeholder="Your review" required></textarea>
          <button type="submit">Submit Review</button>
        </form>
        <div id="review-success" style="color:#b48a4a;margin-top:8px;display:none;">Review submitted!</div>
      </div>
    </div>
    <div id="reviews-popup" class="popup-modal">
      <div class="popup-content reviews-popup-content">
        <span class="close-popup" id="close-reviews-popup">&times;</span>
        <h4>Existing Reviews</h4>
        <ul id="review-list"></ul>
      </div>
    </div>
  `;

  // Sidebar dropdown logic
  const dropdownBtn = document.getElementById('dropdown-btn');
  const dropdownContent = document.getElementById('dropdown-content');
  dropdownBtn.onclick = (e) => {
    e.stopPropagation();
    dropdownContent.style.display = dropdownContent.style.display === 'flex' ? 'none' : 'flex';
  };
  document.body.onclick = (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
      dropdownContent.style.display = 'none';
    }
  };

  // Popup logic with toggle
  const reviewPopup = document.getElementById('review-popup');
  const reviewsPopup = document.getElementById('reviews-popup');
  let reviewOpen = false;
  let reviewsOpen = false;
  document.getElementById('open-review-popup').onclick = (e) => {
    e.stopPropagation();
    reviewOpen = !reviewOpen;
    reviewPopup.style.display = reviewOpen ? 'block' : 'none';
    if (reviewOpen) { reviewsPopup.style.display = 'none'; reviewsOpen = false; }
  };
  document.getElementById('close-review-popup').onclick = () => {
    reviewPopup.style.display = 'none';
    reviewOpen = false;
  };
  document.getElementById('open-reviews-popup').onclick = (e) => {
    e.stopPropagation();
    reviewsOpen = !reviewsOpen;
    reviewsPopup.style.display = reviewsOpen ? 'block' : 'none';
    if (reviewsOpen) { reviewPopup.style.display = 'none'; reviewOpen = false; loadReviews(bookId); }
  };
  document.getElementById('close-reviews-popup').onclick = () => {
    reviewsPopup.style.display = 'none';
    reviewsOpen = false;
  };

  // Review form submission
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.onsubmit = async function(e) {
      e.preventDefault();
      const user = document.getElementById('review-user').value.trim();
      const rating = document.getElementById('review-rating').value;
      const message = document.getElementById('review-message').value.trim();
      if (!user || !rating || !message) return;
      const resp = await fetch(`${BACKEND_URL}/submit_review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, rating, message, book_id: bookId })
      });
      if (resp.ok) {
        document.getElementById('review-success').style.display = 'block';
        setTimeout(() => { document.getElementById('review-success').style.display = 'none'; }, 2000);
        reviewForm.reset();
        loadReviews(bookId);
      }
    };
  }

  // Add to list actions
  const user = localStorage.getItem('bookbuddy_user');
  document.getElementById('add-favorite').onclick = async () => {
    if (!user) { alert('Please login on the main page first.'); return; }
    await fetch(`${BACKEND_URL}/favorites/${encodeURIComponent(user)}/add/${bookId}`, { method: 'POST' });
    alert('Book added to Favorites!');
  };
  document.getElementById('add-read').onclick = async () => {
    if (!user) { alert('Please login on the main page first.'); return; }
    await fetch(`${BACKEND_URL}/read_books/${encodeURIComponent(user)}/add/${bookId}`, { method: 'POST' });
    alert('Book marked as Read!');
  };
  document.getElementById('add-want').onclick = async () => {
    if (!user) { alert('Please login on the main page first.'); return; }
    await fetch(`${BACKEND_URL}/want_to_reads/${encodeURIComponent(user)}/add/${bookId}`, { method: 'POST' });
    alert('Book added to Want to Read!');
  };
}

async function loadReviews(bookId) {
  const reviewsRes = await fetch(`${BACKEND_URL}/reviews_book/${bookId}`);
  const data = await reviewsRes.json();
  const reviews = data.reviews || [];
  const list = document.getElementById('review-list');
  if (!list) return;
  list.innerHTML = '';
  if (!reviews || reviews.length === 0) {
    list.innerHTML = '<li>No reviews yet.</li>';
  } else {
    reviews.forEach(r => {
      const li = document.createElement('li');
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      li.innerHTML = `<strong>${r.user}</strong> <span class="stars">${stars}</span>: ${r.message} <br><small>${new Date(r.date).toLocaleString()}</small>`;
      list.appendChild(li);
    });
  }
}

window.onload = loadBook;