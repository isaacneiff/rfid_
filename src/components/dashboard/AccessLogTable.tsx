'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AccessLogEntry } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

type LogEntry = {
    id: number;
    timestamp: string;
    card_uid: string;
    user_name: string;
    status: string;
    reason: string;
}

export function AccessLogTable({ logEntries }: { logEntries: LogEntry[] }) {
  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
    });
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Log de Acesso em Tempo Real</CardTitle>
        <CardDescription>Feed em tempo real de eventos de entrada e saída do banco de dados.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden sm:table-cell">UID do Cartão</TableHead>
                <TableHead className="hidden md:table-cell">Data e Hora</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logEntries && logEntries.length > 0 ? (
                logEntries.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium">{log.user_name}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-code">{log.card_uid}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={log.status === 'Granted' ? 'default' : 'destructive'} className={log.status === 'Granted' ? 'bg-green-600' : ''}>
                        {log.status === 'Granted' ? 'Concedido' : 'Negado'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum evento de acesso registrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
