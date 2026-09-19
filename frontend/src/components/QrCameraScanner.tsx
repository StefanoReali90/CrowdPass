import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, LoaderCircle } from 'lucide-react';

interface DetectedBarcode {
    rawValue: string;
}

interface BarcodeDetectorInstance {
    detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
}

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

interface QrCameraScannerProps {
    disabled?: boolean;
    onDetected: (value: string) => void | Promise<void>;
}

function getBarcodeDetector() {
    return (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
}

export function QrCameraScanner({ disabled = false, onDetected }: QrCameraScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const frameRef = useRef<number | null>(null);
    const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
    const scanningRef = useRef(false);
    const [active, setActive] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState('');

    const releaseCamera = useCallback((updateState: boolean) => {
        scanningRef.current = false;
        if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        detectorRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        if (updateState) setActive(false);
    }, []);

    const scanFrame = useCallback(async function scan() {
        if (!scanningRef.current || disabled) {
            releaseCamera(true);
            return;
        }

        const video = videoRef.current;
        const detector = detectorRef.current;
        if (video && detector && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            try {
                const codes = await detector.detect(video);
                const value = codes.find((code) => code.rawValue.trim())?.rawValue;
                if (value) {
                    releaseCamera(true);
                    await onDetected(value);
                    return;
                }
            } catch {
                setError('La fotocamera non riesce a leggere il QR. Avvicina il codice e aumenta la luce.');
            }
        }

        if (scanningRef.current) frameRef.current = window.requestAnimationFrame(() => void scan());
    }, [disabled, onDetected, releaseCamera]);

    const startCamera = async () => {
        setStarting(true);
        setError('');
        try {
            const Detector = getBarcodeDetector();
            if (!Detector) throw new Error('unsupported');
            if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });
            streamRef.current = stream;
            detectorRef.current = new Detector({ formats: ['qr_code'] });
            if (!videoRef.current) throw new Error('video');
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            scanningRef.current = true;
            setActive(true);
            frameRef.current = window.requestAnimationFrame(() => void scanFrame());
        } catch (cameraError) {
            releaseCamera(false);
            if (cameraError instanceof DOMException && cameraError.name === 'NotAllowedError') {
                setError('Permesso fotocamera negato. Abilitalo nelle impostazioni del browser oppure usa lo scanner USB.');
            } else if (cameraError instanceof Error && cameraError.message === 'unsupported') {
                setError('Questo browser non supporta la lettura QR da fotocamera. Usa uno scanner USB o inserisci il codice.');
            } else {
                setError('Fotocamera non disponibile. Verifica che non sia utilizzata da un’altra applicazione.');
            }
        } finally {
            setStarting(false);
        }
    };

    useEffect(() => () => releaseCamera(false), [releaseCamera]);

    return (
        <div className={`camera-scanner ${active ? 'active' : ''}`}>
            <div className="camera-viewport" hidden={!active}>
                <video ref={videoRef} muted playsInline aria-label="Inquadratura della fotocamera per leggere il QR code" />
                <span className="camera-target" aria-hidden="true" />
                <span className="camera-instruction">Inquadra il QR nel riquadro</span>
            </div>

            {error && <div className="camera-error" role="alert">{error}</div>}

            {active ? (
                <button type="button" className="button full" onClick={() => releaseCamera(true)}><CameraOff size={17} /> Ferma fotocamera</button>
            ) : (
                <button type="button" className="button primary full" onClick={() => void startCamera()} disabled={disabled || starting}>
                    {starting ? <LoaderCircle className="spinning" size={17} /> : <Camera size={17} />}
                    {starting ? 'Avvio fotocamera…' : 'Scansiona con la fotocamera'}
                </button>
            )}
            <p className="camera-privacy">Il video resta sul dispositivo: PassHalo analizza solo il contenuto del QR.</p>
        </div>
    );
}
