const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Mock providers - in a real scenario, use actual fetch/axios calls to their respective endpoints
export const OpenRouterAdapter = async (prompt) => {
  // Simulate network request
  await delay(600);
  // Throw random error sometimes to simulate fallback
  if (Math.random() > 0.8) throw new Error("OpenRouter API Error");
  return `{"tool": "PARSE_INTENT", "payload": {"raw": "${prompt}"}, "confidence": 0.95}`;
};

export const OpenAIAdapter = async (prompt) => {
  await delay(500);
  if (Math.random() > 0.9) throw new Error("OpenAI API Error");
  return `{"tool": "PARSE_INTENT", "payload": {"raw": "${prompt}"}, "confidence": 0.9}`;
};

export const GroqAdapter = async (prompt) => {
  await delay(300);
  return `{"tool": "PARSE_INTENT", "payload": {"raw": "${prompt}"}, "confidence": 0.85}`;
};

export const callLLMWithFallback = async (prompt) => {
  const providers = [
    { name: 'OpenRouter', fn: OpenRouterAdapter },
    { name: 'OpenAI', fn: OpenAIAdapter },
    { name: 'Groq', fn: GroqAdapter },
  ];

  const errors = [];
  
  for (const provider of providers) {
    try {
      const start = performance.now();
      const result = await provider.fn(prompt);
      const latency = performance.now() - start;
      return { result, provider: provider.name, latency };
    } catch (err) {
      errors.push({ provider: provider.name, error: err.message });
      console.warn(`[AI Provider Failed] ${provider.name}`, err);
      // continue to next provider
    }
  }

  throw new Error(`All providers failed: ${JSON.stringify(errors)}`);
};
