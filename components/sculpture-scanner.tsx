"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, X, Upload, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SculptureScannerProps {
  onScan: (sculptureCode: string) => void
  onImageUpload: (file: File) => void
  onClose: () => void
}

export default function SculptureScanner({ onScan, onImageUpload, onClose }: SculptureScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const [scanMode, setScanMode] = useState<"qr" | "photo">("qr")

  useEffect(() => {
    if (scanMode === "qr") {
      const scanner = new Html5Qrcode("sculpture-qr-reader")
      scannerRef.current = scanner

      return () => {
        if (scannerRef.current && isScanning) {
          scannerRef.current
            .stop()
            .then(() => {
              console.log("[v0] Sculpture Scanner stopped")
            })
            .catch((err) => {
              console.error("[v0] Error stopping scanner:", err)
            })
        }
      }
    }
  }, [isScanning, scanMode])

  const startScanning = async () => {
    if (!scannerRef.current) return

    try {
      setError("")
      setIsScanning(true)

      await scannerRef.current.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          console.log("[v0] Sculpture QR Code scanned:", decodedText)
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Ignore scan errors (happens frequently)
        },
      )
    } catch (err) {
      console.error("[v0] Error starting sculpture scanner:", err)
      setError("Não foi possível acessar a câmera. Verifique as permissões.")
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-xl font-bold">Explorar Escultura</h2>
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
        <div className="mb-6 flex gap-3">
          <Button
            onClick={() => {
              stopScanning()
              setScanMode("qr")
            }}
            variant={scanMode === "qr" ? "default" : "outline"}
            className={scanMode === "qr" ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 border-white text-white"}
          >
            <Camera className="w-5 h-5 mr-2" />
            Escanear QR Code
          </Button>
          <Button
            onClick={() => {
              stopScanning()
              setScanMode("photo")
            }}
            variant={scanMode === "photo" ? "default" : "outline"}
            className={scanMode === "photo" ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 border-white text-white"}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Foto
          </Button>
        </div>

        {scanMode === "qr" && (
          <>
            <div id="sculpture-qr-reader" className="w-full max-w-md rounded-lg overflow-hidden"></div>

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
              Aponte a câmera para o código QR próximo à escultura para ver informações detalhadas
            </p>
          </>
        )}

        {scanMode === "photo" && (
          <div className="w-full max-w-md">
            <div className="bg-white/10 rounded-2xl p-8 border-2 border-dashed border-white/30">
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Tire uma foto da escultura</h3>
                <p className="text-white/70 text-sm">
                  Compartilhe sua experiência fazendo upload de uma foto da escultura que você está visitando
                </p>
              </div>

              <Input
                id="sculpture-photo-upload"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="sculpture-photo-upload"
                className="flex items-center justify-center h-14 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg cursor-pointer transition-all font-semibold text-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Tirar Foto ou Upload
              </label>
            </div>

            <p className="text-white/70 text-center mt-6 text-sm">
              Sua foto será associada à sua visita e poderá ser compartilhada na galeria do parque
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
