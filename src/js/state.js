/**
 * Between the Pages - User-Scoped State Management & LocalStorage Persistence
 */

import { authService } from './auth.js';

// Pre-seeded libraries for default demo accounts
const ELEANOR_BOOKS = [
  {
    id: 'book-1',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Philosophy',
    totalPages: 208,
    currentPage: 142,
    status: 'Currently Reading',
    rating: 5,
    coverUrl: '/src/assets/images/book_the_alchemist_1793596040207.jpg',
    startDate: '2026-10-14',
    completedDate: '',
    notes: 'A transcendent fable about listening to your heart and recognizing the omens scattered along life’s journey.',
    isFavorite: true,
    addedAt: '2026-10-12T10:00:00.000Z'
  },
  {
    id: 'book-2',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    totalPages: 320,
    currentPage: 320,
    status: 'Completed',
    rating: 5,
    coverUrl: '/src/assets/images/book_atomic_habits_1793596040498.jpg',
    startDate: '2026-09-01',
    completedDate: '2026-09-22',
    notes: 'Incredible framework on the power of compounding 1% improvements every day. Transformed my evening reading habits.',
    isFavorite: true,
    addedAt: '2026-08-30T14:30:00.000Z'
  },
  {
    id: 'book-3',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    genre: 'Psychological Thriller',
    totalPages: 336,
    currentPage: 218,
    status: 'Currently Reading',
    rating: 4,
    coverUrl: '/src/assets/images/book_silent_patient_1793596040925.jpg',
    startDate: '2026-10-20',
    completedDate: '',
    notes: 'Alicia Berenson’s silence is chilling and magnetic. The mythological references to Alcestis add layered depth to the mystery.',
    isFavorite: false,
    addedAt: '2026-10-19T18:20:00.000Z'
  },
  {
    id: 'book-4',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    genre: 'Historical Fiction',
    totalPages: 552,
    currentPage: 0,
    status: 'Want to Read',
    rating: 0,
    coverUrl: '/src/assets/images/book_book_thief_1793596042433.jpg',
    startDate: '',
    completedDate: '',
    notes: 'Highly anticipated next read. Told from the perspective of Death in 1939 Nazi Germany.',
    isFavorite: false,
    addedAt: '2026-10-25T09:15:00.000Z'
  },
  {
    id: 'book-5',
    title: 'Ikigai: The Japanese Secret to a Long and Happy Life',
    author: 'Héctor García & Francesc Miralles',
    genre: 'Philosophy',
    totalPages: 208,
    currentPage: 208,
    status: 'Completed',
    rating: 4.5,
    coverUrl: '/src/assets/images/book_ikigai_1793596041279.jpg',
    startDate: '2026-08-10',
    completedDate: '2026-08-28',
    notes: 'Gentle, heartwarming wisdom from the centenarians of Ogimi village in Okinawa. Encourages finding joy in simple rituals.',
    isFavorite: true,
    addedAt: '2026-08-05T12:00:00.000Z'
  }
];

const ELEANOR_JOURNAL = [
  {
    id: 'journal-1',
    bookId: 'book-1',
    bookTitle: 'The Alchemist',
    title: 'The language of the desert',
    date: '2026-10-28',
    quote: 'When you want something, all the universe conspires in helping you to achieve it.',
    reflection: 'Re-reading this chapter by candlelight tonight brought such immense stillness. Coelho reminds us that fear of suffering is far worse than the suffering itself.',
    mood: 'Contemplative'
  },
  {
    id: 'journal-2',
    bookId: 'book-2',
    bookTitle: 'Atomic Habits',
    title: 'Identity over outcome',
    date: '2026-09-18',
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    reflection: 'The realization that every action is a vote for the person you wish to become has stuck with me for weeks. Setting my book on the pillow each morning guarantees 20 pages before bed.',
    mood: 'Inspired'
  },
  {
    id: 'journal-3',
    bookId: 'book-5',
    bookTitle: 'Ikigai: The Japanese Secret to a Long and Happy Life',
    title: 'The art of staying unhurried',
    date: '2026-08-24',
    quote: 'Only staying active will make you want to live a hundred years.',
    reflection: 'The concept of Hara Hachi Bu (eating until 80% full) extends so naturally into mental clarity and creative work. Read this outside among the pine trees.',
    mood: 'Peaceful'
  }
];

