import { EventEmitter } from 'events';

// Canonical event envelope (JSON) as per design document
export interface RealtimeEvent {
    eventId: string;
    version: string;
    source: string;
    timestamp: string;
    type: string;
    metadata: {
        actorId?: string;
        correlationId?: string;
        traceId?: string;
    };
    payload: {
        entity: string;
        action: 'CREATE' | 'UPDATE' | 'DELETE';
        id: string;
        before?: any;
        after?: any;
        diff?: any;
    };
}

class EventBus extends EventEmitter {
    private static instance: EventBus;

    private constructor() {
        super();
        // In production, this could be backed by Redis Streams or Kafka
        console.log('🚀 Real-time Event Bus Initialized');
        
        // Auto-initialize Notification Service on Server
        if (typeof window === 'undefined') {
            this.initServices();
        }
    }

    private async initServices() {
        try {
            const { NotificationService } = await import('@/lib/services/notification.service');
            NotificationService.init();
        } catch (err) {
            console.warn('[EventBus] Failed to init NotificationService:', err);
        }
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public emitEvent(event: RealtimeEvent) {
        this.emit('db_change', event);
    }
}

export const eventBus = EventBus.getInstance();
