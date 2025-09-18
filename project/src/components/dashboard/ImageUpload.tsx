import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, MapPin, Save, X, Clock, CheckCircle, XCircle, AlertCircle, Video, Square, Play, Pause, FileVideo, UploadCloud, Monitor, Shield, Eye, Zap, AlertTriangle, Phone, Mail } from 'lucide-react';

interface CapturedData {
  image: string;
  distance: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null;
  filename: string;
  captureMethod: 'camera' | 'upload';
}

interface CapturedVideoData {
  video: string;
  distance: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null;
  filename: string;
  captureMethod: 'video' | 'video-upload';
  duration?: number;
}

interface AuthorityAlertProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'billboard' | 'hoarding';
  details: any;
}

const AuthorityAlert: React.FC<AuthorityAlertProps> = ({ isVisible, onClose, type, details }) => {
  const [reportSent, setReportSent] = useState(false);

  const handleSendReport = () => {
    setReportSent(true);
    // Simulate API call to send report
    setTimeout(() => {
      onClose();
      setReportSent(false);
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-red-500 bg-opacity-30 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Authority Alert</h2>
              <p className="text-red-100">
                {type === 'billboard' ? 'Unauthorized Billboard Detected' : 'High Hoarding Risk Detected'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {type === 'billboard' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Billboard Status: UNAUTHORIZED</h3>
              <div className="text-sm text-red-700 space-y-1">
                <p><strong>Board ID:</strong> {details?.board_id || 'Unknown'}</p>
                <p><strong>Reason:</strong> {details?.gemini_check?.reason || 'Content violates advertising guidelines'}</p>
                <p><strong>Location:</strong> GPS coordinates recorded</p>
              </div>
            </div>
          )}

          {type === 'hoarding' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Hoarding Risk: {details?.report?.risk_percent}%</h3>
              <div className="text-sm text-red-700 space-y-1">
                <p><strong>Risk Level:</strong> HIGH (Above 80% threshold)</p>
                <p><strong>Old Hoarding Detected:</strong> {details?.report?.old_hoarding_detected ? 'Yes' : 'No'}</p>
                <p><strong>Location:</strong> GPS coordinates recorded</p>
              </div>
            </div>
          )}

          {!reportSent ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Report will be sent to:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>📍 Local Municipal Authority</p>
                  <p>🏛️ Advertising Standards Council</p>
                  <p>👮 Local Police Department</p>
                  <p>📱 Emergency Response Unit</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important Notice:</p>
                    <p>This report contains location data and evidence. Authorities will be notified immediately for verification and appropriate action.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSendReport}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Send Report to Authorities
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Report Sent Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Authorities have been notified and will verify the issue within 24-48 hours.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Reference ID:</strong> RPT-{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCapture: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isLoading: boolean;
}

const CameraModal: React.FC<CameraModalProps> = ({ isVisible, onClose, onCapture, videoRef, isLoading }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Camera className="w-6 h-6" />
            Camera Capture
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Starting camera...</p>
              </div>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                className="w-full rounded-lg shadow-lg mb-4"
                style={{ maxHeight: '400px' }}
                autoPlay
                playsInline
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onCapture}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                >
                  <Camera className="w-5 h-5" />
                  Capture Photo
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                >
                  <X className="w-5 h-5" />
                  Stop Camera
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface VideoModalProps {
  isVisible: boolean;
  onClose: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  isLoading: boolean;
  isRecording: boolean;
  recordingDuration: number;
}

const VideoModal: React.FC<VideoModalProps> = ({ 
  isVisible, 
  onClose, 
  onStartRecording, 
  onStopRecording, 
  videoRef, 
  isLoading, 
  isRecording, 
  recordingDuration 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Video className="w-6 h-6" />
            Video Recording
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-purple-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Starting video camera...</p>
              </div>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                className="w-full rounded-lg shadow-lg mb-4"
                style={{ maxHeight: '400px' }}
                autoPlay
                playsInline
                muted
              />
              
              {isRecording && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Recording: {formatTime(recordingDuration)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {!isRecording ? (
                  <button
                    onClick={onStartRecording}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                  >
                    <Video className="w-5 h-5" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={onStopRecording}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                  >
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                >
                  <X className="w-5 h-5" />
                  Close Camera
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ImageCaptureApp: React.FC = () => {
  const [capturedData, setCapturedData] = useState<CapturedData | null>(null);
  const [capturedVideoData, setCapturedVideoData] = useState<CapturedVideoData | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [videoBackendResponse, setVideoBackendResponse] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStartTime, setProcessingStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [hoardingDetectionResult, setHoardingDetectionResult] = useState<any>(null);
  const [processingType, setProcessingType] = useState<string>('');
  const [dragActive, setDragActive] = useState<string>('');
  
  // Modal states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAuthorityAlert, setShowAuthorityAlert] = useState(false);
  const [alertType, setAlertType] = useState<'billboard' | 'hoarding'>('billboard');
  const [alertDetails, setAlertDetails] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRecordRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimeInterval = useRef<NodeJS.Timeout | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimeInterval.current) {
        clearInterval(recordingTimeInterval.current);
      }
    };
  }, []);

  // Check for authority alerts whenever responses are updated
  useEffect(() => {
    // Check billboard results
    if (backendResponse?.full_processing?.boards) {
      for (const board of backendResponse.full_processing.boards) {
        if (board.gemini_check && !board.gemini_check.result) {
          setAlertType('billboard');
          setAlertDetails(board);
          setShowAuthorityAlert(true);
          break;
        }
      }
    }
    
    // Check video billboard results
    if (videoBackendResponse?.full_processing?.boards) {
      for (const board of videoBackendResponse.full_processing.boards) {
        if (board.gemini_check && !board.gemini_check.result) {
          setAlertType('billboard');
          setAlertDetails(board);
          setShowAuthorityAlert(true);
          break;
        }
      }
    }
    
    // Check hoarding results
    if (hoardingDetectionResult?.report?.risk_percent >= 80) {
      setAlertType('hoarding');
      setAlertDetails(hoardingDetectionResult);
      setShowAuthorityAlert(true);
    }
  }, [backendResponse, videoBackendResponse, hoardingDetectionResult]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    setLocationStatus('Getting location...');
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position);
        setLocationStatus(`Location acquired: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      },
      (error) => {
        let errorMessage = 'Location access denied';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationStatus(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    setIsCameraLoading(true);
    setShowCameraModal(true);
    
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        },
        audio: false 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for metadata to load
        await new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play()
                .then(() => {
                  setIsCameraActive(true);
                  setIsCameraLoading(false);
                  resolve();
                })
                .catch((error) => {
                  console.error('Error playing video:', error);
                  setIsCameraLoading(false);
                  reject(error);
                });
            };
            
            videoRef.current.onerror = (error) => {
              console.error('Video element error:', error);
              setIsCameraLoading(false);
              reject(error);
            };
          }
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCameraLoading(false);
      setShowCameraModal(false);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
    setShowCameraModal(false);
  }, []);

  // Start video recording camera
  const startVideoCamera = useCallback(async () => {
    setIsVideoLoading(true);
    setShowVideoModal(true);
    
    try {
      // Stop any existing stream first
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        },
        audio: true 
      });
      
      videoStreamRef.current = stream;
      
      if (videoRecordRef.current) {
        videoRecordRef.current.srcObject = stream;
        
        // Wait for metadata to load
        await new Promise<void>((resolve, reject) => {
          if (videoRecordRef.current) {
            videoRecordRef.current.onloadedmetadata = () => {
              videoRecordRef.current?.play()
                .then(() => {
                  setIsVideoActive(true);
                  setIsVideoLoading(false);
                  resolve();
                })
                .catch((error) => {
                  console.error('Error playing video:', error);
                  setIsVideoLoading(false);
                  reject(error);
                });
            };
            
            videoRecordRef.current.onerror = (error) => {
              console.error('Video element error:', error);
              setIsVideoLoading(false);
              reject(error);
            };
          }
        });
      }
    } catch (error) {
      console.error('Error accessing video camera:', error);
      setIsVideoLoading(false);
      setShowVideoModal(false);
      alert('Unable to access camera for video recording. Please check permissions and try again.');
    }
  }, []);

  // Stop video camera
  const stopVideoCamera = useCallback(() => {
    if (isVideoRecording) {
      stopVideoRecording();
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    if (videoRecordRef.current) {
      videoRecordRef.current.srcObject = null;
    }
    setIsVideoActive(false);
    setIsVideoLoading(false);
    setShowVideoModal(false);
  }, [isVideoRecording]);

  // Start video recording
  const startVideoRecording = useCallback(() => {
    if (!videoStreamRef.current || !distance.trim()) {
      alert('Please enter distance and ensure video camera is active');
      return;
    }
    if (!currentLocation) {
      alert('Please get location first');
      return;
    }

    recordedChunks.current = [];
    const mediaRecorder = new MediaRecorder(videoStreamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        const videoData = reader.result as string;
        const filename = `video_${Date.now()}.webm`;
        const newVideoData: CapturedVideoData = {
          video: videoData,
          distance: distance,
          location: {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy,
            timestamp: currentLocation.timestamp
          },
          filename: filename,
          captureMethod: 'video',
          duration: recordingDuration
        };
        setCapturedVideoData(newVideoData);
        setDistance('');
        stopVideoCamera();
      };
      reader.readAsDataURL(blob);
    };

    mediaRecorder.start();
    setIsVideoRecording(true);
    setRecordingDuration(0);
    
    recordingTimeInterval.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  }, [distance, currentLocation, recordingDuration, stopVideoCamera]);

  // Stop video recording
  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isVideoRecording) {
      mediaRecorderRef.current.stop();
      setIsVideoRecording(false);
      if (recordingTimeInterval.current) {
        clearInterval(recordingTimeInterval.current);
        recordingTimeInterval.current = null;
      }
    }
  }, [isVideoRecording]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !distance.trim()) {
      alert('Please enter distance and ensure camera is active');
      return;
    }
    if (!currentLocation) {
      alert('Please get location first');
      return;
    }
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const filename = `camera_${Date.now()}.jpg`;
      const newData: CapturedData = {
        image: imageData,
        distance: distance,
        location: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          timestamp: currentLocation.timestamp
        },
        filename: filename,
        captureMethod: 'camera'
      };
      setCapturedData(newData);
      setDistance('');
      stopCamera();
    }
  }, [distance, currentLocation, stopCamera]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(type);
    } else if (e.type === 'dragleave') {
      setDragActive('');
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive('');
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (type === 'image') {
        handleFileProcess(files[0], 'image');
      } else if (type === 'video') {
        handleFileProcess(files[0], 'video');
      }
    }
  };

  // Process uploaded file
  const handleFileProcess = (file: File, type: string) => {
    if (!distance.trim()) {
      alert('Please enter distance first');
      return;
    }
    if (!currentLocation) {
      alert('Please get location first');
      return;
    }

    if (type === 'image' && !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      
      if (type === 'image') {
        const newData: CapturedData = {
          image: data,
          distance: distance,
          location: {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy,
            timestamp: currentLocation.timestamp
          },
          filename: file.name,
          captureMethod: 'upload'
        };
        setCapturedData(newData);
      } else {
        const newVideoData: CapturedVideoData = {
          video: data,
          distance: distance,
          location: {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy,
            timestamp: currentLocation.timestamp
          },
          filename: file.name,
          captureMethod: 'video-upload'
        };
        setCapturedVideoData(newVideoData);
      }
      setDistance('');
    };
    reader.readAsDataURL(file);
  };

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileProcess(file, type);
    }
    event.target.value = '';
  }, [distance, currentLocation]);

  // Remove captured data
  const removeData = useCallback(() => {
    setCapturedData(null);
    setCapturedVideoData(null);
    setBackendResponse(null);
    setVideoBackendResponse(null);
    setLoadingProgress(0);
    setIsProcessing(false);
    setElapsedTime(0);
    setHoardingDetectionResult(null);
    setProcessingType('');
    
    // Stop cameras if active
    if (isCameraActive) {
      stopCamera();
    }
    if (isVideoActive) {
      stopVideoCamera();
    }
  }, [isCameraActive, isVideoActive, stopCamera, stopVideoCamera]);

  // Detect button: send captured data to Flask backend
  const detect = async () => {
    if (!capturedData) {
      alert('No captured data available to detect.');
      return;
    }
    
    setIsProcessing(true);
    setProcessingType('Image Detection');
    setLoadingProgress(5);
    setBackendResponse(null);
    const startTime = Date.now();
    setProcessingStartTime(startTime);

    const timeInterval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 300);

      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedData.image,
          distance: capturedData.distance,
          latitude: capturedData.location?.latitude,
          longitude: capturedData.location?.longitude,
          accuracy: capturedData.location?.accuracy,
          timestamp: capturedData.location?.timestamp,
          filename: capturedData.filename,
          method: capturedData.captureMethod,
        }),
      });

      clearInterval(progressInterval);
      clearInterval(timeInterval);
      setLoadingProgress(100);
      setIsProcessing(false);

      const result = await response.json();
      setBackendResponse(result);
    } catch (error) {
      console.error("Error sending data:", error);
      alert('Failed to send data.');
      clearInterval(timeInterval);
      setLoadingProgress(0);
      setIsProcessing(false);
    }
  };

  // Detect video: send video data to Flask backend
  const detectVideo = async () => {
    if (!capturedVideoData) {
      alert('No captured video data available to detect.');
      return;
    }

    setIsProcessing(true);
    setProcessingType('Video Detection');
    setLoadingProgress(5);
    setVideoBackendResponse(null);

    const startTime = Date.now();
    setProcessingStartTime(startTime);

    const timeInterval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 8;
        });
      }, 500);

      const response = await fetch("http://127.0.0.1:5000/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video: capturedVideoData.video,
          distance: capturedVideoData.distance,
          latitude: capturedVideoData.location?.latitude,
          longitude: capturedVideoData.location?.longitude,
          filename: capturedVideoData.filename,
          method: capturedVideoData.captureMethod,
          duration: capturedVideoData.duration
        }),
      });

      clearInterval(progressInterval);
      clearInterval(timeInterval);
      setLoadingProgress(100);
      setIsProcessing(false);

      const result = await response.json();
      setVideoBackendResponse(result);

    } catch (error) {
      console.error("Error sending video data:", error);
      alert('Failed to send video data.');
      clearInterval(timeInterval);
      setLoadingProgress(0);
      setIsProcessing(false);
    }
  };

  // Detect hoarding: send image to Flask backend
  const detectHoarding = async (file: File) => {
    if (!file) {
      alert("No file selected for hoarding detection.");
      return;
    }

    setIsProcessing(true);
    setProcessingType('Hoarding Detection');
    setLoadingProgress(5);
    setHoardingDetectionResult(null);

    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      const response = await fetch("http://127.0.0.1:5000/detect-hoarding", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      setHoardingDetectionResult(result);
      setLoadingProgress(100);
    } catch (error) {
      console.error("Error during hoarding detection:", error);
      alert("Failed to send image for hoarding detection.");
      setLoadingProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced Result Components
  const BillboardAnalysisResult = ({ data }: { data: any }) => {
    if (!data?.boards) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Monitor className="w-6 h-6" />
            Billboard Analysis Results
          </h3>
        </div>
        
        {data.boards.map((board: any, index: number) => (
          <div key={index} className="p-6 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Board #{board.board_id}</h4>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                board.gemini_check?.result 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {board.gemini_check?.result ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approved
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Rejected
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">Extracted Text</h5>
                <p className="text-gray-800 bg-white p-2 rounded border text-sm">
                  {board.extracted_text || 'No text detected'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">Dimensions</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Width:</span> {board.size_m_est?.width_m?.toFixed(2)} m</p>
                  <p><span className="font-medium">Height:</span> {board.size_m_est?.height_m?.toFixed(2)} m</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">Bounding Box</h5>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Top:</span> {board.bbox_px?.top}px</p>
                  <p><span className="font-medium">Bottom:</span> {board.bbox_px?.bottom}px</p>
                  <p><span className="font-medium">Left:</span> {board.bbox_px?.left}px</p>
                  <p><span className="font-medium">Right:</span> {board.bbox_px?.right}px</p>
                </div>
              </div>
            </div>
            
            {board.gemini_check?.reason && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Analysis Report
                </h5>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {board.gemini_check.reason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const HoardingDetectionResult = ({ data }: { data: any }) => {
    if (!data?.report) return null;
    
    const riskLevel = data.report.risk_percent;
    const getRiskColor = () => {
      if (riskLevel >= 70) return 'red';
      if (riskLevel >= 40) return 'yellow';
      return 'green';
    };
    
    const riskColor = getRiskColor();
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Shield className="w-6 h-6" />
            Hoarding Risk Assessment
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 ${
                riskColor === 'red' ? 'bg-red-500' : 
                riskColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {riskLevel}%
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Risk Level</h4>
              <p className={`text-sm font-medium ${
                riskColor === 'red' ? 'text-red-600' : 
                riskColor === 'yellow' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {riskLevel >= 70 ? 'High Risk' : riskLevel >= 40 ? 'Medium Risk' : 'Low Risk'}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className={`px-4 py-2 rounded-lg ${
                data.report.old_hoarding_detected 
                  ? 'bg-red-100 border border-red-200' 
                  : 'bg-green-100 border border-green-200'
              }`}>
                <div className="flex items-center gap-2">
                  {data.report.old_hoarding_detected ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <span className={`font-semibold ${
                    data.report.old_hoarding_detected ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {data.report.old_hoarding_detected ? 'Old Hoarding Detected' : 'No Old Hoarding Detected'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Risk Score</p>
                <p className="text-lg font-bold text-gray-800">{data.report.risk_score.toFixed(3)}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600 font-medium">Damage</p>
              <p className="text-lg font-bold text-blue-800">
                {(data.report.metrics.damage * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600 font-medium">Rust</p>
              <p className="text-lg font-bold text-purple-800">
                {(data.report.metrics.rust * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-sm text-yellow-600 font-medium">Tilt</p>
              <p className="text-lg font-bold text-yellow-800">
                {(data.report.metrics.tilt * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600 font-medium">OCR Confidence</p>
              <p className="text-lg font-bold text-green-800">
                {(data.report.metrics.ocr_conf * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          
          {data.report.reasons && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h5 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Risk Factors Identified
              </h5>
              <ul className="space-y-2">
                {data.report.reasons.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-orange-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Authority Alert Modal */}
      <AuthorityAlert
        isVisible={showAuthorityAlert}
        onClose={() => setShowAuthorityAlert(false)}
        type={alertType}
        details={alertDetails}
      />

      {/* Camera Modal */}
      <CameraModal
        isVisible={showCameraModal}
        onClose={stopCamera}
        onCapture={capturePhoto}
        videoRef={videoRef}
        isLoading={isCameraLoading}
      />

      {/* Video Modal */}
      <VideoModal
        isVisible={showVideoModal}
        onClose={stopVideoCamera}
        onStartRecording={startVideoRecording}
        onStopRecording={stopVideoRecording}
        videoRef={videoRecordRef}
        isLoading={isVideoLoading}
        isRecording={isVideoRecording}
        recordingDuration={recordingDuration}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Media Capture & Detection System
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Capture images and videos with intelligent AI analysis</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Enhanced Processing Status */}
        {isProcessing && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                {processingType}
              </h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-blue-600">{Math.round(loadingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{ width: `${loadingProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Clock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Elapsed Time</p>
                  <p className="text-lg font-bold text-gray-800">{(elapsedTime / 1000).toFixed(1)}s</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="w-6 h-6 mx-auto mb-2">
                    {loadingProgress < 30 && <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>}
                    {loadingProgress >= 30 && loadingProgress < 70 && <div className="w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>}
                    {loadingProgress >= 70 && loadingProgress < 100 && <div className="w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>}
                    {loadingProgress === 100 && <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-bold text-gray-800">
                    {loadingProgress < 30 && 'Initializing...'}
                    {loadingProgress >= 30 && loadingProgress < 70 && 'Processing...'}
                    {loadingProgress >= 70 && loadingProgress < 100 && 'Finalizing...'}
                    {loadingProgress === 100 && 'Complete!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  Location
                </h2>
                <button
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Get Location
                </button>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {locationStatus || 'Click to get your current location'}
              </p>
            </div>

            {/* Distance Input Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                Distance Measurement
              </h2>
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                  Distance from Object (meters)
                </label>
                <input
                  id="distance"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Enter distance in meters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Image Capture Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Camera className="w-6 h-6" />
                  Photo Capture
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Camera Controls */}
                {!capturedData && (
                  <button
                    onClick={startCamera}
                    disabled={isCameraLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCameraLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Starting Camera...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        Open Photo Camera
                      </>
                    )}
                  </button>
                )}

                {/* Replace existing image */}
                {capturedData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm mb-3">Image captured: {capturedData.filename}</p>
                    <button
                      onClick={() => setCapturedData(null)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      Replace Image
                    </button>
                  </div>
                )}

                {/* Drag & Drop Upload for Images */}
                {!capturedData && (
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive === 'image' 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                      onDragEnter={(e) => handleDrag(e, 'image')}
                      onDragLeave={(e) => handleDrag(e, 'image')}
                      onDragOver={(e) => handleDrag(e, 'image')}
                      onDrop={(e) => handleDrop(e, 'image')}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Drag & drop an image here, or <span className="text-blue-600 font-medium">browse</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Image Detection Button */}
                {capturedData && (
                  <button
                    onClick={detect}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-lg font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isProcessing && processingType === 'Image Detection' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Image...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        Detect Image
                      </>
                    )}
                  </button>
                )}

                {/* Hoarding Detection Button */}
                {capturedData && (
                  <button
                    onClick={() => {
                      const byteString = atob(capturedData.image.split(',')[1]);
                      const mimeString = capturedData.image.split(',')[0].split(':')[1].split(';')[0];
                      const ab = new ArrayBuffer(byteString.length);
                      const ia = new Uint8Array(ab);
                      for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                      }
                      const blob = new Blob([ab], { type: mimeString });
                      const file = new File([blob], capturedData.filename || 'capture.jpg', { type: mimeString });
                      detectHoarding(file);
                    }}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-lg font-semibold rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isProcessing && processingType === 'Hoarding Detection' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Detect Hoarding
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Video Capture Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Video className="w-6 h-6" />
                  Video Capture
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Video Camera Controls */}
                {!capturedVideoData && (
                  <button
                    onClick={startVideoCamera}
                    disabled={isVideoLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isVideoLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Starting Video Camera...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5" />
                        Open Video Camera
                      </>
                    )}
                  </button>
                )}

                {/* Replace existing video */}
                {capturedVideoData && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800 text-sm mb-3">Video captured: {capturedVideoData.filename}</p>
                    <button
                      onClick={() => setCapturedVideoData(null)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
                    >
                      Replace Video
                    </button>
                  </div>
                )}

                {/* Drag & Drop Upload for Videos */}
                {!capturedVideoData && (
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video</label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive === 'video' 
                          ? 'border-purple-400 bg-purple-50' 
                          : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                      onDragEnter={(e) => handleDrag(e, 'video')}
                      onDragLeave={(e) => handleDrag(e, 'video')}
                      onDragOver={(e) => handleDrag(e, 'video')}
                      onDrop={(e) => handleDrop(e, 'video')}
                    >
                      <input
                        type="file"
                        ref={videoFileInputRef}
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileVideo className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Drag & drop a video here, or <span className="text-purple-600 font-medium">browse</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Video Detection Button */}
                {capturedVideoData && (
                  <button
                    onClick={detectVideo}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isProcessing && processingType === 'Video Detection' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Video...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5" />
                        Detect Video
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Remove All Data Button */}
            {(capturedData || capturedVideoData || backendResponse || videoBackendResponse || hoardingDetectionResult) && (
              <button
                onClick={removeData}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <X className="w-5 h-5" />
                Remove All Data
              </button>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            {/* Image Preview */}
            {capturedData && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Camera className="w-6 h-6" />
                    Image Preview
                  </h3>
                </div>
                <div className="p-4">
                  <img src={capturedData.image} alt="Captured" className="w-full rounded-lg shadow-md mb-4" />
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">File:</span> {capturedData.filename}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Distance:</span> {capturedData.distance}m
                    </div>
                    {capturedData.location && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-700">Location:</span><br />
                        {capturedData.location.latitude.toFixed(6)}, {capturedData.location.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Video Preview */}
            {capturedVideoData && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Video className="w-6 h-6" />
                    Video Preview
                  </h3>
                </div>
                <div className="p-4">
                  <video 
                    src={capturedVideoData.video} 
                    controls 
                    className="w-full rounded-lg shadow-md mb-4"
                    style={{ maxHeight: '300px' }}
                  />
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">File:</span> {capturedVideoData.filename}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Distance:</span> {capturedVideoData.distance}m
                    </div>
                    {capturedVideoData.duration && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-700">Duration:</span> {formatTime(capturedVideoData.duration)}
                      </div>
                    )}
                    {capturedVideoData.location && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-700">Location:</span><br />
                        {capturedVideoData.location.latitude.toFixed(6)}, {capturedVideoData.location.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section - Below the main interface */}
        <div className="mt-8 space-y-6">
          {/* Billboard Analysis Result */}
          {backendResponse && (
            <BillboardAnalysisResult data={backendResponse.full_processing || backendResponse} />
          )}

          {/* Video Billboard Analysis Result */}
          {videoBackendResponse && (
            <BillboardAnalysisResult data={videoBackendResponse.full_processing || videoBackendResponse} />
          )}

          {/* Hoarding Detection Result */}
          {hoardingDetectionResult && (
            <HoardingDetectionResult data={hoardingDetectionResult} />
          )}

          {/* Raw JSON Results (Collapsed by default) */}
          {(backendResponse || videoBackendResponse || hoardingDetectionResult) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 rounded-t-xl">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-gray-600" />
                    Raw API Responses
                  </h3>
                  <div className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="p-6 border-t border-gray-100 space-y-4">
                  {backendResponse && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Image Detection Response:</h4>
                      <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(backendResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                  {videoBackendResponse && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Video Detection Response:</h4>
                      <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(videoBackendResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                  {hoardingDetectionResult && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Hoarding Detection Response:</h4>
                      <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(hoardingDetectionResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCaptureApp;