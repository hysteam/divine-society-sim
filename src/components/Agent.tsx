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
      className="absolute w-8 h-8 rounded-sm shadow-lg cursor-pointer"
      style={{
        backgroundColor: agent.color,
        left: `${agent.x * 32}px`,
        top: `${agent.y * 32}px`,
      }}
      whileHover={{
        scale: 1.2,
        boxShadow: '0 0 8px rgba(255,255,255,0.5)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
        {agent.name}
      </div>
    </motion.div>
  );
};