"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, X } from "lucide-react"
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
  const [visitorType, setVisitorType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Por favor, selecione uma nota de 1 a 5 estrelas")
      return
    }

    if (!visitorType) {
      alert("Por favor, selecione se você é morador local ou turista")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting feedback with rating:", rating, "type:", visitorType)
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
        setVisitorType("")
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
    e.stopPropagation()
    console.log("[v0] Feedback modal close button clicked")
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border-0 shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 z-0">
          <Image src="/images/fundo-avaliar.jpeg" alt="Parque de Esculturas" fill className="object-cover opacity-20" />
        </div>

        <Button
          onClick={handleClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="relative z-10">
          <CardHeader>
            <CardTitle className="text-3xl text-center font-bold">Avalie sua Experiência</CardTitle>
            <p className="text-center text-muted-foreground text-lg">Como foi sua visita ao parque?</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center bg-white/90 rounded-lg p-6">
              <p className="text-xl font-semibold mb-4">Dê uma nota de 1 a 5 estrelas:</p>
              <div className="flex justify-center gap-2 mb-6">
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
                <p className="text-lg font-medium text-blue-600">
                  Você selecionou: {rating} {rating === 1 ? "estrela" : "estrelas"}
                </p>
              )}
            </div>

            <div className="bg-white/90 rounded-lg p-6">
              <label className="text-xl font-semibold mb-3 block">Conte-nos mais sobre sua experiência:</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-32 text-lg resize-none"
                placeholder="Escreva aqui seus comentários... (opcional)"
              />
            </div>

            <div className="space-y-3 bg-white/90 rounded-lg p-6">
              <p className="text-xl font-semibold">Você é:</p>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  onClick={() => setVisitorType("local")}
                  variant="outline"
                  className={`h-16 text-lg font-medium justify-start ${
                    visitorType === "local" ? "bg-blue-100 border-blue-500 border-2" : "bg-white"
                  }`}
                >
                  🏠 Morador local
                </Button>
                <Button
                  type="button"
                  onClick={() => setVisitorType("tourist")}
                  variant="outline"
                  className={`h-16 text-lg font-medium justify-start ${
                    visitorType === "tourist" ? "bg-blue-100 border-blue-500 border-2" : "bg-white"
                  }`}
                >
                  ✈️ Turista
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-16 text-lg font-semibold w-full bg-gradient-to-r from-[#1694f2] via-[#1ed5bb] to-[#06B6D4] hover:from-[#1694f2]/90 hover:via-[#1ed5bb]/90 hover:to-[#06B6D4]/90 text-white shadow-lg"
            >
              {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
