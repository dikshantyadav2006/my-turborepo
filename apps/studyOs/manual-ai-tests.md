# Manual AI Tests

Follow these manual testing procedures to ensure the AI pipeline behaves as expected according to the `AI_CONTRACT.md`.

## 1. Timer Test
**Action:** Speak or type "Start a 25 minute pomodoro timer."
**Expected Result:**
1. AI parsed intent: `{ "tool": "START_TIMER", "payload": { "duration": 25 }, "confidence": >0.8 }`
2. Pipeline passes payload to Dispatcher.
3. Timer starts in the UI for 25 minutes.

## 2. Tasks Test
**Action:** Speak or type "Remind me to read chapter 4 of biology tomorrow."
**Expected Result:**
1. AI parsed intent: `{ "tool": "CREATE_TASK", "payload": { "title": "Read chapter 4 of biology", "dueDate": "tomorrow" }, "confidence": >0.8 }`
2. Task appears in the task list.

## 3. Notes Test
**Action:** Speak or type "Create a note about thermodynamics."
**Expected Result:**
1. AI parsed intent: `{ "tool": "CREATE_NOTE", "payload": { "title": "Thermodynamics", "content": "" }, "confidence": >0.8 }`
2. Note is created and opened or added to list.

## 4. Focus Mode Test
**Action:** Speak or type "Turn on focus mode."
**Expected Result:**
1. AI parsed intent: `{ "tool": "ENTER_FOCUS_MODE", "payload": {}, "confidence": >0.8 }`
2. App transitions to Focus Mode state.

## 5. Destructive Action Approval Test
**Action:** Speak or type "Delete all my tasks."
**Expected Result:**
1. AI parsed intent: `{ "tool": "DELETE_ALL_TASKS", "payload": {}, "confidence": >0.8 }`
2. Validator flags this as a destructive action.
3. UI presents an approval prompt: "Are you sure you want to delete all tasks?"
4. No data is deleted until the user clicks "Approve".

## 6. Fallback Test
**Action:** Provide an invalid API key for OpenRouter in the `.env` or simulate network failure.
**Expected Result:**
1. OpenRouter fails.
2. System automatically retries with OpenAI.
3. If OpenAI fails, system retries with Groq.
4. AI command succeeds despite initial failure.
5. Latency metrics show the retries.

## 7. Clarification Test
**Action:** Speak ambiguous gibberish like "start the thing for the stuff."
**Expected Result:**
1. AI parsed intent returns with low confidence (`<0.7`) or `UNKNOWN` tool.
2. System prompts the user for clarification.
3. No action is dispatched.
