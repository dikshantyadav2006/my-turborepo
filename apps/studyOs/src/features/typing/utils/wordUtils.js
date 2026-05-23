export const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "write", "our", "under", "name", "very", "through", "just", "form", "sentence", "great",
  "think", "say", "help", "low", "line", "differ", "turn", "cause", "much", "mean",
  "before", "move", "right", "boy", "old", "too", "same", "tell", "does", "set",
  "three", "want", "air", "well", "also", "play", "small", "end", "put", "home",
  "read", "hand", "port", "large", "spell", "add", "even", "land", "here", "must",
  "big", "high", "such", "follow", "act", "why", "ask", "men", "change", "went",
  "light", "kind", "off", "need", "house", "picture", "try", "us", "again", "animal",
  "point", "mother", "world", "near", "build", "self", "earth", "father", "head", "stand",
  "own", "page", "should", "country", "found", "answer", "school", "grow", "study", "still",
  "learn", "plant", "cover", "food", "sun", "four", "between", "state", "keep", "eye",
  "never", "last", "let", "thought", "city", "tree", "cross", "farm", "hard", "start",
  "might", "story", "saw", "far", "sea", "draw", "left", "late", "run", "dont",
  "while", "press", "close", "night", "real", "life", "few", "north", "open", "seem",
  "together", "next", "white", "children", "begin", "got", "walk", "example", "ease", "paper",
  "group", "always", "music", "those", "both", "mark", "often", "letter", "until", "mile",
  "river", "car", "feet", "care", "second", "book", "carry", "took", "science", "eat"
];

export const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Knowledge is power. Information is liberating. Education is the premise of progress.", author: "Kofi Annan" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" }
];

export const generateWords = (count = 50) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * commonWords.length);
    result.push(commonWords[randomIndex]);
  }
  return result;
};

export const lessons = [
  {
    id: 'beginner-1',
    title: 'Home Row Basics',
    description: 'Master the keys: a, s, d, f, j, k, l, ;',
    characters: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    difficulty: 'Beginner'
  },
  {
    id: 'beginner-2',
    title: 'Top Row Introduction',
    description: 'Learn the q, w, e, r, t keys',
    characters: ['q', 'w', 'e', 'r', 't'],
    difficulty: 'Beginner'
  },
  {
    id: 'beginner-3',
    title: 'Bottom Row Basics',
    description: 'Master the z, x, c, v, b keys',
    characters: ['z', 'x', 'c', 'v', 'b'],
    difficulty: 'Beginner'
  },
  {
    id: 'intermediate-1',
    title: 'Number Mastery',
    description: 'Learn the number row efficiently',
    characters: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    difficulty: 'Intermediate'
  }
];
