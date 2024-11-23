import React, { useEffect, useState } from 'react';
import { Agent } from './Agent';
import { useAgentStore } from '@/stores/agentStore';
import SimplexNoise from 'simplex-noise';

const TILE_SIZE = 32;
const WORLD_WIDTH = 50;
const WORLD_HEIGHT = 30;

type BiomeType = 'forest' | 'plains' | 'desert' | 'mountains' | 'lake';
type ResourceType = 'wood' | 'stone' | 'iron' | 'gold' | 'food' | 'water';

interface Tile {
  type: BiomeType;
  resources: ResourceType[];
  x: number;
  y: number;
}

export const World = () => {
  const { agents } = useAgentStore();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const noise = new SimplexNoise();

  useEffect(() => {
    generateWorld();
  }, []);

  const generateWorld = () => {
    const newTiles: Tile[] = [];
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        const biome = generateBiome(x, y);
        const resources = generateResources(biome);
        newTiles.push({ type: biome, resources, x, y });
      }
    }
    setTiles(newTiles);
  };

  const generateBiome = (x: number, y: number): BiomeType => {
    const elevation = noise.noise2D(x * 0.1, y * 0.1);
    const moisture = noise.noise2D(x * 0.08 + 1000, y * 0.08 + 1000);

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
    <div className="world-container relative overflow-hidden">
      <div className="absolute inset-0 grid"
           style={{
             gridTemplateColumns: `repeat(${WORLD_WIDTH}, ${TILE_SIZE}px)`,
             gridTemplateRows: `repeat(${WORLD_HEIGHT}, ${TILE_SIZE}px)`,
           }}>
        {tiles.map((tile, index) => (
          <div
            key={index}
            className="relative transition-colors duration-200 hover:brightness-110"
            style={{
              backgroundColor: getBiomeColor(tile.type),
              width: TILE_SIZE,
              height: TILE_SIZE,
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
      {agents.map((agent) => (
        <Agent key={agent.id} agent={agent} />
      ))}
    </div>
  );
};