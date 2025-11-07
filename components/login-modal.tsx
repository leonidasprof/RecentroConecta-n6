"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Attempting login for:", credentials.username)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("[v0] Login successful:", data.employee.name)
        localStorage.setItem("employee", JSON.stringify(data.employee))
        onClose()
        router.push("/admin")
      } else {
        console.log("[v0] Login failed:", data.error)
        setError(data.error || "Email ou senha inválidos")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Erro ao conectar com o servidor. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Login modal close button clicked")
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
      <Card className="w-full max-w-md shadow-2xl rounded-2xl p-0 border-0" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="relative rounded-t-lg overflow-hidden p-0 h-20 m-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-800/80 to-cyan-700/90" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-4 top-3 text-white hover:bg-white/20 rounded-full w-8 h-8 p-0 z-10 transition-all hover:scale-110"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="relative z-10 flex items-center justify-center h-full w-full text-white gap-2 px-6">
            <Lock className="w-5 h-5" />
            <h2 className="text-xl font-bold">Login Administrativo</h2>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="username" className="text-base font-medium">
              Email
            </Label>
            <Input
              id="username"
              type="email"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="mt-1"
              placeholder="Digite seu email"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-base font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="mt-1"
              placeholder="Digite sua senha"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin()
                }
              }}
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <Button
            onClick={handleLogin}
            className="w-full bg-[#1694f2] hover:bg-[#1694f2]/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">Use o email cadastrado no sistema de funcionários</p>
        </CardContent>
      </Card>
    </div>
  )
}
