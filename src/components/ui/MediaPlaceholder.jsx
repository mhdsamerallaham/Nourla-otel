import React from 'react';
import { Play, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

export default function MediaPlaceholder({
  type = 'image', // 'image' | 'video'
  title = '',
  subtitle = '',
  imageUrl = '',
  aspectRatio = 'aspect-video',
  className = '',
  children
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3] group ${aspectRatio} ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title || 'Media Placeholder'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#E7E1D3]/80 via-[#F7F4EE] to-[#D5CEBE]/50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#6F7255]/10 flex items-center justify-center text-[#6F7255] mb-3 border border-[#6F7255]/20">
            {type === 'video' ? <VideoIcon className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#6F7255] bg-white/70 px-3 py-1 rounded-full border border-[#E7E1D3] shadow-xs mb-1">
            {type === 'video' ? 'Video Placeholder' : 'Image Placeholder'}
          </span>
          {title && <h4 className="font-serif text-lg text-[#2B2B2B] mt-1">{title}</h4>}
          {subtitle && <p className="text-xs text-[#555555] max-w-md mt-1">{subtitle}</p>}
        </div>
      )}

      {/* Overlay Badge for Media Type */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2B2B2B]/75 backdrop-blur-md text-[10px] font-medium text-[#E7E1D3] border border-[#E7E1D3]/20 shadow-sm">
          {type === 'video' ? <VideoIcon className="w-3 h-3 text-[#6F7255]" /> : <ImageIcon className="w-3 h-3 text-[#6F7255]" />}
          <span className="uppercase tracking-widest">{type === 'video' ? 'Video Placeholder' : 'Image Placeholder'}</span>
        </span>
      </div>

      {type === 'video' && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#6F7255] shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-[#6F7255] ml-1" />
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
