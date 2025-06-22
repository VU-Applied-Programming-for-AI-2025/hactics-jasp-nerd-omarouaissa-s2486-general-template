const BACKEND_URL = "http://127.0.0.1:5000"; // Change if your backend runs elsewhere
let currentUser = localStorage.getItem('bookbuddy_user') || null;
let currentPage = 1;

function showLogin() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('user-section').style.display = 'none';
}

function showUserSection() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('user-section').style.display = 'block';
  document.getElementById('current-user').textContent = currentUser;
}

async function loadSavedBooks() {
  // Clear all lists
  document.getElementById('favorites-list').innerHTML = '';
  document.getElementById('read-list').innerHTML = '';
  document.getElementById('want-list').innerHTML = '';

  // Fetch favorites
  const favRes = await fetch(`${BACKEND_URL}/favorite_books/${encodeURIComponent(currentUser)}`);
  const favorites = await favRes.json();
  if (Array.isArray(favorites)) {
    favorites.forEach(b => addBookToList(b, 'favorites-list'));
  }

  // Fetch read books
  const readRes = await fetch(`${BACKEND_URL}/read_book_objects/${encodeURIComponent(currentUser)}`);
  const readBooks = await readRes.json();
  if (Array.isArray(readBooks)) {
    readBooks.forEach(b => addBookToList(b, 'read-list'));
  }

  // Fetch want to read
  const wantRes = await fetch(`${BACKEND_URL}/want_to_read_books/${encodeURIComponent(currentUser)}`);
  const wantBooks = await wantRes.json();
  if (Array.isArray(wantBooks)) {
    wantBooks.forEach(b => addBookToList(b, 'want-list'));
  }
}

function addBookToList(book, listId) {
  const list = document.getElementById(listId);
  const li = document.createElement('li');
  const title = book.volumeInfo?.title || 'No Title';

  // Get thumbnail or placeholder
  let imgSrc = "images/placeholder.jpg";
  if (book.volumeInfo?.imageLinks?.thumbnail) {
    imgSrc = book.volumeInfo.imageLinks.thumbnail.replace(/^http:\/\//i, 'https://');
  }

  // Create image element
  const img = document.createElement('img');
  img.src = imgSrc;
  img.alt = title;
  img.style.width = "36px";
  img.style.height = "54px";
  img.style.objectFit = "cover";
  img.style.marginRight = "12px";
  img.style.verticalAlign = "middle";
  img.style.borderRadius = "4px";
  img.style.boxShadow = "0 2px 8px #18161222";

  // Create title span
  const titleSpan = document.createElement('span');
  titleSpan.textContent = title;
  titleSpan.style.verticalAlign = "middle";
  titleSpan.style.fontSize = "1.05rem";
  titleSpan.style.fontWeight = "bold";

  li.appendChild(img);
  li.appendChild(titleSpan);

  li.style.cursor = 'pointer';
  li.onclick = () => {
    window.location.href = `book.html?id=${encodeURIComponent(book.id)}`;
  };
  // Add delete button for favorites, read, and want-to-read
  if (listId === 'favorites-list') {
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Remove from Favorites';
    delBtn.style.marginLeft = '12px';
    delBtn.style.fontSize = '0.9em';
    delBtn.style.padding = '2px 8px';
    delBtn.style.background = '#b48a4a';
    delBtn.style.color = '#23201a';
    delBtn.style.borderRadius = '50%';
    delBtn.style.border = 'none';
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      const user = localStorage.getItem('bookbuddy_user');
      if (!user) return;
      // Try both string and int user id routes for compatibility
      let resp = await fetch(`${BACKEND_URL}/favorites/${encodeURIComponent(user)}/delete/${encodeURIComponent(book.id)}`, { method: 'POST' });
      if (!resp.ok) {
        // fallback: try int route (legacy)
        resp = await fetch(`${BACKEND_URL}/favorites/${encodeURIComponent(Number(user))}/delete/${encodeURIComponent(book.id)}`, { method: 'POST' });
      }
      if (resp.ok) li.remove();
      else alert('Failed to remove favorite.');
    };
    li.appendChild(delBtn);
  } else if (listId === 'read-list') {
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Remove from Read';
    delBtn.style.marginLeft = '12px';
    delBtn.style.fontSize = '0.9em';
    delBtn.style.padding = '2px 8px';
    delBtn.style.background = '#b48a4a';
    delBtn.style.color = '#23201a';
    delBtn.style.borderRadius = '50%';
    delBtn.style.border = 'none';
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      const user = localStorage.getItem('bookbuddy_user');
      await fetch(`${BACKEND_URL}/read_books/${encodeURIComponent(user)}/delete/${book.id}`, { method: 'POST' });
      li.remove();
    };
    li.appendChild(delBtn);
  } else if (listId === 'want-list') {
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Remove from Want to Read';
    delBtn.style.marginLeft = '12px';
    delBtn.style.fontSize = '0.9em';
    delBtn.style.padding = '2px 8px';
    delBtn.style.background = '#b48a4a';
    delBtn.style.color = '#23201a';
    delBtn.style.borderRadius = '50%';
    delBtn.style.border = 'none';
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      const user = localStorage.getItem('bookbuddy_user');
      await fetch(`${BACKEND_URL}/want_to_reads/${encodeURIComponent(user)}/delete/${book.id}`, { method: 'POST' });
      li.remove();
    };
    li.appendChild(delBtn);
  }
  list.appendChild(li);
}

