import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    stopStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Live stream unavailable on this browser. Tap below to use device camera.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setCameraReady(true);
      }
    } catch {
      try {
        // Fallback to any available video device
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play().catch(() => {});
          setCameraReady(true);
        }
      } catch {
        setCameraError('Camera access needed. Tap "Open System Camera" below to snap your meal photo.');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleSnapFrame = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) {
      nativeCameraInputRef.current?.click();
      return;
    }

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 140);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `meal-photo-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            stopStream();
            onCapture(file);
            onClose();
          }
        },
        'image/jpeg',
        0.92
      );
    }
  };

  const handleNativeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopStream();
      onCapture(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col justify-between p-4 select-none animate-in fade-in duration-150">
      {/* Hidden synchronous native camera input fallback */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeInputChange}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between text-white max-w-md mx-auto w-full pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight">Live Food Camera</h3>
            <p className="text-[10px] text-slate-400">Center your plate or packet in frame</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-90 transition-all cursor-pointer"
            title="Flip Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white active:scale-90 transition-all cursor-pointer"
            title="Close Camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Viewfinder */}
      <div className="relative max-w-md mx-auto w-full aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center my-auto">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
        />

        {isFlashing && <div className="absolute inset-0 bg-white/80 pointer-events-none" />}

        {/* Framing Corner Guides */}
        <div className="absolute inset-6 pointer-events-none border border-emerald-400/30 rounded-2xl">
          <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
          <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
        </div>

        {!cameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold text-white max-w-[240px]">
              {cameraError || 'Initializing camera lens...'}
            </p>
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Open System Camera</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="max-w-md mx-auto w-full pb-4 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => nativeCameraInputRef.current?.click()}
          className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>Phone Camera / Files</span>
        </button>

        {/* Shutter Button */}
        <button
          type="button"
          onClick={handleSnapFrame}
          className="w-16 h-16 rounded-full bg-white p-1.5 shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-90 transition-all flex items-center justify-center cursor-pointer"
          title="Snap Photo"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center">
            <Camera className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