const JULIAN_BOOKS = [
  {
    id: 'book-j1',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    genre: 'Psychological Thriller',
    totalPages: 336,
    currentPage: 336,
    status: 'Completed',
    rating: 5,
    coverUrl: '/src/assets/images/book_silent_patient_1793596040925.jpg',
    startDate: '2026-09-02',
    completedDate: '2026-09-19',
    notes: 'An exquisite psychological labyrinth. The narrator Theo Faber is wonderfully complex.',
    isFavorite: true,
    addedAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'book-j2',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: 'Philosophy',
    totalPages: 208,
    currentPage: 88,
    status: 'Currently Reading',
    rating: 4.5,
    coverUrl: '/src/assets/images/book_the_alchemist_1793596040207.jpg',
    startDate: '2026-10-18',
    completedDate: '',
    notes: 'Delving into Santiago’s voyage across Andalusia.',
    isFavorite: true,
    addedAt: '2026-10-15T11:00:00.000Z'
  },
  {
    id: 'book-j3',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    genre: 'Historical Fiction',
    totalPages: 552,
    currentPage: 310,
    status: 'Currently Reading',
    rating: 5,
    coverUrl: '/src/assets/images/book_book_thief_1793596042433.jpg',
    startDate: '2026-10-01',
    completedDate: '',
    notes: 'Liesel Meminger learning to read in the basement by kerosene light is unforgettable.',
    isFavorite: false,
    addedAt: '2026-09-28T19:00:00.000Z'
  }
];

const JULIAN_JOURNAL = [
  {
    id: 'journal-j1',
    bookId: 'book-j1',
    bookTitle: 'The Silent Patient',
    title: 'On Euripides and Alcestis',
    date: '2026-09-14',
    quote: 'We often look for happiness in the wrong places, because we do not know who we are.',
    reflection: 'The psychological depth of grief and silence explored through ancient Athenian drama was executed with extraordinary taste.',
    mood: 'Challenged'
  }
];

class StateManager {
  constructor() {
    this.listeners = [];
    this.userId = null;
    this.state = this.loadStateForActiveUser();

    // Listen to authentication changes
    authService.onAuthChange((event, user) => {
      this.setUser(user);
    });
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
          coverUrl: '/src/assets/images/book_the_alchemist_1793596040207.jpg',
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

  setUser(user) {
    this.userId = user ? user.id : 'guest';
    this.state = this.loadStateForActiveUser();
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

  addBook(bookData) {
    const newBook = {
      id: 'book-' + Date.now(),
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      genre: bookData.genre || 'General Fiction',
      totalPages: Number(bookData.totalPages) || 1,
      currentPage: Number(bookData.currentPage) || 0,
      status: bookData.status || 'Want to Read',
      rating: Number(bookData.rating) || 0,
      coverUrl: bookData.coverUrl || '/src/assets/images/book_the_alchemist_1793596040207.jpg',
      startDate: bookData.startDate || '',
      completedDate: bookData.completedDate || '',
      notes: bookData.notes || '',
      isFavorite: Boolean(bookData.isFavorite),
      addedAt: new Date().toISOString()
    };

    if (newBook.currentPage >= newBook.totalPages && newBook.totalPages > 0) {
      newBook.currentPage = newBook.totalPages;
      newBook.status = 'Completed';
      if (!newBook.completedDate) {
        newBook.completedDate = new Date().toISOString().split('T')[0];
      }
    }

    this.state.books.unshift(newBook);
    this.logActivity(`Added <strong>${newBook.title}</strong> to your library`);
    this.notify('book:added', newBook);
    return newBook;
  }

  updateBook(id, updates) {
    const index = this.state.books.findIndex(b => b.id === id);
    if (index === -1) return null;

    const oldBook = this.state.books[index];
    const updated = { ...oldBook, ...updates };

    if (updates.totalPages !== undefined) updated.totalPages = Number(updates.totalPages);
    if (updates.currentPage !== undefined) updated.currentPage = Math.min(Number(updates.currentPage), updated.totalPages);
    if (updates.rating !== undefined) updated.rating = Number(updates.rating);

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

    this.state.books[index] = updated;

    if (completedJustNow) {
      this.logActivity(`Finished reading <strong>${updated.title}</strong>! 🎉`);
    } else if (updates.currentPage !== undefined && updates.currentPage !== oldBook.currentPage) {
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
  }

  deleteBook(id) {
    const book = this.getBookById(id);
    if (!book) return;

    this.state.books = this.state.books.filter(b => b.id !== id);
    this.logActivity(`Removed <strong>${book.title}</strong> from library`);
    this.notify('book:deleted', id);
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
    return this.state.goals || { yearlyTarget: 24, monthlyTarget: 2, currentYear: 2026 };
  }

  updateGoals(yearly, monthly) {
    this.state.goals.yearlyTarget = Number(yearly) || 24;
    this.state.goals.monthlyTarget = Number(monthly) || 2;
    this.logActivity(`Updated ${this.state.goals.currentYear} reading target to ${this.state.goals.yearlyTarget} books`);
    this.notify('goals:updated', this.state.goals);
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
