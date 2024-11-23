import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAgentStore } from '@/stores/agentStore';

interface Species {
  name: string;
  count: number;
  traits: string[];
  behavior: string;
}

const PRESET_SPECIES = [
  {
    name: 'Gatherers',
    traits: ['resourceful', 'cooperative', 'peaceful'],
    behavior: 'Collect resources and share with community'
  },
  {
    name: 'Builders',
    traits: ['creative', 'industrious', 'organized'],
    behavior: 'Construct shelters and infrastructure'
  },
  {
    name: 'Explorers',
    traits: ['curious', 'adventurous', 'adaptable'],
    behavior: 'Discover new areas and resources'
  },
  {
    name: 'Traders',
    traits: ['social', 'diplomatic', 'strategic'],
    behavior: 'Exchange resources and form alliances'
  }
];

interface SpeciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpeciesDialog = ({ open, onOpenChange }: SpeciesDialogProps) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([]);
  const { addAgent } = useAgentStore();

  const handleSpeciesCountChange = (speciesName: string, count: number) => {
    setSelectedSpecies(prev => {
      const existing = prev.find(s => s.name === speciesName);
      if (existing) {
        return prev.map(s => s.name === speciesName ? { ...s, count } : s);
      }
      const preset = PRESET_SPECIES.find(s => s.name === speciesName);
      if (preset) {
        return [...prev, { ...preset, count }];
      }
      return prev;
    });
  };

  const handleCreateAgents = () => {
    selectedSpecies.forEach(species => {
      for (let i = 0; i < species.count; i++) {
        addAgent({
          id: `${species.name}-${Date.now()}-${i}`,
          name: `${species.name}-${i + 1}`,
          x: Math.floor(Math.random() * 50),
          y: Math.floor(Math.random() * 30),
          status: 'idle',
          resources: [],
          species: species.name,
          traits: species.traits,
          behavior: species.behavior,
          lastAction: Date.now()
        });
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Your Species</DialogTitle>
          <DialogDescription>
            Select the species and number of agents to populate your world.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {PRESET_SPECIES.map((species) => (
            <div key={species.name} className="grid gap-2">
              <Label htmlFor={species.name} className="font-medium">
                {species.name}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({species.traits.join(', ')})
                </span>
              </Label>
              <Input
                id={species.name}
                type="number"
                min="0"
                max="20"
                placeholder="Number of agents"
                onChange={(e) => handleSpeciesCountChange(species.name, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreateAgents}>
            Create Society
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
