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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanLine, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { checkAccess } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ScanResult = {
  isAuthorized: boolean;
  reason: string;
};

export function RealtimeScanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cardUID, setCardUID] = useState('');
  const { toast } = useToast();

  const handleScan = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!cardUID) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Por favor, insira o UID do cartão.',
        });
        return;
    }
    setIsLoading(true);
    setResult(null);

    const cardToScan = {
        cardUID,
    };

    try {
      const authResult = await checkAccess(cardToScan);
      setResult(authResult);
    } catch (error) {
      console.error('Scan failed:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao processar o escaneamento. Tente novamente.',
      });
      setResult({ isAuthorized: false, reason: 'Falha ao processar o escaneamento.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Scanner RFID em Tempo Real</CardTitle>
        <CardDescription>Insira um UID de cartão para simular uma leitura de hardware.</CardDescription>
      </CardHeader>
      <form onSubmit={handleScan}>
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-10">
          {result === null && !isLoading && (
            <div className="w-full space-y-2">
                <Label htmlFor='card-uid-input'>UID do Cartão</Label>
                <Input 
                    id="card-uid-input"
                    value={cardUID}
                    onChange={e => setCardUID(e.target.value.toUpperCase())}
                    placeholder="ex: 39C3BB99"
                    className="font-code text-center"
                    disabled={isLoading}
                />
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 className="h-16 w-16 animate-spin" />
              <span>Verificando acesso...</span>
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
              <p className="text-xl font-bold">{result.isAuthorized ? 'Acesso Concedido' : 'Acesso Negado'}</p>
              <p className="text-sm text-muted-foreground">{result.reason}</p>
              <Button variant="outline" onClick={() => { setResult(null); setCardUID(''); }} className="mt-4">
                Escanear outro cartão
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || result !== null} className="w-full bg-primary hover:bg-primary/90">
            <ScanLine className="mr-2 h-4 w-4" />
            {isLoading ? 'Verificando...' : 'Verificar Acesso do Cartão'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
