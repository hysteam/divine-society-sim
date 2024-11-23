import { create } from 'zustand';

interface Event {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

interface EventStore {
  events: Event[];
  addEvent: (event: Omit<Event, 'timestamp'>) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) =>
    set((state) => ({
      events: [
        {
          ...event,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...state.events,
      ].slice(0, 100), // Keep last 100 events
    })),
  clearEvents: () => set({ events: [] }),
}));