# Contributing to Study OS

Welcome to the SHAI Library development team! We follow strict engineering standards to maintain a premium, state-of-the-art user experience.

## 🎨 Design Language
- **Colors**: Primarily Zinc (Zinc-950 for background, Zinc-900 for cards). Use Emerald/Green for success/productivity accents.
- **Typography**: Inter / System sans-serif.
- **Micro-animations**: Use Framer Motion for all transitions. Avoid abrupt UI changes.

## 🏗️ Clean Code Principles
1. **Component Purity**: Components should do one thing well. Break down large components into smaller sub-components inside the feature's `components/` folder.
2. **Prop Destructuring**: Always destructure props.
   ```javascript
   const TaskItem = ({ task, onToggle }) => { ... }
   ```
3. **No Key Spreading**: Avoid `<div {...props}>` if `props` contains a `key`. Pass the key explicitly.
   ```javascript
   <div key={key} {...rest}>
   ```

## 🔄 State Flow
- **Data Fetching**: Use standard Axios with the global `withCredentials` config.
- **Persistence**: If the data belongs to the user's progress (XP, tasks, settings), it **must** be persisted in the Zustand store.
- **Local Cache**: Use Dexie.js for heavy data (like notes or logs) that should be available instantly.

## 🚀 Deployment
- Never push `.env` files.
- Ensure all lazy-loaded routes have a meaningful fallback.
- Run `npm run build` before submitting a PR to ensure there are no TypeScript/Build errors.

## 🛡️ Security
- **Auth**: Never store JWTs in `localStorage`. Use the shared `httpOnly` cookie system.
- **Input**: Sanitize all markdown inputs in the Notes feature.

---

Let's build the future of study platforms! 🚀
