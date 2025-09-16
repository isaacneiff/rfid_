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

export function AccessLogTable({ logEntries }: { logEntries: AccessLogEntry[] }) {
  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Live Access Log</CardTitle>
        <CardDescription>Real-time feed of entry and exit events.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[380px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Card UID</TableHead>
                <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logEntries.length > 0 ? (
                logEntries.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-code">{log.cardUID}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={log.status === 'Granted' ? 'default' : 'destructive'} className={log.status === 'Granted' ? 'bg-green-600' : ''}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No access events recorded yet.
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
