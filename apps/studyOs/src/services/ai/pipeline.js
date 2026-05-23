import { useAIStore } from '../../store/aiStore';
import { callLLMWithFallback } from './providers';
import { parseIntent } from './parser';
import { validateIntent } from './validator';
import { dispatchIntent } from './dispatcher';

export const processAICommand = async (rawInput) => {
  const store = useAIStore.getState();
  store.setStatus('processing');
  store.addLog({ type: 'input', message: rawInput });

  try {
    // 1. Call LLM with fallback
    const { result, provider, latency } = await callLLMWithFallback(rawInput);
    store.setLatency(latency);
    store.addLog({ type: 'system', message: `Parsed via ${provider} in ${latency.toFixed(0)}ms` });

    // 2. Parse Intent
    const intent = parseIntent(rawInput, result);
    store.addLog({ type: 'intent', message: JSON.stringify(intent) });

    // 3. Validate Intent
    const validation = validateIntent(intent);

    if (!validation.valid) {
      store.addLog({ type: 'error', message: validation.error });
      store.setStatus('error');
      // After a short delay, return to connected
      setTimeout(() => useAIStore.getState().setStatus('connected'), 3000);
      return;
    }

    // 4. Check for Destructive Action
    if (validation.requiresApproval) {
      store.addLog({ type: 'system', message: `Action requires approval: ${intent.tool}` });
      store.setPendingAction(intent);
      return; // Stop here, wait for UI approval
    }

    // 5. Dispatch
    dispatchIntent(intent);
    store.addLog({ type: 'success', message: `Executed: ${intent.tool}` });
    store.setStatus('connected');

  } catch (err) {
    store.addLog({ type: 'error', message: err.message });
    store.setStatus('error');
    setTimeout(() => useAIStore.getState().setStatus('connected'), 3000);
  }
};

export const approvePendingAction = () => {
  const store = useAIStore.getState();
  if (store.pendingAction) {
    dispatchIntent(store.pendingAction);
    store.addLog({ type: 'success', message: `Approved & Executed: ${store.pendingAction.tool}` });
    store.clearPendingAction();
  }
};

export const rejectPendingAction = () => {
  const store = useAIStore.getState();
  store.addLog({ type: 'system', message: `Action rejected.` });
  store.clearPendingAction();
};
