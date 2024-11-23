import React from 'react';
import { motion } from 'framer-motion';

interface AgentProps {
  agent: {
    id: string;
    x: number;
    y: number;
    color: string;
    name: string;
  };
}

export const Agent = ({ agent }: AgentProps) => {
  return (
    <motion.div
      className="agent"
      style={{
        backgroundColor: agent.color,
        left: `${agent.x}%`,
        top: `${agent.y}%`,
      }}
      whileHover={{
        scale: 1.2,
        boxShadow: '0 0 8px rgba(255,255,255,0.5)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};