import React, { useState, useEffect } from 'react';
import { World } from '@/components/World';
import { GodPanel } from '@/components/GodPanel';
import { EventLog } from '@/components/EventLog';
import { SpeciesDialog } from '@/components/SpeciesDialog';
import { useAgentStore } from '@/stores/agentStore';
import { useEventStore } from '@/stores/eventStore';
import { ApiKeyInput } from '@/components/ApiKeyInput';

const TICK_INTERVAL = 1000; // 1 second

const Index = () => {
  const [showSpeciesDialog, setShowSpeciesDialog] = useState(true);
  const { agents, updateAgent } = useAgentStore();
  const { addEvent } = useEventStore();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      agents.forEach(agent => {
        if (Date.now() - agent.lastAction < 2000) return; // Wait 2 seconds between actions

        // Determine action based on species behavior
        let action = '';
        let newX = agent.x;
        let newY = agent.y;
        let newResources = [...agent.resources];
        let newStatus = 'idle';

        switch (agent.species) {
          case 'Gatherers':
            // Move randomly and gather resources
            newX = Math.min(Math.max(agent.x + (Math.random() - 0.5) * 2, 0), 49);
            newY = Math.min(Math.max(agent.y + (Math.random() - 0.5) * 2, 0), 29);
            if (Math.random() < 0.3) {
              newResources.push('food');
              action = 'gathered food';
              newStatus = 'gathering';
            }
            break;

          case 'Builders':
            // Stay in place and build
            if (Math.random() < 0.2) {
              action = 'constructed shelter';
              newStatus = 'building';
            }
            break;

          case 'Explorers':
            // Move more actively
            newX = Math.min(Math.max(agent.x + (Math.random() - 0.5) * 4, 0), 49);
            newY = Math.min(Math.max(agent.y + (Math.random() - 0.5) * 4, 0), 29);
            if (Math.random() < 0.2) {
              action = 'discovered new area';
              newStatus = 'exploring';
            }
            break;

          case 'Traders':
            // Move between other agents
            const nearbyAgent = agents.find(a => 
              a.id !== agent.id && 
              Math.abs(a.x - agent.x) < 5 && 
              Math.abs(a.y - agent.y) < 5
            );
            if (nearbyAgent) {
              action = `traded with ${nearbyAgent.name}`;
              newStatus = 'trading';
            } else {
              newX = Math.min(Math.max(agent.x + (Math.random() - 0.5) * 3, 0), 49);
              newY = Math.min(Math.max(agent.y + (Math.random() - 0.5) * 3, 0), 29);
            }
            break;
        }

        if (action) {
          addEvent({
            message: `${agent.name} ${action}`,
            type: 'info'
          });
        }

        updateAgent(agent.id, {
          ...agent,
          x: newX,
          y: newY,
          resources: newResources,
          status: newStatus,
          lastAction: Date.now()
        });
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [agents, updateAgent, addEvent]);

  return (
    <div>
      <div className="flex h-screen w-screen bg-background overflow-hidden">
        <div className="flex-1 relative">
          <World />
        </div>
        <div className="w-96 glass-panel m-4 p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4">
        <div className="text-lg font-semibold flex justify-between items-center"><div>God AI Interface</div>
            <button
              className="bg-white text-black py-2 px-4 rounded-md pb-2 hover:bg-gray-200"
              onClick={() => setShowApiKeyInput(true)}
            >
              Set API Key
            </button>
            </div>
          <GodPanel />
          </div>
          <div className="flex-1 overflow-y-auto">
            <ApiKeyInput open={showApiKeyInput} onOpenChange={setShowApiKeyInput}  />
            <EventLog />
          </div>
        </div>
      </div>
      <SpeciesDialog 
        open={showSpeciesDialog} 
        onOpenChange={setShowSpeciesDialog} 
      />
    </div>
  );
};

export default Index;