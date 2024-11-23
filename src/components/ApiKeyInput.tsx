import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useOpenAIStore } from '@/stores/openAIStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ApiKeyInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApiKeyInput = ({ open, onOpenChange }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = React.useState('');
  const { setApiKey: storeApiKey } = useOpenAIStore();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!apiKey.startsWith('sk-')) {
      toast({
        title: 'Invalid API Key',
        description: 'Please enter a valid OpenAI API key starting with "sk-"',
        variant: 'destructive',
      });
      return;
    }

    storeApiKey(apiKey);
    setApiKey('');
    onOpenChange(false);
    toast({
      title: 'API Key Set',
      description: 'Your OpenAI API key has been successfully set.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter OpenAI API Key</DialogTitle>
          <DialogDescription>
            To use the Divine Society Simulation, you need to provide your OpenAI API key. 
            This key will be stored securely in your browser and used for agent interactions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              placeholder="Enter OpenAI API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Your API key should start with 'sk-'. Get your API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI's platform
              </a>
            </p>
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Set API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
