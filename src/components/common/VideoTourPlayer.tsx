import React, { useState } from 'react';
import { Play, Video, ExternalLink, Maximize2 } from 'lucide-react';

interface VideoTourPlayerProps {
  url: string;
  title?: string;
  poster?: string;
}

export const VideoTourPlayer: React.FC<VideoTourPlayerProps> = ({ url, title, poster }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!url || !url.trim()) return null;

  const cleanUrl = url.trim();

  // Helper to extract embed url
  const getEmbedUrl = (rawUrl: string): { type: 'youtube' | 'vimeo' | 'mp4' | 'iframe'; embedUrl: string } => {
    // YouTube formats
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      };
    }

    // Vimeo formats
    const vimeoMatch = rawUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+))/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      };
    }

    // Direct MP4 / WEBM video
    if (rawUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return {
        type: 'mp4',
        embedUrl: rawUrl,
      };
    }

    // Matterport 3D Tour or Generic Embed URL
    return {
      type: 'iframe',
      embedUrl: rawUrl,
    };
  };

  const { type, embedUrl } = getEmbedUrl(cleanUrl);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg">
        {/* Cover state before user clicks play (if poster available and not playing yet) */}
        {poster && !isPlaying && type !== 'mp4' ? (
          <div className="relative w-full h-full cursor-pointer group" onClick={() => setIsPlaying(true)}>
            <img
              src={poster}
              alt={title || 'Video Tour'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold tracking-wide uppercase shadow-md">
                Click to Play 4K Video Tour
              </span>
            </div>
          </div>
        ) : type === 'mp4' ? (
          <video
            src={embedUrl}
            controls
            poster={poster}
            className="w-full h-full object-contain"
            playsInline
          />
        ) : (
          <iframe
            src={isPlaying || !poster ? embedUrl : embedUrl.replace('autoplay=1', 'autoplay=0')}
            title={title || 'Property Video Tour'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
      </div>

      {/* External Direct Link Option */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <Video className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified High-Definition Walkthrough</span>
        </span>

        <a
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
        >
          <span>Open Video in New Tab</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
