// Persistent chat memory (stores in localStorage)
export interface ChatMemory {
  adminName: string;
  conversationHistory: Array<{
    timestamp: string;
    userQuery: string;
    aiResponse: string;
  }>;
  preferences: {
    lastQuery?: string;
    lastMetric?: string;
  };
}

const MEMORY_KEY = 'aastha_chat_memory';
export const ADMIN_NAME = 'Mukul Pandey';

export function getChatMemory(): ChatMemory {
  if (typeof window === 'undefined') {
    return {
      adminName: ADMIN_NAME,
      conversationHistory: [],
      preferences: {}
    };
  }
  
  const stored = localStorage.getItem(MEMORY_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return { ...parsed, adminName: ADMIN_NAME }; // Always use correct name
    } catch (e) {
      console.error('Failed to parse memory:', e);
    }
  }
  
  return {
    adminName: ADMIN_NAME,
    conversationHistory: [],
    preferences: {}
  };
}

export function saveChatMemory(memory: ChatMemory) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  }
}

export function addToHistory(userQuery: string, aiResponse: string) {
  const memory = getChatMemory();
  memory.conversationHistory.push({
    timestamp: new Date().toISOString(),
    userQuery,
    aiResponse
  });
  // Keep last 50 messages
  if (memory.conversationHistory.length > 50) {
    memory.conversationHistory = memory.conversationHistory.slice(-50);
  }
  saveChatMemory(memory);
}

export function getRecentContext(): string {
  const memory = getChatMemory();
  const recent = memory.conversationHistory.slice(-3);
  return recent.map(h => `User: ${h.userQuery}\nAI: ${h.aiResponse}`).join('\n');
}
