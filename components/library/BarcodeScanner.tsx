"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * The BarcodeDetector API is Chromium-only today (Android Chrome, desktop
 * Chrome/Edge). Everywhere else the camera would open and read nothing, so the
 * scanner says so rather than pretending.
 */
type DetectorCtor = new (options: { formats: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
};
function getDetector(): DetectorCtor | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector ?? null;
}

export function scannerSupported(): boolean {
  return Boolean(getDetector() && typeof navigator !== "undefined" && navigator.mediaDevices);
}

/**
 * Points the phone's back camera at a book's barcode and hands back the
 * number. ISBNs are printed as EAN-13, so that is the format that matters;
 * QR and UPC are accepted too since a scanner that refuses a code it can
 * plainly read is just annoying.
 */
export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  // the editor behind the scanner should not scroll away under it, whether
  // the camera is live or the error state is showing
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const Detector = getDetector();
    if (!Detector) {
      setError("This browser can't scan barcodes. Chrome on Android, or type the number in.");
      return;
    }

    let stream: MediaStream | null = null;
    let frame = 0;
    let stopped = false;

    const detector = new Detector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code"] });

    (async () => {
      try {
        // environment = the camera on the back of the phone, the one pointing
        // at the book rather than at you
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const read = async () => {
          if (stopped || !videoRef.current || videoRef.current.readyState < 2) {
            frame = requestAnimationFrame(read);
            return;
          }
          try {
            const found = await detector.detect(videoRef.current);
            const code = found.find((c) => /^\d{8,14}$/.test(c.rawValue.replace(/\D/g, "")));
            if (code) {
              onDetected(code.rawValue.replace(/\D/g, ""));
              return;
            }
          } catch {
            // a frame that can't be decoded is normal; keep looking
          }
          frame = requestAnimationFrame(read);
        };
        frame = requestAnimationFrame(read);
      } catch (err) {
        if (typeof window !== "undefined" && !window.isSecureContext) {
          setError("Camera needs a secure connection (https). It won't work over a plain http address.");
        } else if (err instanceof DOMException && err.name === "NotAllowedError") {
          // once denied, the browser won't ask again — no dialog will
          // reappear until the reader clears it themselves
          setError(
            "Camera access is blocked for this site. Tap the icon next to the address bar, open Permissions, allow Camera, then reload the page."
          );
        } else if (err instanceof DOMException && err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err instanceof DOMException && err.name === "NotReadableError") {
          setError("The camera is already in use by another app.");
        } else {
          setError("Couldn't open the camera. Check the site's camera permission.");
        }
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/85 p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Scan a barcode"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close scanner"
        className="absolute right-5 top-5 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25"
      >
        <X className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {error ? (
        <p className="max-w-xs text-center font-body text-sm leading-relaxed text-white/80">{error}</p>
      ) : (
        <>
          <div className="relative w-full max-w-sm overflow-hidden rounded-token-lg">
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            {/* the window to line the barcode up in */}
            <div className="pointer-events-none absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 rounded-token border-2 border-white/80" />
          </div>
          <p className="mt-5 font-body text-sm text-white/70">
            Point the camera at the barcode on the back of the book.
          </p>
        </>
      )}
    </div>
  );
}
