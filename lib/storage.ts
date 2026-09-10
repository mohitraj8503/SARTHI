
type StorageType = 'local' | 'session';

class StorageUtility {
    private getStorage(type: StorageType): Storage | null {
        if (typeof window === 'undefined') return null;
        try {
            return type === 'local' ? window.localStorage : window.sessionStorage;
        } catch (e) {
            console.error('Storage access denied:', e);
            return null;
        }
    }

    /**
     * Save data to storage
     * @param key Unique key
     * @param value Data to save (will be JSON stringified)
     * @param shared If true, uses localStorage (persists). If false, uses sessionStorage (tab only).
     */
     
    set(key: string, value: any, shared: boolean = false): boolean {
        const storage = this.getStorage(shared ? 'local' : 'session');
        if (!storage) return false;

        try {
            const stringValue = JSON.stringify(value);
            storage.setItem(key, stringValue);
            console.log(`[Storage] Set ${key} in ${shared ? 'local' : 'session'}`);
            return true;
        } catch (e) {
            console.error(`Failed to save key "${key}":`, e);
            return false;
        }
    }

    /**
     * Get data from storage
     * @param key Unique key
     * @param shared If true, checks localStorage. If false, checks sessionStorage.
     */
    get<T>(key: string, shared: boolean = false): T | null {
        const storage = this.getStorage(shared ? 'local' : 'session');
        if (!storage) return null;

        try {
            const value = storage.getItem(key);
            if (!value) return null;
            const parsed = JSON.parse(value) as T;
            // console.log(`[Storage] Get ${key} from ${shared ? 'local' : 'session'}`); // Too noisy usually
            return parsed;
        } catch (e) {
            console.error(`Failed to read key "${key}":`, e);
            return null;
        }
    }

    /**
     * Remove data from storage
     * @param key Unique key
     * @param shared If true, removes from localStorage. If false, from sessionStorage.
     */
    remove(key: string, shared: boolean = false): boolean {
        const storage = this.getStorage(shared ? 'local' : 'session');
        if (!storage) return false;

        try {
            storage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Failed to remove key "${key}":`, e);
            return false;
        }
    }

    /**
     * List all values matching a prefix
     * @param prefix Key prefix (e.g., 'users:')
     * @param shared If true, searches localStorage. If false, sessionStorage.
     */
    list<T>(prefix: string, shared: boolean = false): T[] {
        const storage = this.getStorage(shared ? 'local' : 'session');
        if (!storage) return [];

        const results: T[] = [];
        try {
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key.startsWith(prefix)) {
                    const value = this.get<T>(key, shared);
                    if (value) results.push(value);
                }
            }
            console.log(`[Storage] List ${prefix} from ${shared ? 'local' : 'session'} found ${results.length} items`);
        } catch (e) {
            console.error(`Failed to list keys with prefix "${prefix}":`, e);
        }
        return results;
    }

    /**
     * Clear all data (use with caution)
     */
    clear(shared: boolean = false): void {
        const storage = this.getStorage(shared ? 'local' : 'session');
        if (storage) storage.clear();
    }
}

export const storage = new StorageUtility();
