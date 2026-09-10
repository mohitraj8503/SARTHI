'use client';

type SSECallback = (payload: any) => void;

class SSEManager {
  private static instance: SSEManager;
  private eventSource: EventSource | null = null;
  private listeners: Set<SSECallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private currentUrl: string | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  connect(url: string) {
    // If already connecting or connected to the same URL, do nothing
    if (this.currentUrl === url && this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
      return;
    }

    this.disconnect();
    this.currentUrl = url;
    
    console.log(`📡 SSEManager: Connecting to ${url}`);
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('✅ SSEManager: Connection established');
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      if (event.data === ': keep-alive') return;
      
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'connected' || payload.warning === 'realtime_disabled') {
          return;
        }
        
        // Broadcast to all listeners
        this.listeners.forEach(callback => callback(payload));
      } catch (err) {
        console.warn('⚠️ SSEManager: Error parsing message payload', err);
      }
    };

    this.eventSource.onerror = () => {
      console.warn('⚠️ SSEManager: Stream disconnected, initiating reconnect...');
      this.handleReconnect();
    };
  }

  private handleReconnect() {
    this.disconnect(false); // Disconnect but keep listeners

    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentUrl) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`🔄 SSEManager: Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        if (this.currentUrl) this.connect(this.currentUrl);
      }, delay);
    } else {
      console.warn('⚠️ SSEManager: Standby mode (Max reconnect attempts reached)');
    }
  }

  subscribe(callback: SSECallback) {
    this.listeners.add(callback);
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback: SSECallback) {
    this.listeners.delete(callback);
    // If no more listeners, we could disconnect, but maybe better to keep it alive for a bit
    // if (this.listeners.size === 0) this.disconnect();
  }

  disconnect(clearUrl = true) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (clearUrl) {
      this.currentUrl = null;
      this.reconnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const sseManager = SSEManager.getInstance();
