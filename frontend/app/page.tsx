import { Suspense } from 'react';
import TicketContent from './TicketContent';

export default function TicketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-14 h-14 border-2 border-blue-600/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <TicketContent />
    </Suspense>
  );
}