import React from 'react';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Nourla Boutique Hotel — ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/tr';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#F7F4EE] border border-[#E7E1D3] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto border border-[#6F7255]/20">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block">
                NOURLA BOUTIQUE HOTEL
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#2B2B2B] font-normal">
                Bir Aksaklık Oluştu
              </h1>
              <p className="text-xs sm:text-sm text-[#555555] font-light leading-relaxed">
                Sayfa yüklenirken geçici bir hata meydana geldi. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Yenile
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 rounded-full bg-[#FDFBF7] border border-[#E7E1D3] text-[#2B2B2B] hover:border-[#6F7255] text-xs font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
