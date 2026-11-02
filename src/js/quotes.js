/**
 * Between the Pages - Curated Reading Quotes
 */

export const READING_QUOTES = [
  {
    quote: "I have always imagined that Paradise will be a kind of a library.",
    author: "Jorge Luis Borges",
    source: "Poem of the Gifts"
  },
  {
    quote: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin",
    source: "A Dance with Dragons"
  },
  {
    quote: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway",
    source: "Letters"
  },
  {
    quote: "You can never get a cup of tea large enough or a book long enough to suit me.",
    author: "C.S. Lewis",
    source: "Reflections"
  },
  {
    quote: "Books are a uniquely portable magic.",
    author: "Stephen King",
    source: "On Writing"
  },
  {
    quote: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.",
    author: "Haruki Murakami",
    source: "Norwegian Wood"
  },
  {
    quote: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
    source: "Classical Epistles"
  },
  {
    quote: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.",
    author: "J.K. Rowling",
    source: "The Deathly Hallows"
  },
  {
    quote: "Reading is that fruitful miracle of a communication in the midst of solitude.",
    author: "Marcel Proust",
    source: "On Reading"
  },
  {
    quote: "When I have a little money, I buy books; and if I have any left, I buy food and clothes.",
    author: "Desiderius Erasmus",
    source: "Epistles"
  },
  {
    quote: "One must always be careful of books, and what is inside them, for words have the power to change us.",
    author: "Cassandra Clare",
    source: "Clockwork Angel"
  },
  {
    quote: "That is part of the beauty of all literature. You discover that your longings are universal longings, that you're not lonely and isolated from anyone. You belong.",
    author: "F. Scott Fitzgerald",
    source: "Conversations"
  }
];

let currentQuoteIndex = 0;

export function getQuoteOfTheDay() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  currentQuoteIndex = dayOfYear % READING_QUOTES.length;
  return READING_QUOTES[currentQuoteIndex];
}

export function getRandomQuote() {
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * READING_QUOTES.length);
  } while (nextIndex === currentQuoteIndex && READING_QUOTES.length > 1);
  currentQuoteIndex = nextIndex;
  return READING_QUOTES[currentQuoteIndex];
}
