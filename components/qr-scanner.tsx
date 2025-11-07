"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"

interface QrScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader")
    scannerRef.current = scanner

    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            console.log("[v0] QR Scanner stopped")
          })
          .catch((err) => {
            console.error("[v0] Error stopping scanner:", err)
          })
      }
    }
  }, [isScanning])

  const startScanning = async () => {
    if (!scannerRef.current) return

    try {
      setError("")
      setIsScanning(true)

      await scannerRef.current.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // Scanning box size
          aspectRatio: 1.0, // Square aspect ratio
        },
        (decodedText) => {
          console.log("[v0] QR Code scanned successfully:", decodedText)
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Ignore scanning errors - they're too verbose
        },
      )
    } catch (err) {
      console.error("[v0] Error starting scanner:", err)
      setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.")
      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (err) {
        console.error("[v0] Error stopping scanner:", err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-xl font-bold">Escanear QR Code</h2>
        <Button
          onClick={() => {
            stopScanning()
            onClose()
          }}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div id="qr-reader" className="w-full max-w-md rounded-lg overflow-hidden"></div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-white text-center max-w-md">
            {error}
          </div>
        )}

        <div className="mt-6">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="h-14 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg font-semibold"
            >
              <Camera className="w-5 h-5 mr-2" />
              Iniciar Scanner
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="outline"
              className="h-14 px-8 bg-white/10 border-white text-white hover:bg-white/20 text-lg font-semibold"
            >
              Parar Scanner
            </Button>
          )}
        </div>

        <p className="text-white/70 text-center mt-4 max-w-md">
          Aponte a câmera para o código QR do ingresso para validar a entrada
        </p>
      </div>
    </div>
  )
}
