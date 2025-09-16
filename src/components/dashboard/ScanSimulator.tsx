'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanLine, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { checkAccess } from '@/lib/actions';
import type { AccessLogEntry, CardData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ScanResult = {
  isAuthorized: boolean;
  reason: string;
};

const mockCards: CardData[] = [
  {
    cardUID: '39C3BB99',
    block1Data: 'Circuit-Digest',
    block2Data: 'Jobit-Joseph',
    userName: 'Jobit Joseph',
  },
  {
    cardUID: 'A1B2C3D4',
    block1Data: 'User-Data-1',
    block2Data: 'User-Data-2',
    userName: 'Alice',
  },
  {
    cardUID: 'BADC0FFEE',
    block1Data: 'Invalid-Data',
    block2Data: 'Unauthorized',
    userName: 'Unknown',
  },
];

export function ScanSimulator({ onScanResult }: { onScanResult: (entry: Omit<AccessLogEntry, 'id' | 'timestamp'>) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    setIsLoading(true);
    setResult(null);

    // Pick a random mock card to simulate a scan
    const cardToScan = mockCards[Math.floor(Math.random() * mockCards.length)];

    try {
      const authResult = await checkAccess(cardToScan);
      setResult(authResult);
      onScanResult({
        userName: cardToScan.userName,
        cardUID: cardToScan.cardUID,
        status: authResult.isAuthorized ? 'Granted' : 'Denied',
        reason: authResult.reason,
      });
    } catch (error) {
      console.error('Scan simulation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process scan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>RFID Scanner</CardTitle>
        <CardDescription>Simulate a card scan to test access control.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6 p-10">
        {result === null && !isLoading && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
            <ScanLine className="h-16 w-16" />
            <span>Awaiting scan...</span>
          </div>
        )}
        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-primary">
            <Loader2 className="h-16 w-16 animate-spin" />
            <span>Scanning...</span>
          </div>
        )}
        {result !== null && (
          <div
            className={cn(
              'flex flex-col items-center gap-3 text-center transition-all animate-in fade-in zoom-in-95',
              result.isAuthorized ? 'text-green-600' : 'text-destructive'
            )}
          >
            {result.isAuthorized ? (
              <CheckCircle2 className="h-16 w-16" />
            ) : (
              <XCircle className="h-16 w-16" />
            )}
            <p className="text-xl font-bold">{result.isAuthorized ? 'Access Granted' : 'Access Denied'}</p>
            <p className="text-sm text-muted-foreground">{result.reason}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleScan} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
          <ScanLine className="mr-2 h-4 w-4" />
          {isLoading ? 'Scanning...' : 'Simulate Card Scan'}
        </Button>
      </CardFooter>
    </Card>
  );
}
