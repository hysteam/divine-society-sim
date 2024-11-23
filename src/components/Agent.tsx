import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AgentProps {
  agent: {
    id: string;
    name: string;
    x: number;
    y: number;
    status: string;
    resources: string[];
    species: string;
    traits: string[];
    behavior: string;
  };
  scale: number;
  offsetX: number;
  offsetY: number;
}

const getSpeciesEmoji = (species: string) => {
  switch (species) {
    case 'Gatherers': return '🌾';
    case 'Builders': return '🏗️';
    case 'Explorers': return '🧭';
    case 'Traders': return '💰';
    default: return '👤';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'gathering': return 'bg-green-500';
    case 'building': return 'bg-yellow-500';
    case 'exploring': return 'bg-blue-500';
    case 'trading': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export const Agent = ({ agent, scale, offsetX, offsetY }: AgentProps) => {
  const TILE_SIZE = 32;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className="absolute transition-all duration-200 flex items-center justify-center"
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              transform: `translate(${agent.x * TILE_SIZE * scale + offsetX}px, ${agent.y * TILE_SIZE * scale + offsetY}px) scale(${scale})`,
              transformOrigin: 'top left'
            }}
          >
            <div className={`relative p-2 rounded-full shadow-lg ${getStatusColor(agent.status)}`}>
              {getSpeciesEmoji(agent.species)}
              <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black/50 px-2 py-1 rounded">
              {agent.name}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-bold">{agent.name}</div>
            <div>Species: {agent.species}</div>
            <div>Status: {agent.status}</div>
            <div>Traits: {agent.traits.join(', ')}</div>
            {agent.resources.length > 0 && (
              <div>Resources: {agent.resources.join(', ')}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};