document.getElementById('search-btn').onclick = async function() {
  const query = document.getElementById('search-input').value.trim();
  const orderBy = document.getElementById('order-by').value;
  const lang = document.getElementById('lang').value;
  if (!query) return;
  let url = `${BACKEND_URL}/search?q=${encodeURIComponent(query)}`;
  if (orderBy) url += `&order_by=${encodeURIComponent(orderBy)}`;
  if (lang) url += `&lang=${encodeURIComponent(lang)}`;
  const res = await fetch(url);
  const books = await res.json();
  showBooks(books);
};

function showBooks(books) {
  const list = document.getElementById('book-list');
  list.innerHTML = '';
  books.forEach(book => {
    const li = document.createElement('li');
    const title = book.volumeInfo?.title || 'No Title';

    // Get thumbnail or placeholder
    let imgSrc = "images/placeholder.jpg";
    if (book.volumeInfo?.imageLinks?.thumbnail) {
      imgSrc = book.volumeInfo.imageLinks.thumbnail;
      // Optionally, use https instead of http for thumbnails
      imgSrc = imgSrc.replace(/^http:\/\//i, 'https://');
    }

    // Create image element
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.style.width = "48px";
    img.style.height = "72px";
    img.style.objectFit = "cover";
    img.style.marginRight = "16px";
    img.style.verticalAlign = "middle";
    img.style.borderRadius = "4px";
    img.style.boxShadow = "0 2px 8px #18161222";

    // Create title span
    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    titleSpan.style.verticalAlign = "middle";
    titleSpan.style.fontSize = "1.1rem";
    titleSpan.style.fontWeight = "bold";

    li.appendChild(img);
    li.appendChild(titleSpan);

    li.style.cursor = 'pointer';
    li.onclick = () => {
  window.location.href = `book.html?id=${encodeURIComponent(book.id)}`;
};

    list.appendChild(li);
  });
}

async function showReviews(bookId, bookTitle) {
  document.getElementById('reviews-section').style.display = 'block';
  document.getElementById('book-title').textContent = bookTitle;
  const res = await fetch(`${BACKEND_URL}/reviews_book/${bookId}`);
  const data = await res.json();
  const reviews = data.reviews || [];
  const list = document.getElementById('review-list');
  list.innerHTML = '';
  if (!reviews || reviews.length === 0) {
    list.innerHTML = '<li>No reviews yet.</li>';
  } else {
    reviews.forEach(r => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${r.user}</strong> (${r.rating}/5): ${r.message} <br><small>${new Date(r.date).toLocaleString()}</small>`;
      list.appendChild(li);
    });
  }
}

document.getElementById('close-reviews').onclick = function() {
  document.getElementById('reviews-section').style.display = 'none';
};
async function loadTopRatedBooks() {
  const list = document.getElementById('top-rated-list');
  if (!list) return;
  list.innerHTML = '<li style="color:#b48a4a;">Loading...</li>';
  let reviews = [];
  try {
    const res = await fetch(`${BACKEND_URL}/reviews_sorted?sort_by=rating&order=desc`);
    const data = await res.json();
    reviews = Array.isArray(data) ? data : (data.reviews || []);
  } catch (e) {
    list.innerHTML = '<li style="color:#b48a4a;">Failed to load top rated books.</li>';
    return;
  }
  // Calculate average ratings per book_id
  const ratingMap = {};
  const countMap = {};
  for (const review of reviews) {
    if (!review.book_id) continue;
    ratingMap[review.book_id] = (ratingMap[review.book_id] || 0) + review.rating;
    countMap[review.book_id] = (countMap[review.book_id] || 0) + 1;
  }
  // Get unique book IDs, highest average rating first
  const avgArr = Object.keys(ratingMap).map(bookId => ({
    bookId,
    avg: ratingMap[bookId] / countMap[bookId],
    count: countMap[bookId]
  }));
  avgArr.sort((a, b) => b.avg - a.avg);
  const topBooks = avgArr.slice(0, 10);
  if (topBooks.length === 0) {
    list.innerHTML = '<li style="color:#b48a4a;">No top rated books yet.</li>';
    return;
  }
  // Fetch book details for each top book
  const bookDetails = await Promise.all(topBooks.map(async (b) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/get_book/${b.bookId}`);
      if (resp.ok) return { book: await resp.json(), avg: b.avg, count: b.count, bookId: b.bookId };
    } catch (e) {}
    return null;
  }));
  // Render in the UI
  list.innerHTML = '';
  let anyBook = false;
  bookDetails.forEach((item) => {
    if (!item || !item.book) return;
    anyBook = true;
    const { book, avg, count, bookId } = item;
    const li = document.createElement('li');
    const title = book.volumeInfo?.title || 'No Title';
    let imgSrc = "images/placeholder.jpg";
    if (book.volumeInfo?.imageLinks?.thumbnail) {
      imgSrc = book.volumeInfo.imageLinks.thumbnail.replace(/^http:\/\//i, 'https://');
    }
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.style.width = "36px";
    img.style.height = "54px";
    img.style.objectFit = "cover";
    img.style.marginRight = "12px";
    img.style.verticalAlign = "middle";
    img.style.borderRadius = "4px";
    img.style.boxShadow = "0 2px 8px #18161222";
    const titleSpan = document.createElement('span');
    titleSpan.textContent = `${title}  (★ ${avg.toFixed(2)} / 5, ${count} review${count > 1 ? 's' : ''})`;
    titleSpan.style.verticalAlign = "middle";
    titleSpan.style.fontSize = "1.05rem";
    titleSpan.style.fontWeight = "bold";
    li.appendChild(img);
    li.appendChild(titleSpan);
    li.style.cursor = 'pointer';
    li.onclick = () => {
      window.location.href = `book.html?id=${encodeURIComponent(bookId)}`;
    };
    list.appendChild(li);
  });
  if (!anyBook) {
    list.innerHTML = '<li style="color:#b48a4a;">No top rated books found.</li>';
  }
}

