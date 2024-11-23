import React, { useEffect, useRef } from 'react';
import { useEventStore } from '@/stores/eventStore';

const getEventIcon = (type: string) => {
  switch (type) {
    case 'speech': return '💬';
    case 'action': return '⚡';
    case 'info': return 'ℹ️';
    case 'error': return '❌';
    default: return '•';
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'speech': return 'text-blue-400';
    case 'action': return 'text-green-400';
    case 'info': return 'text-gray-400';
    case 'error': return 'text-red-400';
    default: return 'text-white';
  }
};

export const EventLog = () => {
  const { events } = useEventStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-semibold mb-2">Event Log</div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar"
      >
        {events.map((event, index) => (
          <div 
            key={index}
            className={`flex items-start gap-2 text-sm ${getEventColor(event.type)}`}
          >
            <span className="flex-shrink-0 mt-1">{getEventIcon(event.type)}</span>
            <span className="flex-1 break-words">{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};