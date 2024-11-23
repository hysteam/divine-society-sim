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
      const parsedResponse = JSON.parse(response as string);
      
      addEvent({
        message: `God: ${parsedResponse.message}`,
        type: 'info',
      });

      if (parsedResponse.actions) {
        parsedResponse.actions.forEach((action: string) => {
          addEvent({
            message: `Action: ${action}`,
            type: 'info',
          });
        });
      }

      toast({
        title: "God AI Response",
        description: parsedResponse.message,
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