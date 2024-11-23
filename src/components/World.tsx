import React, { useEffect, useState } from 'react';
import { Agent } from './Agent';
import { useAgentStore } from '@/stores/agentStore';

export const World = () => {
  const { agents } = useAgentStore();

  return (
    <div className="world-container">
      {agents.map((agent) => (
        <Agent key={agent.id} agent={agent} />
      ))}
    </div>
  );
};