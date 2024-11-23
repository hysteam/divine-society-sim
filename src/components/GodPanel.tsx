import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { generateGodResponse } from '@/utils/openai';
import { useEventStore } from '@/stores/eventStore';
import { useAgentStore } from '@/stores/agentStore';

export const GodPanel = () => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { addEvent } = useEventStore();
  const { addAgent } = useAgentStore();

  const processAction = (action: string) => {
    // Extract agent name if action contains "create" or "introduce"
    const createMatch = action.match(/create[d]?\s+(?:an?\s+)?agent\s+named\s+(\w+)/i) ||
                       action.match(/introduce\s+(\w+)/i);
    
    if (createMatch) {
      const agentName = createMatch[1];
      addAgent({
        id: Date.now().toString(),
        name: agentName,
        x: Math.floor(Math.random() * 50), // Random position
        y: Math.floor(Math.random() * 30),
        status: 'idle',
        resources: []
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await generateGodResponse(message);
      
      // Log the main message
      addEvent({
        message: `God: ${response.message}`,
        type: 'info',
      });

      // Process and log each action
      response.actions.forEach((action) => {
        processAction(action);
        addEvent({
          message: `Action: ${action}`,
          type: 'info',
        });
      });

      // If there are affected entities, log them
      if (response.affectedEntities?.length) {
        addEvent({
          message: `Affected: ${response.affectedEntities.join(', ')}`,
          type: 'info',
        });
      }

      toast({
        title: `Divine Response (Priority: ${response.priority})`,
        description: response.message,
      });
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
      let errorMessage = "Failed to process God's response";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      addEvent({
        message: `Error: ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-lg font-semibold">God AI Interface</div>
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your command..."
          className="flex-1"
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Send"}
        </Button>
      </div>
    </div>
  );
};