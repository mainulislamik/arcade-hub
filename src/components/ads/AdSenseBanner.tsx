import React, { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  slotId?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  responsive?: boolean;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotId = '1234567890',
  format = 'auto',
  className = '',
  responsive = true
}) => {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        ((window.adsbygoogle = window.adsbygoogle || []).push({}));
      }
    } catch (e) {
      console.warn('AdSense push error (normal before approval)', e);
    }
  }, []);

  return (
    <div className={`arcadex-ad-container relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40 p-2 text-center backdrop-blur-md ${className}`}>
      <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        SPONSORED ADVERTISEMENT
      </span>
      <div className="w-full flex items-center justify-center min-h-[90px]">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minWidth: '250px', width: '100%' }}
          data-ad-client="ca-pub-2861472312283458"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
};
