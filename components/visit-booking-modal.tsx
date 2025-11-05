"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Calendar, Users, Clock, Accessibility } from "lucide-react"

interface VisitBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VisitBookingModal({ isOpen, onClose }: VisitBookingModalProps) {
  const [formData, setFormData] = useState({
    organization: "",
    contact: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    visitors: "",
    visitType: "guided",
    accessibility: [] as string[],
    eventType: "",
    notes: "",
  })

  if (!isOpen) return null

  const handleSubmit = () => {
    alert("Solicitação de agendamento enviada com sucesso! Entraremos em contato em breve.")
    onClose()
  }

  const toggleAccessibility = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      accessibility: prev.accessibility.includes(option)
        ? prev.accessibility.filter((item) => item !== option)
        : [...prev.accessibility, option],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Agendar Visita ou Evento
          </CardTitle>
          <p className="text-white/90 text-sm mt-2">Para escolas, empresas de turismo, hotéis e grupos organizados</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organization" className="text-base font-medium">
                Organização/Instituição *
              </Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="mt-1"
                placeholder="Nome da escola, empresa, hotel..."
              />
            </div>

            <div>
              <Label htmlFor="contact" className="text-base font-medium">
                Nome do Responsável *
              </Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="mt-1"
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-base font-medium">
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-base font-medium">
                Telefone *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
                placeholder="(81) 99999-9999"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date" className="text-base font-medium">
                Data Desejada *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-base font-medium">
                Horário *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="visitors" className="text-base font-medium">
                Nº de Visitantes *
              </Label>
              <Input
                id="visitors"
                type="number"
                value={formData.visitors}
                onChange={(e) => setFormData({ ...formData, visitors: e.target.value })}
                className="mt-1"
                placeholder="Ex: 30"
              />
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Tipo de Visita *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.visitType === "guided" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, visitType: "guided" })}
                className="h-auto py-4 flex flex-col items-start"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Visita Guiada</span>
                </div>
                <span className="text-xs text-left">Com acompanhamento de guia especializado</span>
              </Button>

              <Button
                type="button"
                variant={formData.visitType === "self" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, visitType: "self" })}
                className="h-auto py-4 flex flex-col items-start"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Visita Livre</span>
                </div>
                <span className="text-xs text-left">Exploração independente do parque</span>
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Recursos de Acessibilidade
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "libras", label: "Tradutor de Libras" },
                { id: "wheelchair", label: "Cadeira de Rodas" },
                { id: "audio", label: "Audiodescrição" },
                { id: "braille", label: "Material em Braille" },
              ].map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant={formData.accessibility.includes(option.id) ? "default" : "outline"}
                  onClick={() => toggleAccessibility(option.id)}
                  className="justify-start"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="eventType" className="text-base font-medium">
              Tipo de Evento (opcional)
            </Label>
            <Input
              id="eventType"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="mt-1"
              placeholder="Ex: Workshop, Sessão de fotos, Evento educativo..."
            />
            <p className="text-xs text-muted-foreground mt-1">Deixe em branco se for apenas uma visita regular</p>
          </div>

          <div>
            <Label htmlFor="notes" className="text-base font-medium">
              Observações Adicionais
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              rows={4}
              placeholder="Informações adicionais sobre sua visita ou necessidades especiais..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Informações Importantes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Agendamentos devem ser feitos com pelo menos 7 dias de antecedência</li>
              <li>• Grupos acima de 50 pessoas podem precisar ser divididos</li>
              <li>• Confirmaremos a disponibilidade por e-mail em até 48 horas</li>
              <li>• Eventos especiais estão sujeitos a aprovação e taxas adicionais</li>
            </ul>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-lg"
          >
            Enviar Solicitação de Agendamento
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
