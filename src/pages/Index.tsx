import React, { useState, useEffect } from 'react';
import { World } from '@/components/World';
import { GodPanel } from '@/components/GodPanel';
import { EventLog } from '@/components/EventLog';

const Index = () => {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <div className="flex-1 relative">
        <World />
      </div>
      <div className="w-96 glass-panel m-4 p-4 flex flex-col gap-4">
        <GodPanel />
        <EventLog />
      </div>
    </div>
  );
};

export default Index;