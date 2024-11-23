import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEventStore } from '@/stores/eventStore';

export const EventLog = () => {
  const { events } = useEventStore();

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-lg font-semibold mb-2">Event Log</div>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {events.map((event, index) => (
            <div
              key={index}
              className="p-2 glass-panel animate-fade-in"
            >
              <div className="text-sm text-white/80">{event.timestamp}</div>
              <div>{event.message}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};