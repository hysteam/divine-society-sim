import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { generateGodResponse } from '@/utils/openai';
import { useEventStore } from '@/stores/eventStore';

export const GodPanel = () => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { addEvent } = useEventStore();

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

      // Log each action
      response.actions.forEach((action) => {
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
      toast({
        title: "Error",
        description: "Failed to process God's response",
        variant: "destructive",
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