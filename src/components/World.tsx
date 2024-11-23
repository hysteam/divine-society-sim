import React, { useEffect, useState, useRef } from 'react';
import { Agent } from './Agent';
import { useAgentStore } from '@/stores/agentStore';
import { createNoise2D } from 'simplex-noise';
import { generateAgentDecision } from '@/utils/openai';
import { useEventStore } from '@/stores/eventStore';

const TILE_SIZE = 32;
const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 2;

interface Chunk {
  x: number;
  y: number;
  tiles: Tile[];
}

interface WorldState {
  chunks: Map<string, Chunk>;
  centerChunk: { x: number, y: number };
}

interface Tile {
  type: BiomeType;
  resources: ResourceType[];
  x: number;
  y: number;
}

type BiomeType = 'forest' | 'plains' | 'desert' | 'mountains' | 'lake';
type ResourceType = 'wood' | 'stone' | 'iron' | 'gold' | 'food' | 'water';

export const World = () => {
  const { agents, updateAgent } = useAgentStore();
  const { addEvent } = useEventStore();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [worldState, setWorldState] = useState<WorldState>({
    chunks: new Map(),
    centerChunk: { x: 0, y: 0 }
  });
  
  const noise2D = useRef(createNoise2D());

  const getChunkKey = (x: number, y: number) => `${x},${y}`;

  const generateChunk = (chunkX: number, chunkY: number): Chunk => {
    const tiles: Tile[] = [];
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const worldX = chunkX * CHUNK_SIZE + x;
        const worldY = chunkY * CHUNK_SIZE + y;
        const biome = generateBiome(worldX, worldY);
        const resources = generateResources(biome);
        tiles.push({ type: biome, resources, x: worldX, y: worldY });
      }
    }
    return { x: chunkX, y: chunkY, tiles };
  };

  const updateVisibleChunks = () => {
    const centerChunkX = Math.floor(-position.x / (TILE_SIZE * CHUNK_SIZE * scale));
    const centerChunkY = Math.floor(-position.y / (TILE_SIZE * CHUNK_SIZE * scale));

    const newChunks = new Map(worldState.chunks);
    
    for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
      for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
        const chunkX = centerChunkX + dx;
        const chunkY = centerChunkY + dy;
        const key = getChunkKey(chunkX, chunkY);
        
        if (!newChunks.has(key)) {
          newChunks.set(key, generateChunk(chunkX, chunkY));
        }
      }
    }

    setWorldState({
      chunks: newChunks,
      centerChunk: { x: centerChunkX, y: centerChunkY }
    });
  };

  useEffect(() => {
    updateVisibleChunks();
  }, [position, scale]);

  // Agent AI update loop
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const agent of agents) {
        if (Date.now() - agent.lastAction < 3000) continue;

        // Get nearby agents
        const nearbyAgents = agents
          .filter(other => other.id !== agent.id)
          .map(other => ({
            name: other.name,
            species: other.species,
            resources: other.resources,
            distance: Math.sqrt(
              Math.pow(other.x - agent.x, 2) + 
              Math.pow(other.y - agent.y, 2)
            )
          }))
          .filter(other => other.distance < 10);

        // Get surroundings
        const chunkX = Math.floor(agent.x / CHUNK_SIZE);
        const chunkY = Math.floor(agent.y / CHUNK_SIZE);
        const chunk = worldState.chunks.get(getChunkKey(chunkX, chunkY));
        const surroundings = {
          biome: chunk?.tiles[0]?.type || 'unknown',
          resources: chunk?.tiles.flatMap(t => t.resources) || [],
          structures: [] // Add structure tracking if needed
        };

        // Get AI decision
        const decision = await generateAgentDecision(
          agent,
          nearbyAgents,
          surroundings
        );

        // Process decision
        let newX = agent.x;
        let newY = agent.y;
        let newResources = [...agent.resources];

        switch (decision.action) {
          case 'move':
            if (decision.target.x !== undefined && decision.target.y !== undefined) {
              const dx = Math.sign(decision.target.x - agent.x);
              const dy = Math.sign(decision.target.y - agent.y);
              newX += dx;
              newY += dy;
            }
            break;
          case 'gather':
            if (decision.target.resource) {
              newResources.push(decision.target.resource);
            }
            break;
          // Add other action handling
        }

        // Update agent
        updateAgent(agent.id, {
          ...agent,
          x: newX,
          y: newY,
          resources: newResources,
          status: decision.action,
          lastAction: Date.now()
        });

        // Log event
        if (decision.speech) {
          addEvent({
            message: `${agent.name}: "${decision.speech}"`,
            type: 'speech'
          });
        }
        addEvent({
          message: `${agent.name} ${decision.message}`,
          type: 'action'
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [agents, worldState]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    setScale(prevScale => {
      const newScale = delta > 0 ? prevScale * 0.9 : prevScale * 1.1;
      return Math.min(Math.max(newScale, 0.5), 3);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generateBiome = (x: number, y: number): BiomeType => {
    const elevation = noise2D.current(x * 0.1, y * 0.1);
    const moisture = noise2D.current(x * 0.08 + 1000, y * 0.08 + 1000);

    if (elevation > 0.6) return 'mountains';
    if (elevation < -0.3) return 'lake';
    if (moisture > 0.3) return 'forest';
    if (moisture < -0.3) return 'desert';
    return 'plains';
  };

  const generateResources = (biome: BiomeType): ResourceType[] => {
    const resources: ResourceType[] = [];
    const chance = Math.random();

    switch (biome) {
      case 'forest':
        if (chance > 0.7) resources.push('wood');
        if (chance > 0.9) resources.push('food');
        break;
      case 'mountains':
        if (chance > 0.6) resources.push('stone');
        if (chance > 0.8) resources.push('iron');
        if (chance > 0.95) resources.push('gold');
        break;
      case 'plains':
        if (chance > 0.7) resources.push('food');
        break;
      case 'lake':
        resources.push('water');
        break;
      default:
        break;
    }

    return resources;
  };

  const getBiomeColor = (type: BiomeType): string => {
    switch (type) {
      case 'forest': return '#2E7D32';
      case 'plains': return '#8BC34A';
      case 'desert': return '#FDD835';
      case 'mountains': return '#757575';
      case 'lake': return '#1976D2';
      default: return '#000000';
    }
  };

  const getResourceIcon = (resource: ResourceType): string => {
    switch (resource) {
      case 'wood': return '🌲';
      case 'stone': return '🪨';
      case 'iron': return '⛏️';
      case 'gold': return '💰';
      case 'food': return '🌾';
      case 'water': return '💧';
      default: return '';
    }
  };

  return (
    <div 
      className="world-container relative overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="absolute inset-0"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {Array.from(worldState.chunks.values()).map(chunk => (
          <div
            key={`${chunk.x},${chunk.y}`}
            className="absolute"
            style={{
              left: chunk.x * CHUNK_SIZE * TILE_SIZE,
              top: chunk.y * CHUNK_SIZE * TILE_SIZE,
              width: CHUNK_SIZE * TILE_SIZE,
              height: CHUNK_SIZE * TILE_SIZE,
              display: 'grid',
              gridTemplateColumns: `repeat(${CHUNK_SIZE}, ${TILE_SIZE}px)`,
              gridTemplateRows: `repeat(${CHUNK_SIZE}, ${TILE_SIZE}px)`,
            }}
          >
            {chunk.tiles.map((tile, index) => (
              <div
                key={index}
                className="relative transition-colors duration-200 hover:brightness-110"
                style={{
                  backgroundColor: getBiomeColor(tile.type),
                }}
              >
                {tile.resources.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs">
                    {getResourceIcon(tile.resources[0])}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        {agents.map((agent) => (
          <Agent 
            key={agent.id} 
            agent={agent} 
            scale={scale}
            offsetX={0}
            offsetY={0}
          />
        ))}
      </div>
    </div>
  );
};