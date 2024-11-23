import { create } from 'zustand';

interface Agent {
  id: string;
  name: string;
  x: number;
  y: number;
  status: string;
  resources: string[];
  species: string;
  traits: string[];
  behavior: string;
  lastAction: number;
}

interface AgentStore {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),
  removeAgent: (id) =>
    set((state) => ({ agents: state.agents.filter((a) => a.id !== id) })),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates } : agent
      ),
    })),
}));