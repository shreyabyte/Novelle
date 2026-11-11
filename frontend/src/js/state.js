/**
 * Between the Pages - User-Scoped State Management & LocalStorage Persistence
 */

import { authService } from './auth.js';
import { apiRequest } from './api.js';

function formatBook(book) {
  let status = book.status;

  if (status === 'To Read') {
    status = 'Want to Read';
  } else if (status === 'Reading') {
    status = 'Currently Reading';
  }

  return {
    id: String(book.book_id),
    title: book.title,
    author: book.author,
    genre: book.genre || 'General Fiction',
    totalPages: book.total_pages,
    currentPage: book.current_page,
    status: status,
    rating: book.rating || 0,
    coverUrl: getBookCover(book.book_id),
    startDate: '',
    completedDate: book.date_completed || '',
    notes: book.review || '',
    isFavorite: false,
    addedAt: new Date().toISOString()
  };
}


const BOOK_COVERS = [
    '/src/assets/images/Blue.png',
    '/src/assets/images/Green.png',
    '/src/assets/images/Purple.png',
    '/src/assets/images/Red.png'
];

function getBookCover(bookId) {
    const storageKey = 'reading_tracker_book_covers';

    let savedCovers = {};

    try {
        savedCovers = JSON.parse(
            localStorage.getItem(storageKey)
        ) || {};
    } catch (error) {
        savedCovers = {};
    }

    // Reuse the previously assigned cover
    if (savedCovers[bookId]) {
        return savedCovers[bookId];
    }

    // Randomly assign a new cover
    const randomIndex = Math.floor(
        Math.random() * BOOK_COVERS.length
    );

    const selectedCover = BOOK_COVERS[randomIndex];

    savedCovers[bookId] = selectedCover;

    localStorage.setItem(
        storageKey,
        JSON.stringify(savedCovers)
    );

    return selectedCover;
}


class StateManager {
  constructor() {
    this.listeners = [];
    this.userId = null;
    this.state = this.loadStateForActiveUser();

    // Listen to authentication changes
    authService.onAuthChange((event, user) => {
      this.setUser(user);
    });

    // Fetch books if the user is already logged in
    if (authService.getCurrentUser()) {
      this.fetchBooks();
      this.fetchGoals();
    }
      }

  getStorageKey(userId) {
    return `between_the_pages_data_${userId || 'guest'}`;
  }

  loadStateForActiveUser() {
    const user = authService.getCurrentUser();
    this.userId = user ? user.id : 'guest';
    const key = this.getStorageKey(this.userId);

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read user state from storage', e);
    }

