import { AccessLogTable } from '@/components/dashboard/AccessLogTable';
import RealtimeScanner from '@/components/dashboard/RealtimeScanner';
import { getAccessLog } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const accessLog = await getAccessLog();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Painel de Controle de Acesso</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RealtimeScanner />
        </div>
        <div className="lg:col-span-2">
          <AccessLogTable logEntries={accessLog} />
        </div>
      </div>
    </div>
  );
}
