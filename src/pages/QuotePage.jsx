import React from 'react';
import MatchmakingPortal from '../components/MatchmakingPortal';
import { Sparkles, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuotePage({ onOpenQuote }) {
  return (
    <div className="w-full bg-ivory min-h-screen text-charcoal py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Trust Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stroke-subtle">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-deep transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang Chủ</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Cổng Kết Nối Độc Lập — 100% Bảo Mật Thông Tin &amp; Miễn Phí Tư Vấn</span>
          </div>
        </div>

        {/* Embedded Matchmaking Portal */}
        <div className="pt-4">
          <MatchmakingPortal onOpenQuoteModal={onOpenQuote} embeddedInPage={false} />
        </div>

      </div>
    </div>
  );
}
