/**
 * textGenerators.js
 * Specialized text generation for different typing modes.
 */
import { commonWords } from './wordUtils';

export const generateStandardWords = (count = 25) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * commonWords.length);
    result.push(commonWords[randomIndex]);
  }
  return result.join(' ');
};

export const generateRowText = (row, count = 10) => {
  const rows = {
    home: "asdfghjkl;",
    top: "qwertyuiop",
    bottom: "zxcvbnm,./",
    numbers: "1234567890",
    symbols: "!@#$%^&*()_+{}|:\"<>?~`-=[]\\;',./"
  };

  const chars = rows[row] || rows.home;
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const wordLen = Math.floor(Math.random() * 4) + 2;
    let word = "";
    for (let j = 0; j < wordLen; j++) {
      word += chars[Math.floor(Math.random() * chars.length)];
    }
    result.push(word);
  }
  return result.join(' ');
};

export const codingSnippets = {
  javascript: [
    "function debounce(fn, ms) { let timeoutId; return function(...args) { clearTimeout(timeoutId); timeoutId = setTimeout(() => fn.apply(this, args), ms); }; }",
    "const uniqueArray = [...new Set([1, 2, 2, 3, 4, 4, 5])];",
    "const fetchData = async (url) => { try { const response = await fetch(url); return await response.json(); } catch (err) { console.error(err); } };",
    "document.addEventListener('DOMContentLoaded', () => { const root = document.getElementById('root'); console.log('Ready!'); });"
  ],
  python: [
    "def factorial(n): return 1 if n == 0 else n * factorial(n - 1)",
    "names = ['Alice', 'Bob', 'Charlie']; [name.upper() for name in names if len(name) > 3]",
    "with open('data.txt', 'r') as f: content = f.read(); print(f'File size: {len(content)}')",
    "class User: def __init__(self, name): self.name = name; def greet(self): print(f'Hello, {self.name}')"
  ],
  html: [
    "<div class='container'> <header> <h1>Welcome</h1> </header> <main> <p>Hello World</p> </main> </div>",
    "<form action='/submit' method='POST'> <input type='email' placeholder='Email' required /> <button type='submit'>Send</button> </form>",
    "<ul> <li>Item One</li> <li>Item Two</li> <li>Item Three</li> </ul>"
  ],
  css: [
    ".card { display: flex; align-items: center; justify-content: center; padding: 2rem; border-radius: 1rem; background: var(--bg); }",
    "@media (max-width: 768px) { .sidebar { display: none; } .mobile-menu { display: block; } }",
    ".btn:hover { transform: scale(1.05); filter: brightness(1.2); transition: all 0.2s ease; }"
  ],
  terminal: [
    "npm install lucide-react framer-motion zustand axios",
    "git checkout -b feature/typing-master-upgrade",
    "docker-compose up -d --build",
    "grep -r 'TODO' ./src --include='*.js'"
  ]
};

export const generateCodingText = (language) => {
  const snippets = codingSnippets[language] || codingSnippets.javascript;
  return snippets[Math.floor(Math.random() * snippets.length)];
};
