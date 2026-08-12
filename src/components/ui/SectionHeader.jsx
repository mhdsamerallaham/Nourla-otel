import React from 'react';

export default function SectionHeader({ tag, title, subtitle, align = 'center', className = '' }) {
  const alignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  
  return (
    <div className={`mb-12 md:mb-16 ${alignClass} ${className}`}>
      {tag && (
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-[1px] w-6 bg-[#6F7255]"></span>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase">
            {tag}
          </span>
          <span className="h-[1px] w-6 bg-[#6F7255]"></span>
        </div>
      )}
      {title && (
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B2B2B] leading-tight tracking-tight font-normal">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-4 text-sm sm:text-base text-[#555555] max-w-2xl mx-auto font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