    // Seed defaults depending on user
    return this.generateInitialStateForUser(this.userId);
  }

  generateInitialStateForUser(userId) {
    let books = [];
    let journal = [];
    let activities = [];
    let goals = { yearlyTarget: 24, monthlyTarget: 2, currentYear: 2026 };
    let streak = { current: 7, lastCheckIn: new Date().toISOString().split('T')[0], checkedToday: true };

    if (userId === 'user-eleanor' || userId === 'guest') {
      books = JSON.parse(JSON.stringify(ELEANOR_BOOKS));
      journal = JSON.parse(JSON.stringify(ELEANOR_JOURNAL));
      activities = [
        { id: 'act-1', text: 'Read 24 pages in <strong>The Alchemist</strong>', time: 'Today, 2 hours ago' },
        { id: 'act-2', text: 'Updated progress to page 218 in <strong>The Silent Patient</strong>', time: 'Yesterday' },
        { id: 'act-3', text: 'Added journal entry for <strong>The Alchemist</strong>', time: '3 days ago' },
        { id: 'act-4', text: 'Added <strong>The Book Thief</strong> to Want to Read', time: 'Last week' }
      ];
    } else if (userId === 'user-julian') {
      books = JSON.parse(JSON.stringify(JULIAN_BOOKS));
      journal = JSON.parse(JSON.stringify(JULIAN_JOURNAL));
      activities = [
        { id: 'act-j1', text: 'Completed reading <strong>The Silent Patient</strong> ★★★★★', time: 'Last week' },
        { id: 'act-j2', text: 'Turned 40 pages in <strong>The Book Thief</strong>', time: 'Yesterday' }
      ];
      goals = { yearlyTarget: 30, monthlyTarget: 3, currentYear: 2026 };
      streak = { current: 14, lastCheckIn: new Date().toISOString().split('T')[0], checkedToday: true };
    } else {
      // New user personalized welcome library
      books = [
        {
          id: 'book-welcome',
          title: 'The Alchemist',
          author: 'Paulo Coelho',
          genre: 'Philosophy',
          totalPages: 208,
          currentPage: 0,
          status: 'Want to Read',
          rating: 0,
          coverUrl: getBookCover('book-welcome'),
          startDate: '',
          completedDate: '',
          notes: 'Your reading journey begins here. A gentle fable of dreams and persistence.',
          isFavorite: true,
          addedAt: new Date().toISOString()
        }
      ];
      journal = [
        {
          id: 'journal-welcome',
          bookId: 'book-welcome',
          bookTitle: 'The Alchemist',
          title: 'My First Reading Intention',
          date: new Date().toISOString().split('T')[0],
          quote: 'To realize one’s destiny is a person’s only real obligation.',
          reflection: 'Welcome to your private reading sanctuary. Use this journal to preserve thoughts, lines of wisdom, and reflections from the pages that touch your life.',
          mood: 'Inspired'
        }
      ];
      activities = [
        { id: 'act-welcome', text: 'Created personal reading sanctuary', time: 'Just now' }
      ];
      goals = { yearlyTarget: 12, monthlyTarget: 1, currentYear: 2026 };
      streak = { current: 1, lastCheckIn: new Date().toISOString().split('T')[0], checkedToday: true };
    }

    const state = {
      books,
      journal,
      activities,
      goals,
      streak,
      libraryViewMode: 'grid',
      lastQuoteUpdate: Date.now()
    };

    this.saveState(state);
    return state;
  }

  async setUser(user) {
    this.userId = user ? user.id : 'guest';
    this.state = this.loadStateForActiveUser();

    if (user) {
      await this.fetchBooks();
      await this.fetchGoals();
    }

    this.notify('user:changed', user);
  }

  saveState(stateToSave = this.state) {
    if (!this.userId) return;
    try {
      const key = this.getStorageKey(this.userId);
      localStorage.setItem(key, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save user state', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, payload) {
    this.saveState();
    this.listeners.forEach(fn => fn(event, payload, this.state));
  }

  // --- Book Operations ---
  getBooks() {
    return this.state.books || [];
  }

  getBookById(id) {
    return (this.state.books || []).find(b => b.id === id);
  }

  async fetchBooks() {
    try {
      const data = await apiRequest('/books');

      this.state.books = (data.books || []).map(formatBook);

      this.notify('books:loaded', this.state.books);

    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }

  async addBook(bookData) {
      const totalPages = Number(bookData.totalPages) || 1;
      const currentPage = Number(bookData.currentPage) || 0;

      let backendStatus = bookData.status || 'Want to Read';

      if (backendStatus === 'Want to Read') {
          backendStatus = 'To Read';
      } else if (backendStatus === 'Currently Reading') {
          backendStatus = 'Reading';
      }

      try {
          const data = await apiRequest('/books', {
              method: 'POST',
              body: JSON.stringify({
                  title: bookData.title.trim(),
                  author: bookData.author.trim(),
                  genre: bookData.genre || 'General Fiction',
                  total_pages: totalPages,
                  current_page: currentPage,
                  status: backendStatus
              })
          });

          await this.fetchBooks();

          const newBook = this.getBookById(String(data.book_id));

          this.logActivity(
              `Added <strong>${bookData.title}</strong> to your library`
          );

          this.notify('book:added', newBook);

          return newBook;

      } catch (error) {
          console.error('Error adding book:', error);
          throw error;
      }
  }
  async updateBook(id, updates) {
      const index = this.state.books.findIndex(b => b.id === id);
      if (index === -1) return null;

      const oldBook = this.state.books[index];
      const updated = { ...oldBook, ...updates };

      if (updates.totalPages !== undefined) {
          updated.totalPages = Number(updates.totalPages);
      }

      if (updates.currentPage !== undefined) {
          updated.currentPage = Math.min(
              Number(updates.currentPage),
              updated.totalPages
          );
      }

      if (updates.rating !== undefined) {
          updated.rating = Number(updates.rating);
      }

      let completedJustNow = false;

      if (updated.currentPage >= updated.totalPages && updated.totalPages > 0) {
          if (oldBook.status !== 'Completed') {
              completedJustNow = true;
          }

          updated.status = 'Completed';

          if (!updated.completedDate) {
              updated.completedDate = new Date().toISOString().split('T')[0];
          }

      } else if (updated.currentPage > 0 && updated.status === 'Want to Read') {
          updated.status = 'Currently Reading';

          if (!updated.startDate) {
              updated.startDate = new Date().toISOString().split('T')[0];
          }
      }

      // Convert frontend status to backend status
      let backendStatus = updated.status;

      if (backendStatus === 'Want to Read') {
          backendStatus = 'To Read';
      } else if (backendStatus === 'Currently Reading') {
          backendStatus = 'Reading';
      }

      const allowedStatuses = [
          'To Read',
          'Reading',
          'Completed',
          'On Hold',
          'Dropped'
      ];

      if (!allowedStatuses.includes(backendStatus)) {
          throw new Error('Invalid reading status.');
      }

      // Backend currently supports whole-number ratings
      if (updated.rating && !Number.isInteger(updated.rating)) {
          throw new Error('Please use a whole-number rating between 1 and 5.');
      }

      try {
          await apiRequest(`/books/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  title: updated.title,
                  author: updated.author,
                  genre: updated.genre,
                  total_pages: updated.totalPages,
                  current_page: updated.currentPage,
                  status: backendStatus,
                  rating: updated.rating || null,
                  review: updated.notes || ''
              })
          });

          // Update local state only after backend succeeds
          this.state.books[index] = updated;

          if (completedJustNow) {
              this.logActivity(`Finished reading <strong>${updated.title}</strong>! 🎉`);

          } else if (
              updates.currentPage !== undefined &&
              updates.currentPage !== oldBook.currentPage
          ) {
              const pageDiff = updated.currentPage - oldBook.currentPage;

              if (pageDiff > 0) {
                  this.logActivity(`Read ${pageDiff} pages of <strong>${updated.title}</strong>`);
              } else {
                  this.logActivity(`Updated page to ${updated.currentPage} in <strong>${updated.title}</strong>`);
              }

          } else {
              this.logActivity(`Updated details for <strong>${updated.title}</strong>`);
          }

          this.notify('book:updated', { book: updated, completedJustNow });

          return updated;

      } catch (error) {
          console.error('Error updating book:', error);
          throw error;
      }
  }

  async deleteBook(id) {
      const book = this.getBookById(id);
      if (!book) return;

      try {
          await apiRequest(`/books/${id}`, {
              method: 'DELETE'
          });

          this.state.books = this.state.books.filter(b => b.id !== id);

          this.logActivity(`Removed <strong>${book.title}</strong> from library`);
          this.notify('book:deleted', id);

      } catch (error) {
          console.error('Error deleting book:', error);
          throw error;
      }
  }

  toggleFavorite(id) {
    const book = this.getBookById(id);
    if (!book) return;
    book.isFavorite = !book.isFavorite;
    this.notify('book:updated', { book });
    return book.isFavorite;
  }

  // --- Journal Operations ---
  getJournalEntries() {
    return this.state.journal || [];
  }

  addJournalEntry(entryData) {
    const newEntry = {
      id: 'journal-' + Date.now(),
      bookId: entryData.bookId || '',
      bookTitle: entryData.bookTitle || '',
      title: entryData.title.trim(),
      date: entryData.date || new Date().toISOString().split('T')[0],
      quote: entryData.quote || '',
      reflection: entryData.reflection || '',
      mood: entryData.mood || 'Thoughtful',
      createdAt: new Date().toISOString()
    };

    this.state.journal.unshift(newEntry);
    this.logActivity(`Penned a new journal entry: <em>"${newEntry.title}"</em>`);
    this.notify('journal:added', newEntry);
    return newEntry;
  }

  updateJournalEntry(id, updates) {
    const index = this.state.journal.findIndex(j => j.id === id);
    if (index === -1) return null;

    this.state.journal[index] = { ...this.state.journal[index], ...updates };
    this.notify('journal:updated', this.state.journal[index]);
    return this.state.journal[index];
  }

  deleteJournalEntry(id) {
    this.state.journal = this.state.journal.filter(j => j.id !== id);
    this.notify('journal:deleted', id);
  }

  // --- Goals Operations ---
  getGoals() {
      return this.state.goals || {
          yearlyTarget: 24,
          monthlyTarget: 2,
          currentYear: new Date().getFullYear()
      };
  }

  // Fetch reading goals from backend
  async fetchGoals() {
      try {
          const data = await apiRequest('/reading-goals');

          const currentYear = new Date().getFullYear();

          const currentGoal = (data.goals || []).find(
              goal => goal.year === currentYear
          );

          this.state.goals = {
              ...this.getGoals(),
              currentYear: currentYear,
              yearlyTarget: currentGoal
                  ? currentGoal.target_books
                  : 24
          };

          this.notify('goals:loaded', this.state.goals);

      } catch (error) {
          console.error('Error fetching reading goals:', error);
      }
  }

  // Create or update reading goals
  async updateGoals(yearly, monthly) {
      const currentYear = new Date().getFullYear();
      const yearlyTarget = Number(yearly) || 24;
      const monthlyTarget = Number(monthly) || 2;

      try {
          await apiRequest('/reading-goals', {
              method: 'POST',
              body: JSON.stringify({
                  year: currentYear,
                  target_books: yearlyTarget
              })
          });

          this.state.goals = {
              ...this.getGoals(),
              yearlyTarget,
              monthlyTarget,
              currentYear
          };

          this.logActivity(
              `Updated ${currentYear} reading target to ${yearlyTarget} books`
          );

          this.notify('goals:updated', this.state.goals);

      } catch (error) {
          console.error('Error updating reading goals:', error);
          throw error;
      }
  }

  // --- Streak Operations ---
  getStreak() {
    const today = new Date().toISOString().split('T')[0];
    const isTodayChecked = this.state.streak && this.state.streak.lastCheckIn === today;
    return {
      current: this.state.streak ? this.state.streak.current : 1,
      checkedToday: isTodayChecked
    };
  }

  checkInToday() {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.streak.lastCheckIn === today) {
      return { alreadyChecked: true, current: this.state.streak.current };
    }

    this.state.streak.current = (this.state.streak.current || 0) + 1;
    this.state.streak.lastCheckIn = today;
    this.state.streak.checkedToday = true;

    this.logActivity(`Marked daily reading check-in! Streak is now ${this.state.streak.current} days 🔥`);
    this.notify('streak:updated', this.state.streak);
    return { alreadyChecked: false, current: this.state.streak.current };
  }

  // --- Activity Logging ---
  logActivity(htmlText) {
    const newAct = {
      id: 'act-' + Date.now(),
      text: htmlText,
      time: 'Just now'
    };
    if (!this.state.activities) this.state.activities = [];
    this.state.activities.unshift(newAct);
    if (this.state.activities.length > 12) {
      this.state.activities.pop();
    }
  }

  getActivities() {
    return this.state.activities || [];
  }

  // --- Library View Mode ---
  getLibraryViewMode() {
    return this.state.libraryViewMode || 'grid';
  }

  setLibraryViewMode(mode) {
    this.state.libraryViewMode = mode;
    this.notify('library:viewMode', mode);
  }

  // --- Aggregate Statistics ---
  getStats() {
    const books = this.state.books || [];
    const completedBooks = books.filter(b => b.status === 'Completed');
    const currentlyReading = books.filter(b => b.status === 'Currently Reading');
    const wantToRead = books.filter(b => b.status === 'Want to Read');
    const onHold = books.filter(b => b.status === 'On Hold');
    const dropped = books.filter(b => b.status === 'Dropped');

    const totalPagesRead = books.reduce((acc, b) => acc + (Number(b.currentPage) || 0), 0);
    const totalLibraryPages = books.reduce((acc, b) => acc + (Number(b.totalPages) || 0), 0);

    const ratedBooks = books.filter(b => b.rating > 0);
    const avgRating = ratedBooks.length
      ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
      : '0.0';

    const genreMap = {};
    books.forEach(b => {
      if (b.genre) {
        genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
      }
    });

    let topGenre = 'None yet';
    let topGenreCount = 0;
    Object.entries(genreMap).forEach(([genre, count]) => {
      if (count > topGenreCount) {
        topGenreCount = count;
        topGenre = genre;
      }
    });

    const yearlyTarget = (this.state.goals && this.state.goals.yearlyTarget) || 24;
    const yearlyPercent = Math.min(100, Math.round((completedBooks.length / yearlyTarget) * 100));

    return {
      totalBooks: books.length,
      completedCount: completedBooks.length,
      currentlyReadingCount: currentlyReading.length,
      wantToReadCount: wantToRead.length,
      onHoldCount: onHold.length,
      droppedCount: dropped.length,
      totalPagesRead,
      totalLibraryPages,
      avgRating,
      topGenre,
      topGenreCount,
      genreMap,
      yearlyTarget,
      yearlyPercent,
      journalCount: (this.state.journal || []).length
    };
  }
}

export const stateManager = new StateManager();
