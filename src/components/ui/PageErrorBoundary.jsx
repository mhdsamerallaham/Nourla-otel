import React from 'react';
import { RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';

/**
 * PageErrorBoundary — Sayfa bazlı hata sınırı
 *
 * Mevcut global ErrorBoundary'den farkı:
 * - Tüm ekranı değil, sadece ilgili sayfanın alanını kaplar
 * - Header, Footer ve diğer sayfalar çalışmaya devam eder
 * - "Tekrar Dene" butonu boundary state'ini sıfırlar (sayfa reload değil)
 */
export class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[PageErrorBoundary] Sayfa hatası:', error, errorInfo);
  }

  handleRetry = () => {
    // State sıfırla — component tekrar render dener
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-[#F7F4EE] border border-[#E7E1D3] rounded-2xl p-8 shadow-lg text-center space-y-5">
            {/* İkon */}
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-rose-500" />
            </div>

            {/* Mesaj */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold tracking-widest text-[#6F7255] uppercase">
                NOURLA BOUTIQUE HOTEL
              </p>
              <h2 className="font-serif text-xl text-[#2B2B2B]">
                Sayfa Yüklenemedi
              </h2>
              <p className="text-xs text-[#555555] leading-relaxed font-light">
                Bu bölüm yüklenirken geçici bir sorun oluştu. Lütfen tekrar deneyin.
              </p>
            </div>

            {/* Aksiyonlar */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={this.handleRetry}
                className="w-full px-5 py-2.5 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tekrar Dene
              </button>

              <a
                href="/tr"
                className="w-full px-5 py-2.5 rounded-full bg-white border border-[#E7E1D3] hover:border-[#6F7255] text-[#2B2B2B] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                Ana Sayfaya Dön
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
