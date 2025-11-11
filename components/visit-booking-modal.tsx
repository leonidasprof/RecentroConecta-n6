"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, CheckCircle2 } from "lucide-react"
import { getSupabase } from "@/lib/supabase"

interface VisitBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Partner {
  id: string
  name: string
  organization: string
  email: string
  phone: string
}

export default function VisitBookingModal({ isOpen, onClose }: VisitBookingModalProps) {
  const [step, setStep] = useState<"form" | "success">("form")
  const [isExistingPartner, setIsExistingPartner] = useState<boolean | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [loadingPartners, setLoadingPartners] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    // Partner/Organization info
    organizationType: "",
    organizationName: "",
    responsibleName: "",
    email: "",
    phone: "",

    // Visit details
    visitDate: "",
    visitTime: "",
    numberOfVisitors: "",
    visitType: "guided", // guided or free

    // Accessibility
    signLanguage: false,
    audioDescription: false,

    // Optional
    eventType: "",
    observations: "",
  })

  // Load partners from database
  useEffect(() => {
    if (isOpen && isExistingPartner === true) {
      loadPartners()
    }
  }, [isOpen, isExistingPartner])

  const loadPartners = async () => {
    setLoadingPartners(true)
    console.log("[v0] Loading partners for selection...")

    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("partners").select("*").order("name", { ascending: true })

      if (error) {
        console.error("[v0] Error loading partners:", error)
        alert("Erro ao carregar parceiros. Tente novamente.")
        return
      }

      console.log("[v0] Partners loaded successfully:", data?.length || 0)
      setPartners(data || [])
    } catch (error) {
      console.error("[v0] Exception loading partners:", error)
      alert("Erro ao carregar parceiros. Tente novamente.")
    } finally {
      setLoadingPartners(false)
    }
  }

  const handlePartnerSelect = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId)
    if (partner) {
      console.log("[v0] Partner selected:", partner)
      setFormData((prev) => ({
        ...prev,
        organizationType: partner.organization,
        organizationName: partner.name,
        responsibleName: "", // User can fill this
        email: partner.email,
        phone: partner.phone,
      }))
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.organizationName ||
      !formData.responsibleName ||
      !formData.email ||
      !formData.phone ||
      !formData.visitDate ||
      !formData.visitTime ||
      !formData.numberOfVisitors
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    console.log("[v0] Submitting booking:", formData)

    try {
      const supabase = getSupabase()

      // If new partner, save it first
      if (isExistingPartner === false) {
        console.log("[v0] Creating new partner...")
        const { data: partnerData, error: partnerError } = await supabase
          .from("partners")
          .insert([
            {
              name: formData.organizationName,
              organization: formData.organizationType,
              email: formData.email,
              phone: formData.phone,
            },
          ])
          .select()

        if (partnerError) {
          console.error("[v0] Error creating partner:", partnerError)
          alert("Erro ao cadastrar parceiro. Tente novamente.")
          return
        }

        console.log("[v0] Partner created successfully:", partnerData)
      }

      // Create booking
      const bookingCode = `AG${Date.now().toString().slice(-8)}`
      const qrCodeData = `BOOKING:${bookingCode}`

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            booking_code: bookingCode,
            responsible_name: formData.responsibleName,
            responsible_email: formData.email,
            responsible_phone: formData.phone,
            visit_date: formData.visitDate,
            visit_time: formData.visitTime,
            total_visitors: Number.parseInt(formData.numberOfVisitors),
            visitor_type: formData.visitType === "guided" ? "Visita Guiada" : "Visita Livre",
            qr_code: qrCodeData,
            confirmation_sent: false,
            validated: false,
          },
        ])
        .select()

      if (bookingError) {
        console.error("[v0] Error creating booking:", bookingError)
        alert("Erro ao criar agendamento. Tente novamente.")
        return
      }

      console.log("[v0] Booking created successfully:", bookingData)

      // Send confirmation email
      try {
        const emailResponse = await fetch("/api/send-confirmation-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: bookingData[0].id,
            bookingCode: bookingCode,
            responsibleEmail: formData.email,
            responsibleName: formData.responsibleName,
            visitDate: formData.visitDate,
            visitTime: formData.visitTime,
            numberOfVisitors: formData.numberOfVisitors,
            qrCode: qrCodeData,
          }),
        })

        if (!emailResponse.ok) {
          console.error("[v0] Error sending confirmation email")
        } else {
          console.log("[v0] Confirmation email sent successfully")
        }
      } catch (emailError) {
        console.error("[v0] Exception sending email:", emailError)
      }

      // Show success message
      setStep("success")
    } catch (error) {
      console.error("[v0] Exception during booking submission:", error)
      alert("Erro ao processar agendamento. Tente novamente.")
    }
  }

  const handleClose = () => {
    console.log("[v0] Closing booking modal")
    setStep("form")
    setIsExistingPartner(null)
    setFormData({
      organizationType: "",
      organizationName: "",
      responsibleName: "",
      email: "",
      phone: "",
      visitDate: "",
      visitTime: "",
      numberOfVisitors: "",
      visitType: "guided",
      signLanguage: false,
      audioDescription: false,
      eventType: "",
      observations: "",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "form" ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6 rounded-lg bg-blue-600 p-4 text-white">
              <h2 className="text-2xl font-bold">Agendar Visita ou Evento</h2>
              <p className="text-sm">Para escolas, empresas de turismo, hotéis e grupos organizados</p>
            </div>

            {/* Partner selection */}
            {isExistingPartner === null && (
              <div className="mb-6 space-y-4">
                <Label className="text-lg font-semibold">Você já é um parceiro cadastrado?</Label>
                <div className="flex gap-4">
                  <Button onClick={() => setIsExistingPartner(true)} variant="outline" className="flex-1">
                    Sim, já sou parceiro
                  </Button>
                  <Button onClick={() => setIsExistingPartner(false)} variant="outline" className="flex-1">
                    Não, preciso me cadastrar
                  </Button>
                </div>
              </div>
            )}

            {/* Existing partner selection */}
            {isExistingPartner === true && (
              <div className="mb-6 space-y-4">
                <div>
                  <Label>Selecione sua Organização *</Label>
                  <Select onValueChange={handlePartnerSelect} disabled={loadingPartners}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingPartners ? "Carregando..." : "Selecione sua organização"} />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name} ({partner.organization})
                        </SelectItem>
                      ))}
                      {partners.length === 0 && !loadingPartners && (
                        <SelectItem value="none" disabled>
                          Nenhum parceiro encontrado
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setIsExistingPartner(false)} variant="link" className="text-blue-600">
                  Minha organização não está na lista
                </Button>
              </div>
            )}

            {/* Form fields (show if new partner or partner selected) */}
            {(isExistingPartner === false || formData.organizationName) && (
              <div className="space-y-4">
                {/* New partner - Organization type */}
                {isExistingPartner === false && (
                  <div>
                    <Label htmlFor="orgType">Tipo de Organização *</Label>
                    <Select
                      value={formData.organizationType}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, organizationType: value }))}
                    >
                      <SelectTrigger id="orgType">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Escola">Escola</SelectItem>
                        <SelectItem value="Hotel">Hotel</SelectItem>
                        <SelectItem value="ONG">ONG</SelectItem>
                        <SelectItem value="Agência">Agência de Turismo</SelectItem>
                        <SelectItem value="Empresa">Empresa (eventos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Organization name */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="orgName">Organização/Instituição *</Label>
                    <Input
                      id="orgName"
                      placeholder="Nome da escola, empresa de turismo, hotel..."
                      value={formData.organizationName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, organizationName: e.target.value }))}
                      disabled={isExistingPartner === true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="respName">Nome do Responsável *</Label>
                    <Input
                      id="respName"
                      placeholder="Seu nome completo"
                      value={formData.responsibleName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, responsibleName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={isExistingPartner === true && formData.email !== ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      placeholder="(81) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      disabled={isExistingPartner === true && formData.phone !== ""}
                    />
                  </div>
                </div>

                {/* Visit details */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="date">Data Desejada *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.visitDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, visitDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.visitTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, visitTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="visitors">Nº de Visitantes *</Label>
                    <Input
                      id="visitors"
                      type="number"
                      placeholder="Ex: 30"
                      value={formData.numberOfVisitors}
                      onChange={(e) => setFormData((prev) => ({ ...prev, numberOfVisitors: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Visit type */}
                <div>
                  <Label>Tipo de Visita *</Label>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, visitType: "guided" }))}
                      className={`rounded-lg border-2 p-4 text-left transition-colors ${
                        formData.visitType === "guided"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold">🗣️ Visita Guiada</div>
                      <div className="text-sm text-gray-600">Com acompanhamento de guia especializado</div>
                    </button>
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, visitType: "free" }))}
                      className={`rounded-lg border-2 p-4 text-left transition-colors ${
                        formData.visitType === "free"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold">🚶 Visita Livre</div>
                      <div className="text-sm text-gray-600">Exploração independente do parque</div>
                    </button>
                  </div>
                </div>

                {/* Accessibility */}
                <div>
                  <Label>♿ Recursos de Acessibilidade</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.signLanguage}
                        onChange={(e) => setFormData((prev) => ({ ...prev, signLanguage: e.target.checked }))}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Tradutor de Libras</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.audioDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, audioDescription: e.target.checked }))}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Audiodescrição</span>
                    </label>
                  </div>
                </div>

                {/* Optional fields */}
                <div>
                  <Label htmlFor="eventType">Tipo de Evento (opcional)</Label>
                  <Input
                    id="eventType"
                    placeholder="Ex: Workshop, Sessão de fotos, Evento educativo..."
                    value={formData.eventType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, eventType: e.target.value }))}
                  />
                  <p className="mt-1 text-xs text-gray-500">Deixe em branco se for apenas uma visita ao parque</p>
                </div>

                <div>
                  <Label htmlFor="observations">Observações Adicionais</Label>
                  <Textarea
                    id="observations"
                    placeholder="Informações adicionais sobre sua visita ou necessidades especiais..."
                    value={formData.observations}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observations: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Important info */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
                    📋 Informações Importantes
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Agendamentos devem ser feitos com pelo menos 7 dias de antecedência</li>
                    <li>• Grupos acima de 50 pessoas podem precisar ser divididos</li>
                    <li>• Confirmação da disponibilidade por e-mail em até 48 horas</li>
                    <li>• Eventos especiais estão sujeitos à aprovação e taxas adicionais</li>
                  </ul>
                </div>

                {/* Submit button */}
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 py-6 text-lg font-semibold hover:bg-blue-700"
                >
                  Enviar Solicitação de Agendamento
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-green-600">Agendamento Concluído!</h3>
            <p className="mb-6 text-gray-600">
              Seu agendamento foi realizado com sucesso. O responsável pela parceria receberá um e-mail com todas as
              informações referente à visita, incluindo o QR code para validação.
            </p>
            <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
              Fechar
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
