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

  // New layout: main flex container
  detailsDiv.innerHTML = `
    <div class="bookpage-main-flex">
      <div class="bookpage-left">
        <div class="bookpage-title-thumb-row">
          <div class="bookpage-title-authors">
            <h1 class="bookpage-title">${title}</h1>
            <div class="bookpage-authors">by ${authors}</div>
          </div>
          <img src="${imgSrc}" alt="${title}" class="bookpage-thumb">
        </div>
        <div class="bookpage-list-btns">
          <button id="add-favorite" class="bookpage-list-btn">Favorites</button>
          <button id="add-want" class="bookpage-list-btn">Want to Read</button>
          <button id="add-read" class="bookpage-list-btn">Read</button>
        </div>
        <div class="bookpage-synopsis bookpage-synopsis-centered">
          <h3>Synopsis</h3>
          <p>${description}</p>
        </div>
      </div>
      <div class="bookpage-right-box">
        <div class="bookpage-review-btns">
          <button id="open-review-popup" class="bookpage-review-btn">Leave Review</button>
          <button id="open-reviews-popup" class="bookpage-review-btn">See All Reviews</button>
        </div>
        <div id="review-popup" class="popup-modal">
          <div class="popup-content">
            <button class="close-popup" id="close-review-popup" type="button">×</button>
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
        <div id="bookpage-reviews-list-box">
          <ul id="review-list" class="bookpage-review-list"></ul>
        </div>
        <div id="bookpage-recommend-section" class="bookpage-recommend-section">
          <h3>Recommended Books</h3>
          <ul id="recommend-list" class="bookpage-recommend-list"></ul>
        </div>
      </div>
    </div>
  `;

  // Popup logic
  const reviewPopup = document.getElementById('review-popup');
  const openReviewBtn = document.getElementById('open-review-popup');
  const closeReviewBtn = document.getElementById('close-review-popup');
  let reviewOpen = false;
  openReviewBtn.onclick = (e) => {
    e.stopPropagation();
    reviewOpen = !reviewOpen;
    reviewPopup.style.display = reviewOpen ? 'block' : 'none';
    openReviewBtn.textContent = reviewOpen ? 'Close' : 'Leave Review';
  };
  if (closeReviewBtn) {
    closeReviewBtn.onclick = (e) => {
      e.stopPropagation();
      reviewPopup.style.display = 'none';
      reviewOpen = false;
      openReviewBtn.textContent = 'Leave Review';
    };
  }
  document.addEventListener('click', function(event) {
    if (reviewOpen && !reviewPopup.contains(event.target) && event.target !== openReviewBtn) {
      reviewPopup.style.display = 'none';
      reviewOpen = false;
      openReviewBtn.textContent = 'Leave Review';
    }
  });

  document.getElementById('open-reviews-popup').onclick = (e) => {
    e.stopPropagation();
    loadReviews(bookId);
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
    loadRecommendedBooks(user); // Refresh recommendations
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

  // Load reviews immediately in the right box
  loadReviews(bookId);
  // Load recommended books below reviews (use user id)
  loadRecommendedBooks(user);
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

async function loadRecommendedBooks(user) {
  const recommendList = document.getElementById('recommend-list');
  if (!recommendList) return;
  recommendList.innerHTML = '<li style="color:#b48a4a;">Loading...</li>';
  let data;
  try {
    const res = await fetch(`${BACKEND_URL}/recommendations/${encodeURIComponent(user)}`);
    data = await res.json();
  } catch (e) {
    recommendList.innerHTML = '<li style="color:#b48a4a;">Failed to load recommendations.</li>';
    return;
  }
  const books = data.recommendations?.items || [];
  if (!books.length) {
    recommendList.innerHTML = '<li style="color:#b48a4a;">No recommendations found.</li>';
    return;
  }
  recommendList.innerHTML = '';
  books.slice(0, 6).forEach(book => {
    const li = document.createElement('li');
    const title = book.volumeInfo?.title || 'No Title';
    let imgSrc = "images/placeholder.jpg";
    if (book.volumeInfo?.imageLinks?.thumbnail) {
      imgSrc = book.volumeInfo.imageLinks.thumbnail.replace(/^http:\/\//i, 'https://');
    }
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.className = 'bookpage-recommend-thumb';
    const span = document.createElement('span');
    span.textContent = title;
    span.className = 'bookpage-recommend-title';
    li.appendChild(img);
    li.appendChild(span);
    li.onclick = () => {
      window.location.href = `book.html?id=${encodeURIComponent(book.id)}`;
    };
    recommendList.appendChild(li);
  });
}

window.onload = loadBook;