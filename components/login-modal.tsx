"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = () => {
    if (credentials.username === "admin" && credentials.password === "admin") {
      onClose()
      router.push("/admin")
    } else {
      alert("Credenciais inválidas. Use: admin / admin")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl p-0">
        <CardHeader className="relative rounded-t-lg overflow-hidden p-0 h-20 m-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-800/80 to-cyan-700/90" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0 z-10 transition-all hover:scale-110"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="relative z-10 flex items-center justify-center h-full text-white gap-3 px-6">
            <Lock className="w-7 h-7" />
            <CardTitle className="text-2xl md:text-2xl font-bold">Login Administrativo</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="username" className="text-base font-medium">
              Usuário
            </Label>
            <Input
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="mt-1"
              placeholder="Digite seu usuário"
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
            />
          </div>

          <Button onClick={handleLogin} className="w-full bg-[#1694f2] hover:bg-[#1694f2]/90 text-white">
            Entrar
          </Button>

          <p className="text-xs text-muted-foreground text-center">Demo: admin / admin</p>
        </CardContent>
      </Card>
    </div>
  )
}
