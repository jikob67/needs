
import React, { useEffect, useRef, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface QRScannerProps {
    onClose: () => void;
    onScan?: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, onScan }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number>();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for video to be ready before starting scan loop
                    videoRef.current.onloadedmetadata = () => {
                        setHasPermission(true);
                        videoRef.current?.play();
                        requestRef.current = requestAnimationFrame(scan);
                    };
                }
            } catch (err: any) {
                console.error("Camera Error:", err);
                setHasPermission(false);
                if (err.name === 'NotAllowedError') {
                    setError('يرجى السماح بالوصول للكاميرا لاستخدام الماسح الضوئي.');
                } else if (err.name === 'NotFoundError') {
                    setError('لم يتم العثور على كاميرا في هذا الجهاز.');
                } else {
                    setError('حدث خطأ أثناء تشغيل الكاميرا.');
                }
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    const scan = () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Use global jsQR loaded from index.html
                const jsQR = (window as any).jsQR;
                
                if (jsQR) {
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code && code.data) {
                        if (onScan) {
                            onScan(code.data);
                        } else {
                            alert(`تم قراءة الرمز: ${code.data}`);
                            onClose();
                        }
                        return; // Stop scanning loop on success
                    }
                }
            }
        }
        requestRef.current = requestAnimationFrame(scan);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-fade-in">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
                <h3 className="text-white font-bold text-lg">مسح رمز QR</h3>
                <button 
                    onClick={onClose}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Camera View */}
            <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
                {hasPermission === null && (
                    <div className="text-white flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                        <p>جاري تشغيل الكاميرا...</p>
                    </div>
                )}

                {hasPermission === false && (
                    <div className="text-white text-center p-6 max-w-sm">
                        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">تعذر الوصول للكاميرا</h3>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button 
                            onClick={onClose}
                            className="bg-white text-black px-6 py-2 rounded-full font-bold"
                        >
                            إغلاق
                        </button>
                    </div>
                )}

                <video 
                    ref={videoRef}
                    playsInline 
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hasPermission ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Scanning Overlay */}
                {hasPermission && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div className="relative w-64 h-64 border-2 border-primary-500 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl -mt-1 -ml-1"></div>
                             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl -mt-1 -mr-1"></div>
                             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl -mb-1 -ml-1"></div>
                             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl -mb-1 -mr-1"></div>
                             
                             {/* Scanning Laser Effect */}
                             <div className="absolute left-0 right-0 h-0.5 bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-scan"></div>
                        </div>
                        <p className="mt-8 text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                            وجه الكاميرا نحو رمز المنتج
                        </p>
                    </div>
                )}
            </div>

             <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default QRScanner;
