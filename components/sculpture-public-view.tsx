"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Info, Package } from "lucide-react"

interface Sculpture {
  id: string
  code: number
  name: string
  description: string
  curiosity: string
  image_url?: string
}

export default function SculpturePublicView({ sculpture }: { sculpture: Sculpture }) {
  const [likes, setLikes] = useState(0)
  const [userLiked, setUserLiked] = useState(false)

  const handleLike = async (rating: number) => {
    if (userLiked) return

    try {
      const response = await fetch("/api/sculptures/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sculptureId: sculpture.id, rating }),
      })

      if (response.ok) {
        setLikes(rating)
        setUserLiked(true)
      }
    } catch (error) {
      console.error("[v0] Error liking sculpture:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card className="overflow-hidden shadow-2xl">
          <div className="relative h-80 bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
            {sculpture.image_url ? (
              <img
                src={sculpture.image_url || "/placeholder.svg"}
                alt={sculpture.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `/placeholder.svg?height=320&width=512&query=${encodeURIComponent(sculpture.name)}`
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                <Package className="w-32 h-32 text-amber-400" />
              </div>
            )}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
              <span className="text-sm font-mono font-bold text-purple-700">
                ESC{String(sculpture.code).padStart(3, "0")}
              </span>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{sculpture.name}</h1>
              <div className="flex items-start gap-2 text-gray-600 mb-4">
                <Info className="w-5 h-5 mt-0.5 text-purple-600 flex-shrink-0" />
                <p className="text-base leading-relaxed">{sculpture.description}</p>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-purple-900 mb-2">💡 Curiosidade</h3>
              <p className="text-sm text-purple-800 italic">{sculpture.curiosity}</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-center text-sm text-gray-600 mb-4">Gostou desta escultura? Avalie com corações!</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4].map((heart) => (
                  <Button
                    key={heart}
                    onClick={() => handleLike(heart)}
                    disabled={userLiked}
                    variant="outline"
                    size="lg"
                    className={`transition-all ${
                      userLiked && heart <= likes
                        ? "bg-red-500 text-white border-red-500 hover:bg-red-500"
                        : "hover:bg-red-50 hover:border-red-300"
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${userLiked && heart <= likes ? "fill-current" : ""}`} />
                  </Button>
                ))}
              </div>
              {userLiked && (
                <p className="text-center text-sm text-green-600 font-semibold mt-4">
                  ✓ Obrigado por avaliar esta escultura com {likes} {likes === 1 ? "coração" : "corações"}!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
