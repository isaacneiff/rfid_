'use client';

import { AccessLogTable } from '@/components/dashboard/AccessLogTable';
import { ScanSimulator } from '@/components/dashboard/ScanSimulator';
import { useAccessLog } from '@/hooks/use-access-log';

export default function DashboardPage() {
  const { accessLog, addLogEntry } = useAccessLog();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Access Control Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ScanSimulator onScanResult={addLogEntry} />
        </div>
        <div className="lg:col-span-2">
          <AccessLogTable logEntries={accessLog} />
        </div>
      </div>
    </div>
  );
}