window.onload = function() {
  // Username logic from previous message
  if (currentUser) {
    showUserSection();
    loadSavedBooks();
    loadTopRatedBooks();
  } else {
    showLogin();
  }

  document.getElementById('login-btn').onclick = async function() {
    const username = document.getElementById('username-input').value.trim();
    if (!username) return;
    // Check if user exists
    let exists = false;
    try {
      const res = await fetch(`${BACKEND_URL}/favorites/${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.user === username) exists = true;
      }
    } catch (e) {}
    // If not, create user (favorites, read, want-to-read)
    if (!exists) {
      await fetch(`${BACKEND_URL}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, book_list_id: [] })
      });
      await fetch(`${BACKEND_URL}/read_books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, book_list_id: [] })
      });
      await fetch(`${BACKEND_URL}/want_to_reads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, book_list_id: [] })
      });
    }
    // Set user in localStorage and reload
    localStorage.setItem('bookbuddy_user', username);
    window.location.reload();
  };

  document.getElementById('search-btn').onclick = function() {
    if (!currentUser) {
      alert("Please login with a username first.");
      return;
    }
    currentPage = 1;
    runSearch(currentPage);
  };

  document.getElementById('logout-btn').onclick = function() {
    localStorage.removeItem('bookbuddy_user');
    currentUser = null;
    showLogin();
    // Optionally, clear lists and input fields:
    document.getElementById('username-input').value = '';
    document.getElementById('favorites-list').innerHTML = '';
    document.getElementById('read-list').innerHTML = '';
    document.getElementById('want-list').innerHTML = '';
    document.getElementById('book-list').innerHTML = '';
    document.getElementById('search-input').value = '';
  };

  document.getElementById('next-page').onclick = function() {
    currentPage++;
    runSearch(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  document.getElementById('prev-page').onclick = function() {
    if (currentPage > 1) {
      currentPage--;
      runSearch(currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Optionally, update page indicator on load
  updatePageIndicator();

  // Gemini Chat logic
  const geminiChatForm = document.getElementById('gemini-chat-form');
  const geminiChatInput = document.getElementById('gemini-chat-input');
  const geminiChatLog = document.getElementById('gemini-chat-log');
  if (geminiChatForm && geminiChatInput && geminiChatLog) {
    geminiChatForm.onsubmit = async function(e) {
      e.preventDefault();
      const message = geminiChatInput.value.trim();
      if (!message) return;
      geminiChatLog.innerHTML += `<div style='margin-bottom:8px;'><strong>You:</strong> ${message}</div>`;
      geminiChatInput.value = '';
      geminiChatInput.disabled = true;
      // Get user id
      const userId = currentUser || localStorage.getItem('bookbuddy_user') || 'guest';
      try {
        const res = await fetch(`${BACKEND_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, user_id: userId })
        });
        const data = await res.json();
        if (data.response) {
          geminiChatLog.innerHTML += `<div style='margin-bottom:12px; color:#ffe066;'><strong>BookBuddy:</strong> ${data.response}</div>`;
        } else {
          geminiChatLog.innerHTML += `<div style='color:#b48a4a;'>No response from BookBuddy.</div>`;
        }
      } catch (e) {
        geminiChatLog.innerHTML += `<div style='color:#b48a4a;'>Error: ${e.message}</div>`;
      }
      geminiChatInput.disabled = false;
      geminiChatInput.focus();
      geminiChatLog.scrollTop = geminiChatLog.scrollHeight;
    };
  }

  // Filter toggle logic
  const toggleFiltersBtn = document.getElementById('toggle-filters');
  const filtersBar = document.getElementById('filters-bar');
  if (toggleFiltersBtn && filtersBar) {
    toggleFiltersBtn.onclick = function() {
      if (filtersBar.style.display === 'none' || filtersBar.style.display === '') {
        filtersBar.style.display = 'flex';
      } else {
        filtersBar.style.display = 'none';
      }
    };
  }
};

function updatePageIndicator() {
  document.getElementById('page-indicator-top').textContent = `Page ${currentPage}`;
  document.getElementById('page-indicator-bottom').textContent = `Page ${currentPage}`;
}

async function runSearch(page = 1) {
  const query = document.getElementById('search-input').value.trim();
  const orderBy = document.getElementById('order-by').value;
  const lang = document.getElementById('lang').value;
  if (!query) return;
  let url = `${BACKEND_URL}/search?q=${encodeURIComponent(query)}&page=${page}`;
  if (orderBy) url += `&order_by=${encodeURIComponent(orderBy)}`;
  if (lang) url += `&lang=${encodeURIComponent(lang)}`;
  const res = await fetch(url);
  const books = await res.json();
  showBooks(books);
  updatePageIndicator();
}
