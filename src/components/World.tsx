import React, { useEffect, useState } from 'react';
import { Agent } from './Agent';
import { useAgentStore } from '@/stores/agentStore';

const TILE_SIZE = 32;
const WORLD_WIDTH = 50;
const WORLD_HEIGHT = 30;

type TileType = 'grass' | 'dirt' | 'stone' | 'water' | 'tree';

interface Tile {
  type: TileType;
  x: number;
  y: number;
}

export const World = () => {
  const { agents } = useAgentStore();
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    generateWorld();
  }, []);

  const generateWorld = () => {
    const newTiles: Tile[] = [];
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        const tileType = generateTileType(x, y);
        newTiles.push({ type: tileType, x, y });
      }
    }
    setTiles(newTiles);
  };

  const generateTileType = (x: number, y: number): TileType => {
    const noise = Math.sin(x * 0.1) + Math.cos(y * 0.1);
    if (y < WORLD_HEIGHT * 0.3) return 'tree';
    if (y < WORLD_HEIGHT * 0.5) return 'grass';
    if (y < WORLD_HEIGHT * 0.7) return 'dirt';
    return 'stone';
  };

  const getTileColor = (type: TileType): string => {
    switch (type) {
      case 'grass': return '#4CAF50';
      case 'dirt': return '#795548';
      case 'stone': return '#9E9E9E';
      case 'water': return '#2196F3';
      case 'tree': return '#2E7D32';
      default: return '#000000';
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
            className="transition-colors duration-200 hover:brightness-110"
            style={{
              backgroundColor: getTileColor(tile.type),
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        ))}
      </div>
      {agents.map((agent) => (
        <Agent key={agent.id} agent={agent} />
      ))}
    </div>
  );
};