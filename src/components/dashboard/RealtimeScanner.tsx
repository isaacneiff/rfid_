'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Card } from '../ui/card';

const RealtimeScannerClient = dynamic(() => import('./RealtimeScannerClient'), {
  ssr: false,
  loading: () => (
    <Card className="shadow-lg flex flex-col items-center justify-center p-10 min-h-[440px]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <span className="mt-4 text-muted-foreground">Carregando Scanner...</span>
    </Card>
  ),
});

export default function RealtimeScanner() {
  return <RealtimeScannerClient />;
}
