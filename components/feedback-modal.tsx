"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star, X, Smile } from "lucide-react"
import Image from "next/image"
import { getSupabase } from "@/lib/supabase"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [visitorName, setVisitorName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Por favor, selecione uma nota de 1 a 5 estrelas")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting feedback with rating:", rating)
      const supabase = getSupabase()

      const { error } = await supabase.from("satisfaction_ratings").insert({
        rating,
        comment: comment || null,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("[v0] Error saving feedback:", error)
        alert("Erro ao enviar avaliação. Tente novamente.")
      } else {
        console.log("[v0] Feedback saved successfully")
        alert("Obrigado pela sua avaliação! 🌟")
        setRating(0)
        setComment("")
        setVisitorName("")
        setIsAnonymous(false)
        onClose()
      }
    } catch (error) {
      console.error("[v0] Error submitting feedback:", error)
      alert("Erro ao enviar avaliação. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Feedback modal close button clicked")
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl p-0 border-0"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative rounded-t-lg overflow-hidden p-0 h-32 m-0">
          <div className="absolute inset-0">
            <Image
              src="/images/fundo-avaliar.jpeg"
              alt="Parque de Esculturas"
              fill
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-800/80 to-cyan-700/90" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0 z-50 transition-all hover:scale-110"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white gap-1 px-4">
            <div className="flex items-center gap-2">
              <Smile className="w-7 h-7 md:w-8 md:h-8" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">Avalie sua Experiência</h2>
            </div>
            <p className="text-white/95 text-sm sm:text-base text-center max-w-lg leading-snug font-medium">
              Como foi sua visita ao parque?
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <label className="text-lg font-semibold mb-3 block text-gray-800">Identificação (opcional):</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => {
                    setIsAnonymous(e.target.checked)
                    if (e.target.checked) setVisitorName("")
                  }}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <label htmlFor="anonymous" className="text-base font-medium text-gray-700 cursor-pointer">
                  Prefiro avaliar anonimamente
                </label>
              </div>
              {!isAnonymous && (
                <Input
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="text-base"
                  placeholder="Digite seu nome (opcional)"
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <p className="text-lg font-semibold mb-4 text-gray-800">Dê uma nota de 1 a 5 estrelas:</p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-base font-medium text-blue-600 text-center">
                Você selecionou: {rating} {rating === 1 ? "estrela" : "estrelas"}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <label className="text-lg font-semibold mb-3 block text-gray-800">
              Conte-nos mais sobre sua experiência:
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-32 text-base resize-none"
              placeholder="Escreva aqui seus comentários... (opcional)"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-14 text-lg font-semibold w-full bg-gradient-to-r from-[#1694f2] via-[#1ed5bb] to-[#06B6D4] hover:from-[#1694f2]/90 hover:via-[#1ed5bb]/90 hover:to-[#06B6D4]/90 text-white shadow-lg"
          >
            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
