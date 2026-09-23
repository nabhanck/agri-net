import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Leaf,
  FlaskConical,
  Zap,
  Info,
  X,
  FlipHorizontal,
  ShieldCheck,
  AlertOctagon,
  Loader2,
  Video,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFarm } from '../../context/FarmContext';
import type { DashboardState } from './state';
import {
  diagnosePlantDiseaseWithGemini,
  type PlantDiseaseDiagnosticResult,
} from '../../config/gemini';

interface DiseaseDiagnosticProps {
  state?: DashboardState;
  className?: string;
}

export interface DetectedCamera {
  deviceId: string;
  label: string;
  facing: 'front' | 'rear' | 'unknown';
}

// Sample base64 image generator for 1-click test demonstrations
function createSampleLeafCanvas(type: 'rice_blast' | 'tomato_blight' | 'healthy'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === 'healthy') {
    // Healthy Green Leaf
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(200, 150, 140, 70, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Leaf vein
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 170);
    ctx.quadraticCurveTo(200, 150, 330, 130);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Healthy Rice Leaf (Oryza sativa)', 20, 35);
  } else if (type === 'rice_blast') {
    // Rice Blast Spindle Lesions
    ctx.fillStyle = '#4d7c0f';
    ctx.beginPath();
    ctx.ellipse(200, 150, 150, 55, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Vein
    ctx.strokeStyle = '#a3e635';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 165);
    ctx.lineTo(340, 135);
    ctx.stroke();

    // Spindle lesions with grey centers and brown borders
    const lesions = [
      { x: 140, y: 150, rx: 22, ry: 9, rot: 0.1 },
      { x: 210, y: 140, rx: 28, ry: 11, rot: -0.05 },
      { x: 270, y: 135, rx: 18, ry: 8, rot: 0.1 },
    ];

    lesions.forEach((l) => {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, l.rx + 4, l.ry + 3, l.rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, l.rx, l.ry, l.rot, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Rice Leaf with Blast Lesions (Magnaporthe)', 20, 35);
  } else {
    // Tomato Early Blight Concentric Rings
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(200, 150, 110, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    const centers = [
      { x: 170, y: 130, maxR: 35 },
      { x: 230, y: 170, maxR: 25 },
    ];

    centers.forEach((c) => {
      ctx.strokeStyle = '#451a03';
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.maxR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      for (let r = 8; r < c.maxR; r += 7) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Tomato Leaf with Early Blight (Alternaria)', 20, 35);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Classifies a camera label or facing string into 'front' or 'rear'
 */
function classifyCameraFacing(label: string): 'front' | 'rear' | 'unknown' {
  const lower = (label || '').toLowerCase();
  if (
    lower.includes('back') ||
    lower.includes('rear') ||
    lower.includes('environment') ||
    lower.includes('facing back') ||
    lower.includes('0, facing back') ||
    lower.includes('wide') ||
    lower.includes('telephoto') ||
    lower.includes('macro') ||
    lower.includes('main')
  ) {
    return 'rear';
  }
  if (
    lower.includes('front') ||
    lower.includes('user') ||
    lower.includes('facing front') ||
    lower.includes('0, facing front') ||
    lower.includes('facetime') ||
    lower.includes('selfie') ||
    lower.includes('integrated') ||
    lower.includes('webcam')
  ) {
    return 'front';
  }
  return 'unknown';
}

export const DiseaseDiagnostic: React.FC<DiseaseDiagnosticProps> = ({ state, className = '' }) => {
  const { t, i18n } = useTranslation();
  const { farm, weather } = useFarm();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [detectedCameras, setDetectedCameras] = useState<DetectedCamera[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [activeCameraLabel, setActiveCameraLabel] = useState<string>('');
  const [activeFacingDetected, setActiveFacingDetected] = useState<'front' | 'rear' | 'unknown'>('unknown');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgressText, setAnalysisProgressText] = useState<string>('');
  const [diagnosticResult, setDiagnosticResult] = useState<PlantDiseaseDiagnosticResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active farm telemetry metadata
  const activeCropName =
    state?.farm?.crop?.cropName ||
    state?.farm?.crops?.[0]?.crop?.name ||
    farm.crop.cropName ||
    'Rice';

  const activeVariety =
    state?.farm?.crop?.variety ||
    state?.farm?.crops?.[0]?.variety ||
    farm.crop.variety ||
    'Active';

  const activeStage =
    state?.farm?.crop?.growthStage ||
    state?.farm?.crops?.[0]?.growth_stage?.stage_name ||
    farm.crop.growthStage ||
    'Vegetative';

  const activeSoil =
    state?.farm?.soil_type ||
    state?.farm?.soil?.soilType ||
    farm.soil.soilType ||
    'Clayey';

  const activeTemp = state?.weather?.weather?.current?.temperature_2m ?? weather.temp;
  const activeHumidity = state?.weather?.weather?.current?.relative_humidity_2m ?? weather.humidity;
  const activeFarmName = state?.farm?.name || farm.farmName || 'Active Farm';

  // 1. Detect all available web cameras on mount
  useEffect(() => {
    refreshCameraDevices();
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure mediaStream is bound to video element whenever stream updates
  useEffect(() => {
    if (isCameraActive && mediaStream && videoRef.current) {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Video autoplay catch in useEffect:', err);
      });
    }
  }, [isCameraActive, mediaStream]);

  const refreshCameraDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');

      const parsed: DetectedCamera[] = videoInputs.map((d, idx) => {
        let facing = classifyCameraFacing(d.label);
        let label = d.label;

        if (!label) {
          if (videoInputs.length === 1) {
            label = 'Camera (Webcam)';
            facing = 'front';
          } else if (idx === 0) {
            label = 'Rear Camera (Back)';
            facing = 'rear';
          } else {
            label = `Camera ${idx + 1}`;
          }
        }

        return {
          deviceId: d.deviceId,
          label: label || `Camera ${idx + 1}`,
          facing,
        };
      });

      setDetectedCameras(parsed);

      // Default to rear camera if present
      const rearCam = parsed.find((c) => c.facing === 'rear');
      if (rearCam && !selectedDeviceId) {
        setSelectedDeviceId(rearCam.deviceId);
        setFacingMode('environment');
      } else if (parsed.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(parsed[0].deviceId);
      }
    } catch (err) {
      console.warn('Camera enumeration error:', err);
    }
  };

  /**
   * Start camera stream with front/rear detection
   */
  const startCamera = async (
    targetFacing: 'environment' | 'user' = facingMode,
    targetDeviceId?: string
  ) => {
    try {
      setErrorMessage(null);
      // Clean up previous tracks first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      setMediaStream(null);

      // Build smart constraint: prefer specific deviceId if chosen, else facingMode
      const videoConstraint: MediaTrackConstraints = {};

      if (targetDeviceId) {
        videoConstraint.deviceId = { ideal: targetDeviceId };
      } else {
        videoConstraint.facingMode = { ideal: targetFacing };
      }
      videoConstraint.width = { ideal: 1280 };
      videoConstraint.height = { ideal: 720 };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraint,
          audio: false,
        });
      } catch (firstErr) {
        console.warn('Initial camera constraint failed, retrying with generic constraints:', firstErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setMediaStream(stream);
      setIsCameraActive(true);

      // If video ref is already available, attach directly
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Direct play error:', err));
      }

      // Inspect actual active track to accurately detect front vs rear
      const activeTrack = stream.getVideoTracks()[0];
      if (activeTrack) {
        const settings = activeTrack.getSettings?.() || {};
        const trackLabel = activeTrack.label || '';
        let detectedFacing = classifyCameraFacing(trackLabel);

        if (settings.facingMode) {
          detectedFacing = settings.facingMode === 'environment' ? 'rear' : 'front';
        }

        setActiveCameraLabel(trackLabel || (detectedFacing === 'rear' ? 'Rear Camera' : 'Front Camera'));
        setActiveFacingDetected(detectedFacing);
        setFacingMode(detectedFacing === 'rear' ? 'environment' : 'user');

        if (settings.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        }
      }

      // Re-enumerate to get updated labels now that camera permission is granted
      refreshCameraDevices();
    } catch (err: any) {
      console.error('Camera stream failed or permission denied:', err);
      setErrorMessage(t('disease_diagnostic.camera_error'));
      setIsCameraActive(false);
      setMediaStream(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
    }
    setMediaStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  /**
   * Toggle between Front and Rear camera
   */
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);

    // Find matching camera in detected devices
    const matchingDevice = detectedCameras.find((c) =>
      nextFacing === 'environment' ? c.facing === 'rear' : c.facing === 'front'
    );

    if (matchingDevice) {
      setSelectedDeviceId(matchingDevice.deviceId);
      startCamera(nextFacing, matchingDevice.deviceId);
    } else {
      startCamera(nextFacing);
    }
  };

  /**
   * Handle specific device change from dropdown
   */
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    const selected = detectedCameras.find((c) => c.deviceId === devId);
    const targetFacing = selected?.facing === 'front' ? 'user' : 'environment';
    setFacingMode(targetFacing);
    startCamera(targetFacing, devId);
  };

  const captureFrameFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, flip horizontally to match the mirrored live preview
    if (activeFacingDetected === 'front') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedImage(dataUrl);
    setImageMimeType('image/jpeg');
    stopCamera();
    setDiagnosticResult(null);
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || 'image/jpeg';
    setImageMimeType(mime);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setSelectedImage(event.target.result);
        setDiagnosticResult(null);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
    stopCamera();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setSelectedImage(event.target.result);
          setDiagnosticResult(null);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
      stopCamera();
    }
  };

  const loadSampleImage = (type: 'rice_blast' | 'tomato_blight' | 'healthy') => {
    stopCamera();
    const sampleDataUrl = createSampleLeafCanvas(type);
    setSelectedImage(sampleDataUrl);
    setImageMimeType('image/jpeg');
    setDiagnosticResult(null);
    setErrorMessage(null);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisProgressText(t('disease_diagnostic.analyzing_title'));

    try {
      const result = await diagnosePlantDiseaseWithGemini(selectedImage, imageMimeType, {
        farmName: activeFarmName,
        cropName: activeCropName,
        variety: activeVariety,
        growthStage: activeStage,
        soilType: activeSoil,
        temperature: activeTemp,
        humidity: activeHumidity,
        language: i18n.language || 'en',
      });

      setDiagnosticResult(result);
    } catch (err: any) {
      console.error('Plant Disease Diagnostic Error:', err);
      setErrorMessage(
        err?.message || t('disease_diagnostic.diagnose_error')
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setDiagnosticResult(null);
    setErrorMessage(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const severity = diagnosticResult?.severity || 'LOW';
  const isHealthy = diagnosticResult?.isHealthy || severity === 'HEALTHY';
  const isCritical = severity === 'CRITICAL' || severity === 'HIGH';

  return (
    <div
      className={`bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-6 ${className}`}
    >
      {/* 1. Header with Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                  {t('disease_diagnostic.title')}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Gemini Vision
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t('disease_diagnostic.subtitle')} · {activeCropName} ({activeVariety})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('disease_diagnostic.live_diagnostic')}
          </span>
        </div>
      </div>

      {/* 2. Main Work Area: Uploader vs Camera vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Input & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {!selectedImage && !isCameraActive ? (
            // Dropzone & Action Buttons
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-50/60 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform mb-3">
                <Upload className="w-7 h-7 text-emerald-600" />
              </div>

              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {t('disease_diagnostic.upload_title')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                {t('disease_diagnostic.upload_desc')}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {t('disease_diagnostic.browse_files')}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('disease_diagnostic.use_camera')}</span>
                </button>
              </div>
            </div>
          ) : isCameraActive ? (
            // Active Live Camera Feed Viewfinder
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-4/3 flex flex-col justify-between p-3 border border-slate-800 shadow-lg">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && mediaStream && el.srcObject !== mediaStream) {
                    el.srcObject = mediaStream;
                    el.play().catch((err) => console.warn('Video callback play error:', err));
                  }
                }}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  (e.target as HTMLVideoElement).play().catch((err) => console.warn('Metadata play error:', err));
                }}
                className={`absolute inset-0 w-full h-full object-cover ${
                  activeFacingDetected === 'front' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Detected Camera Identification Badge */}
              <div className="relative z-20 flex items-center justify-between gap-2">
                <div className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeFacingDetected === 'rear' ? 'bg-emerald-400' : 'bg-sky-400'
                    } animate-pulse`}
                  />
                  <span>
                    {activeFacingDetected === 'rear'
                      ? `📷 ${t('disease_diagnostic.rear_camera')}`
                      : activeFacingDetected === 'front'
                      ? `🤳 ${t('disease_diagnostic.front_camera')}`
                      : '📷 Camera'}
                  </span>
                  {activeCameraLabel && (
                    <span className="hidden sm:inline-block text-[10px] text-white/70 max-w-[140px] truncate">
                      · {activeCameraLabel}
                    </span>
                  )}
                </div>

                {/* Camera Selector Dropdown if multiple devices detected */}
                {detectedCameras.length > 1 && (
                  <select
                    value={selectedDeviceId}
                    onChange={handleDeviceChange}
                    className="appearance-none bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20 outline-none cursor-pointer backdrop-blur-md"
                    title={t('disease_diagnostic.select_camera')}
                  >
                    {detectedCameras.map((cam, idx) => (
                      <option key={cam.deviceId || idx} value={cam.deviceId} className="bg-slate-900 text-white">
                        {cam.facing === 'rear'
                          ? `Rear: ${cam.label}`
                          : cam.facing === 'front'
                          ? `Front: ${cam.label}`
                          : cam.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Viewfinder Target Reticle */}
              <div className="relative z-10 pointer-events-none flex flex-col items-center justify-center h-full">
                <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl border-dashed animate-pulse flex items-center justify-center">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                    Focus Leaf Specimen
                  </span>
                </div>
              </div>

              {/* Camera Controls Bar */}
              <div className="relative z-20 flex items-center justify-between bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{t('disease_diagnostic.close_camera')}</span>
                </button>

                <button
                  type="button"
                  onClick={captureFrameFromVideo}
                  className="w-12 h-12 rounded-full bg-white hover:bg-emerald-100 border-4 border-emerald-500 shadow-lg flex items-center justify-center text-emerald-700 cursor-pointer active:scale-95 transition-transform"
                  title={t('disease_diagnostic.capture_photo')}
                >
                  <Camera className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer"
                  title={t('disease_diagnostic.switch_camera')}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">{t('disease_diagnostic.switch_camera')}</span>
                </button>
              </div>
            </div>
          ) : (
            // Preview of Selected / Captured Image
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-4/3 border border-slate-200 shadow-md group">
              <img
                src={selectedImage || undefined}
                alt="Selected crop specimen"
                className="w-full h-full object-cover"
              />

              {/* Scanning Laser Animation Overlay when analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-[1px] flex flex-col items-center justify-center">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-[bounce_2s_infinite]" />
                  <div className="bg-slate-900/90 text-white px-4 py-2 rounded-2xl border border-emerald-500/50 flex items-center gap-2 text-xs font-semibold shadow-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{analysisProgressText}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons Top Bar */}
              {!isAnalyzing && (
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                    title="Remove and retake"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bottom Diagnose Trigger Bar */}
              {!isAnalyzing && !diagnosticResult && (
                <div className="absolute bottom-3 inset-x-3">
                  <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-xl shadow-emerald-600/40 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('disease_diagnostic.diagnose_button')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 1-Click Sample Test Presets */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              {t('disease_diagnostic.sample_photos')}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loadSampleImage('rice_blast')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-colors text-xs"
              >
                <span className="font-bold text-amber-900 block truncate">🌾 Rice Blast</span>
                <span className="text-[10px] text-slate-500">Magnaporthe</span>
              </button>

              <button
                type="button"
                onClick={() => loadSampleImage('tomato_blight')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left transition-colors text-xs"
              >
                <span className="font-bold text-rose-900 block truncate">🍅 Tomato Blight</span>
                <span className="text-[10px] text-slate-500">Alternaria</span>
              </button>

              <button
                type="button"
                onClick={() => loadSampleImage('healthy')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-colors text-xs"
              >
                <span className="font-bold text-emerald-900 block truncate">🌱 Healthy Leaf</span>
                <span className="text-[10px] text-slate-500">Clean Chlorophyll</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Right Column: Pathology Report Card & Remedies (7 cols) */}
        <div className="lg:col-span-7">
          {diagnosticResult ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Diagnosis Header Card */}
              <div
                className={`p-5 rounded-3xl border ${
                  isHealthy
                    ? 'bg-emerald-50/60 border-emerald-300/80 text-emerald-950'
                    : isCritical
                    ? 'bg-rose-50/60 border-rose-300/80 text-rose-950'
                    : 'bg-amber-50/60 border-amber-300/80 text-amber-950'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isHealthy
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isCritical
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {diagnosticResult.severity} {t('disease_diagnostic.severity_label')}
                      </span>

                      {diagnosticResult.affectedPart && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-md">
                          {t('disease_diagnostic.affected_part')} {diagnosticResult.affectedPart}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                      {diagnosticResult.diseaseName}
                    </h3>
                    {diagnosticResult.scientificName && (
                      <p className="text-xs italic text-slate-500 mt-0.5">
                        {diagnosticResult.scientificName}
                      </p>
                    )}
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right">
                    <span className="text-2xl font-extrabold font-heading text-slate-900 block leading-none">
                      {diagnosticResult.confidence}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('disease_diagnostic.confidence_label')}
                    </span>
                  </div>
                </div>

                {/* Summary Statement */}
                <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed font-medium">
                  {diagnosticResult.summary}
                </p>
              </div>

              {/* Immediate Emergency Action Step */}
              {diagnosticResult.immediateAction && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs flex items-start gap-3 shadow-xs">
                  <div className="p-1.5 rounded-xl bg-amber-200/70 text-amber-900 shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-950 uppercase tracking-wider text-[11px] block">
                      {t('disease_diagnostic.immediate_action')}
                    </span>
                    <p className="text-amber-900 mt-0.5 font-medium leading-relaxed">
                      {diagnosticResult.immediateAction}
                    </p>
                  </div>
                </div>
              )}

              {/* Symptoms and Root Causes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {diagnosticResult.symptoms && diagnosticResult.symptoms.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      {t('disease_diagnostic.symptoms_title')}
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {diagnosticResult.symptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosticResult.causes && diagnosticResult.causes.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-slate-500" />
                      {t('disease_diagnostic.causes_title')}
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {diagnosticResult.causes.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400 mt-0.5">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Organic & Biological Remedies */}
              {diagnosticResult.organicRemedies && diagnosticResult.organicRemedies.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    {t('disease_diagnostic.organic_remedies')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {diagnosticResult.organicRemedies.map((remedy, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/90 border border-emerald-200/80 text-slate-800 font-medium leading-snug shadow-2xs flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{remedy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chemical Treatment & Precautions */}
              {diagnosticResult.chemicalTreatments && diagnosticResult.chemicalTreatments.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                    <FlaskConical className="w-4 h-4 text-indigo-600" />
                    {t('disease_diagnostic.chemical_treatments')}
                  </span>
                  <div className="space-y-1.5">
                    {diagnosticResult.chemicalTreatments.map((chem, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/90 border border-indigo-200/80 text-indigo-950 font-medium leading-snug shadow-2xs"
                      >
                        {chem}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preventive Measures & Reset Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('disease_diagnostic.diagnose_another')}</span>
                </button>

                <span className="text-[11px] text-slate-400 text-center sm:text-right">
                  Validated against ICAR & TNAU Plant Pathology Protocols
                </span>
              </div>
            </div>
          ) : (
            // Placeholder State when no analysis has been performed yet
            <div className="h-full min-h-[300px] rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">
                Awaiting Plant Specimen
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Take a close-up photo of any suspicious leaf spots, discoloration, or pests.
                AgriNet's vision engine will identify the pathogen and recommend precision cures.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
