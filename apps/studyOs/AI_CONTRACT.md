# AI Pipeline Contract

This document outlines the strict rules and architecture for the Study OS AI Pipeline.

## 1. Principles
- **No Direct Mutation:** The AI subsystem MUST NOT directly mutate the database or UI state.
- **Strict Parsing:** All natural language input must be strictly parsed into an intent object: `{ tool: string, payload: object, confidence: number }`.
- **Event-Driven:** Actions must follow the flow: `AI -> Validator -> Event -> Dispatcher -> Store`.
- **Approval for Destructive Actions:** Deleting data, resetting configurations, or any destructive action MUST require manual user approval.
- **Resilience:** The pipeline must include a retry and fallback mechanism across multiple providers (OpenRouter -> OpenAI -> Groq).

## 2. Intent Schema
All parsed intents must adhere to the following schema:
```json
{
  "tool": "START_TIMER" | "CREATE_TASK" | "CREATE_NOTE" | "ENTER_FOCUS_MODE" | "DELETE_TASK" | "DELETE_NOTE",
  "payload": {},
  "confidence": 0.95
}
```

## 3. Data Flow
1. **Input:** User speaks or types natural language.
2. **Pipeline:** The query is sent to the `Pipeline`, which tries `OpenRouter` first. If it fails, it tries `OpenAI`, then `Groq`.
3. **Parser:** The model's response is structured by the `Parser` into an intent.
4. **Validator:** The `Validator` checks if the tool is supported, validates payload, and flags if it needs approval (destructive).
5. **Event Bus/Dispatcher:** Validated events are passed to the `Dispatcher`.
6. **Store:** The `Dispatcher` calls the appropriate methods in `Zustand` stores to mutate state.

## 4. UI Requirements
The AI Command Center UI must display:
- Microphone button
- Real-time transcript
- Command logs
- AI System Status (connected, processing, etc.)
- Latency metrics
- Reconnect state

## 5. Security & Safety
- **Prompt Injection Protection:** The parser must strictly enforce JSON output and validate schemas.
- **Fail-Safe:** If confidence is below 0.7, the system must ask for user clarification instead of acting.
