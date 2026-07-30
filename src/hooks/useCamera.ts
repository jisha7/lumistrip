/* ============================================
   LumiStrip — useCamera Hook
   Manages webcam stream lifecycle
   ============================================ */

import { useState, useCallback, useRef, useEffect } from 'react';

interface CameraState {
  stream: MediaStream | null;
  error: string | null;
  loading: boolean;
  hasPermission: boolean;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string | null;
}

interface UseCameraReturn extends CameraState {
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => void;
  retry: () => Promise<void>;
}

export function useCamera(): UseCameraReturn {
  const [state, setState] = useState<CameraState>({
    stream: null,
    error: null,
    loading: false,
    hasPermission: false,
    devices: [],
    selectedDeviceId: null,
  });

  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setState((prev) => ({ ...prev, stream: null, hasPermission: false }));
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
          : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      setState({
        stream,
        error: null,
        loading: false,
        hasPermission: true,
        devices: videoDevices,
        selectedDeviceId: deviceId || stream.getVideoTracks()[0]?.getSettings()?.deviceId || null,
      });
    } catch (err: any) {
      let message = 'Failed to access camera';
      if (err.name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        message = 'No camera found on your device.';
      } else if (err.name === 'NotReadableError') {
        message = 'Camera is in use by another application.';
      }
      setState((prev) => ({
        ...prev,
        error: message,
        loading: false,
        stream: null,
        hasPermission: false,
      }));
    }
  }, []);

  const switchCamera = useCallback(async () => {
    if (state.devices.length < 2) return;
    const currentIndex = state.devices.findIndex((d) => d.deviceId === state.selectedDeviceId);
    const nextIndex = (currentIndex + 1) % state.devices.length;
    const nextDevice = state.devices[nextIndex];
    if (nextDevice) {
      stopCamera();
      await startCamera(nextDevice.deviceId);
    }
  }, [state.devices, state.selectedDeviceId, startCamera, stopCamera]);

  const retry = useCallback(async () => {
    await startCamera(state.selectedDeviceId || undefined);
  }, [startCamera, state.selectedDeviceId]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { ...state, startCamera, stopCamera, switchCamera, retry };
}
