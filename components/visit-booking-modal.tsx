"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Download, Mail, Calendar, Plus, Trash2, Users, Building2 } from "lucide-react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import jsPDF from "jspdf"
import { getSupabase } from "@/lib/supabase"

interface VisitBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Visitor {
  id: string
  name: string
  age: string
  cpf_rg: string
  contact: string
}

interface Partner {
  id: number
  name: string
  type: string
  contact: string
  email: string
}

export default function VisitBookingModal({ isOpen, onClose }: VisitBookingModalProps) {
  const [step, setStep] = useState(1)
  const [isPartner, setIsPartner] = useState<boolean | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string>("")

  const [newPartner, setNewPartner] = useState({
    name: "",
    type: "",
    contact: "",
    email: "",
    phone: "",
  })

  const [responsibleData, setResponsibleData] = useState({
    name: "",
    email: "",
    phone: "",
    visitDate: "",
    visitTime: "", // Added visit time field
  })
  const [visitors, setVisitors] = useState<Visitor[]>([{ id: "1", name: "", age: "", cpf_rg: "", contact: "" }])
  const [generatedBookingId, setGeneratedBookingId] = useState<string>("")

  useEffect(() => {
    const loadPartners = async () => {
      console.log("[v0] Loading partners...")
      const supabase = getSupabase()
      const { data, error } = await supabase.from("partners").select("*")

      if (data && !error) {
        console.log("[v0] Loaded partners:", data)
        setPartners(data)
      } else {
        console.error("[v0] Error loading partners:", error)
      }
    }

    if (isOpen) {
      loadPartners()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    // Reset all states
    setStep(1)
    setIsPartner(null)
    setSelectedPartner("")
    setNewPartner({ name: "", type: "", contact: "", email: "", phone: "" })
    setResponsibleData({ name: "", email: "", phone: "", visitDate: "", visitTime: "" })
    setVisitors([{ id: "1", name: "", age: "", cpf_rg: "", contact: "" }])
    setGeneratedBookingId("")
    onClose()
  }

  const addVisitor = () => {
    const newVisitor: Visitor = {
      id: Date.now().toString(),
      name: "",
      age: "",
      cpf_rg: "",
      contact: "",
    }
    setVisitors([...visitors, newVisitor])
  }

  const removeVisitor = (id: string) => {
    if (visitors.length > 1) {
      setVisitors(visitors.filter((v) => v.id !== id))
    }
  }

  const updateVisitor = (id: string, field: keyof Visitor, value: string) => {
    setVisitors(visitors.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  const handleRegisterNewPartner = async () => {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("partners")
      .insert({
        name: newPartner.name,
        type: newPartner.type,
        contact: newPartner.contact,
        email: newPartner.email,
        phone: newPartner.phone,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error registering partner:", error)
      alert("Erro ao cadastrar parceiro. Tente novamente.")
      return false
    }

    if (data) {
      setPartners([...partners, data])
      setSelectedPartner(data.id.toString())
      alert(`Parceiro cadastrado com sucesso!\nNome: ${data.name}`)
      return true
    }

    return false
  }

  const handleSubmitBooking = async () => {
    console.log("[v0] Submitting booking...")

    if (isPartner === false) {
      const registered = await handleRegisterNewPartner()
      if (!registered) return
    }

    const supabase = getSupabase()
    const bookingCode = `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setGeneratedBookingId(bookingCode)

    let partnerInfo = null
    if (isPartner && selectedPartner) {
      const partner = partners.find((p) => p.id.toString() === selectedPartner)
      partnerInfo = partner
        ? {
            partner_id: partner.id,
            organization: partner.name,
          }
        : null
    } else if (isPartner === false) {
      partnerInfo = {
        organization: newPartner.name,
      }
    }

    const bookingPayload = {
      booking_code: bookingCode,
      responsible_name: responsibleData.name,
      responsible_email: responsibleData.email,
      responsible_phone: responsibleData.phone,
      visit_date: responsibleData.visitDate,
      visit_time: responsibleData.visitTime,
      total_visitors: visitors.length,
      visitor_type: "group",
      qr_code: bookingCode,
      confirmation_sent: false,
      validated: false,
      ...partnerInfo,
    }

    console.log("[v0] Creating booking with payload:", bookingPayload)

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingPayload)
      .select()
      .single()

    if (bookingError || !bookingData) {
      console.error("[v0] Error saving booking:", bookingError)
      alert("Erro ao criar agendamento. Tente novamente.")
      return
    }

    console.log("[v0] Booking created successfully:", bookingData)

    const visitorsPayload = visitors.map((visitor) => ({
      booking_id: bookingData.id,
      name: visitor.name,
      age: Number.parseInt(visitor.age),
      document_type: visitor.cpf_rg.replace(/\D/g, "").length === 11 ? "CPF" : "RG",
      document_number: visitor.cpf_rg,
    }))

    const { error: visitorsError } = await supabase.from("booking_visitors").insert(visitorsPayload)

    if (visitorsError) {
      console.error("[v0] Error saving visitors:", visitorsError)
      alert("Erro ao salvar visitantes. Tente novamente.")
      return
    }

    console.log("[v0] Visitors saved successfully")

    try {
      console.log("[v0] Sending confirmation email...")
      const emailResponse = await fetch("/api/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: bookingData.id }),
      })

      const emailResult = await emailResponse.json()

      if (emailResult.success) {
        console.log("[v0] Confirmation email sent successfully")
        // Update booking to mark email as sent
        await supabase.from("bookings").update({ confirmation_sent: true }).eq("id", bookingData.id)
      } else {
        console.error("[v0] Error sending email:", emailResult.error)
      }
    } catch (emailError) {
      console.error("[v0] Error calling email API:", emailError)
    }

    console.log("[v0] Moving to confirmation step")
    setStep(3)
  }

  const generateBookingPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("PARQUE DAS ESCULTURAS", 105, 30, { align: "center" })

    doc.setFontSize(16)
    doc.setFont("helvetica", "normal")
    doc.text("Agendamento de Visita", 105, 40, { align: "center" })

    const qrCodeElement = document.getElementById("booking-qr-code")
    if (qrCodeElement) {
      const svgData = new XMLSerializer().serializeToString(qrCodeElement)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new globalThis.Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngData = canvas.toDataURL("image/png")
        doc.addImage(pngData, "PNG", 70, 50, 70, 70)

        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")

        doc.text(`Responsável: ${responsibleData.name}`, 20, 135)
        doc.text(`E-mail: ${responsibleData.email}`, 20, 145)
        doc.text(`Telefone: ${responsibleData.phone}`, 20, 155)
        doc.text(`Data da Visita: ${new Date(responsibleData.visitDate).toLocaleDateString("pt-BR")}`, 20, 165)
        doc.text(`Horário: ${responsibleData.visitTime}`, 20, 175) // Added time
        doc.text(`Total de Visitantes: ${visitors.length}`, 20, 185)

        doc.text("Lista de Visitantes:", 20, 200)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)

        let yPosition = 210
        visitors.forEach((visitor, index) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(`${index + 1}. ${visitor.name} - ${visitor.age} anos - ${visitor.cpf_rg}`, 25, yPosition)
          yPosition += 10
        })

        doc.text(`ID: ${generatedBookingId}`, 20, yPosition + 10)

        doc.save(`agendamento-${generatedBookingId}.pdf`)
      }

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
    }
  }

  const handleGenerateAnother = () => {
    setStep(1)
    setIsPartner(null)
    setSelectedPartner("")
    setNewPartner({ name: "", type: "", contact: "", email: "", phone: "" })
    setResponsibleData({ name: "", email: "", phone: "", visitDate: "", visitTime: "" })
    setVisitors([{ id: "1", name: "", age: "", cpf_rg: "", contact: "" }])
    setGeneratedBookingId("")
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <Card
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in rounded-2xl p-0 flex flex-col border-0"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative rounded-t-lg overflow-hidden p-0 h-32 m-0 flex-shrink-0">
          <div className="absolute inset-0">
            <Image src="/images/marco-zero.jpeg" alt="Marco Zero" fill className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/90 via-teal-800/80 to-cyan-700/90" />
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
              <Calendar className="w-6 h-6 md:w-7 md:h-7 opacity-50" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">Agendar Visita</h2>
            </div>
            <p className="text-white/95 text-xs sm:text-sm md:text-base text-center max-w-lg leading-snug font-medium">
              Organize sua visita em grupo ao Parque de Esculturas
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1">
          {step === 1 && isPartner === null && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <Building2 className="w-16 h-16 mx-auto text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-800">Você é um parceiro cadastrado?</h3>
                <p className="text-slate-600">
                  Parceiros cadastrados incluem escolas, hotéis, agências de turismo e outras instituições
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setIsPartner(true)}
                  className="h-24 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                >
                  <Building2 className="w-6 h-6 mr-2" />
                  Sim, sou parceiro
                </Button>
                <Button
                  onClick={() => setIsPartner(false)}
                  variant="outline"
                  className="h-24 text-lg border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold bg-transparent"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Não, quero me cadastrar
                </Button>
              </div>
            </div>
          )}

          {step === 1 && isPartner === true && (
            <div className="space-y-6">
              <Button onClick={() => setIsPartner(null)} variant="ghost" className="mb-4">
                ← Voltar
              </Button>

              <div className="space-y-4 bg-white/95 rounded-lg p-6">
                <Label htmlFor="partner-select" className="text-lg font-semibold">
                  <Building2 className="w-5 h-5 inline mr-2" />
                  Selecione sua Organização/Instituição
                </Label>
                {partners.length > 0 ? (
                  <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                    <SelectTrigger id="partner-select" className="h-12 text-base">
                      <SelectValue placeholder="Escolha sua organização" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id.toString()}>
                          {partner.name} - {partner.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-3">Nenhum parceiro cadastrado ainda.</p>
                    <Button type="button" onClick={() => setIsPartner(false)} variant="outline" className="w-full">
                      Cadastrar como novo parceiro
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && isPartner === false && (
            <div className="space-y-6">
              <Button onClick={() => setIsPartner(null)} variant="ghost" className="mb-4">
                ← Voltar
              </Button>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Cadastrar Nova Organização/Instituição
                </h3>

                <div>
                  <Label htmlFor="partner-name">Nome da Organização</Label>
                  <Input
                    id="partner-name"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    placeholder="Ex: Colégio Santa Maria"
                  />
                </div>

                <div>
                  <Label htmlFor="partner-type">Tipo</Label>
                  <Select
                    value={newPartner.type}
                    onValueChange={(value) => setNewPartner({ ...newPartner, type: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 text-base border-2 focus:border-emerald-500">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Escola">Escola</SelectItem>
                      <SelectItem value="Hotel">Hotel</SelectItem>
                      <SelectItem value="Agência">Agência de Turismo</SelectItem>
                      <SelectItem value="Empresa">Empresa</SelectItem>
                      <SelectItem value="ONG">ONG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="partner-contact">Nome do Contato</Label>
                  <Input
                    id="partner-contact"
                    value={newPartner.contact}
                    onChange={(e) => setNewPartner({ ...newPartner, contact: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    placeholder="Nome do responsável"
                  />
                </div>

                <div>
                  <Label htmlFor="partner-email">E-mail</Label>
                  <Input
                    id="partner-email"
                    type="email"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    placeholder="contato@organizacao.com"
                  />
                </div>

                <div>
                  <Label htmlFor="partner-phone">Telefone</Label>
                  <Input
                    id="partner-phone"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    placeholder="(81) 99999-9999"
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!newPartner.name || !newPartner.type || !newPartner.contact || !newPartner.email}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg font-semibold disabled:opacity-50"
                >
                  Continuar com Cadastro
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Button onClick={() => setStep(1)} variant="ghost" className="mb-4">
                ← Voltar
              </Button>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Dados do Responsável
                </h3>

                <div>
                  <Label htmlFor="resp-name">Nome Completo</Label>
                  <Input
                    id="resp-name"
                    value={responsibleData.name}
                    onChange={(e) => setResponsibleData({ ...responsibleData, name: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    placeholder="Nome do responsável"
                  />
                </div>

                <div>
                  <Label htmlFor="resp-email">E-mail</Label>
                  <Input
                    id="resp-email"
                    type="email"
                    value={responsibleData.email}
                    onChange={(e) => setResponsibleData({ ...responsibleData, email: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="resp-phone">Telefone</Label>
                  <Input
                    id="resp-phone"
                    value={responsibleData.phone}
                    onChange={(e) => setResponsibleData({ ...responsibleData, phone: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    placeholder="(81) 99999-9999"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visit-date">Data da Visita</Label>
                    <Input
                      id="visit-date"
                      type="date"
                      value={responsibleData.visitDate}
                      onChange={(e) => setResponsibleData({ ...responsibleData, visitDate: e.target.value })}
                      className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="visit-time">Horário da Visita</Label>
                    <Input
                      id="visit-time"
                      type="time"
                      value={responsibleData.visitTime}
                      onChange={(e) => setResponsibleData({ ...responsibleData, visitTime: e.target.value })}
                      className="mt-2 h-12 text-base border-2 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-slate-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Lista de Visitantes ({visitors.length})
                  </h3>
                  <Button type="button" onClick={addVisitor} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {visitors.map((visitor, index) => (
                    <div key={visitor.id} className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-700">Visitante {index + 1}</span>
                        {visitors.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVisitor(visitor.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Nome</Label>
                          <Input
                            value={visitor.name}
                            onChange={(e) => updateVisitor(visitor.id, "name", e.target.value)}
                            className="mt-1 h-10 text-sm"
                            placeholder="Nome completo"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-600">Idade</Label>
                          <Input
                            type="number"
                            value={visitor.age}
                            onChange={(e) => updateVisitor(visitor.id, "age", e.target.value)}
                            className="mt-1 h-10 text-sm"
                            placeholder="Idade"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-600">CPF ou RG</Label>
                          <Input
                            value={visitor.cpf_rg}
                            onChange={(e) => updateVisitor(visitor.id, "cpf_rg", e.target.value)}
                            className="mt-1 h-10 text-sm"
                            placeholder="000.000.000-00"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-600">Contato</Label>
                          <Input
                            value={visitor.contact}
                            onChange={(e) => updateVisitor(visitor.id, "contact", e.target.value)}
                            className="mt-1 h-10 text-sm"
                            placeholder="Telefone ou e-mail"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Após o agendamento, você receberá um e-mail com o QR code que liberará a
                  entrada de todos os visitantes cadastrados na data e horário selecionados.
                </p>
              </div>

              <Button
                onClick={handleSubmitBooking}
                disabled={
                  !responsibleData.name ||
                  !responsibleData.email ||
                  !responsibleData.phone ||
                  !responsibleData.visitDate ||
                  !responsibleData.visitTime ||
                  visitors.some((v) => !v.name || !v.age || !v.cpf_rg)
                }
                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg font-semibold disabled:opacity-50"
              >
                Confirmar Agendamento
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 animate-fade-in">
                <div className="text-center space-y-4">
                  <div className="flex justify-center items-center gap-6 mb-4">
                    <Image
                      src="/images/recentro-logo.png"
                      alt="Recentro"
                      width={60}
                      height={60}
                      className="rounded-lg"
                    />
                    <Image
                      src="/images/prefeitura-recife-logo.png"
                      alt="Prefeitura do Recife"
                      width={60}
                      height={60}
                      className="rounded-lg"
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-800">AGENDAMENTO CONFIRMADO</h3>
                  <p className="text-lg text-emerald-600 font-semibold">Parque de Esculturas Francisco Brennand</p>

                  <div className="w-32 h-32 mx-auto bg-white border-4 border-emerald-500 rounded-2xl flex items-center justify-center shadow-lg p-2">
                    <QRCodeSVG id="booking-qr-code" value={generatedBookingId} size={112} level="H" />
                  </div>

                  <div className="bg-white/80 p-4 rounded-xl text-left space-y-2 shadow-inner">
                    <p className="text-base">
                      <strong>Responsável:</strong> {responsibleData.name}
                    </p>
                    <p className="text-base">
                      <strong>E-mail:</strong> {responsibleData.email}
                    </p>
                    <p className="text-base">
                      <strong>Telefone:</strong> {responsibleData.phone}
                    </p>
                    <p className="text-base">
                      <strong>Data da Visita:</strong> {new Date(responsibleData.visitDate).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-base">
                      <strong>Horário:</strong> {responsibleData.visitTime}
                    </p>
                    <p className="text-base">
                      <strong>Total de Visitantes:</strong> {visitors.length}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">
                      <strong>ID:</strong> {generatedBookingId}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border-2 border-emerald-200 mt-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-1" />
                      <div className="text-left">
                        <p className="text-base font-bold text-slate-800 mb-2">✓ Tudo enviado!</p>
                        <p className="text-base text-slate-700 leading-relaxed">
                          Um e-mail de confirmação com o QR code e a lista de todos os visitantes foi enviado para{" "}
                          <strong>{responsibleData.email}</strong>. Apresente o QR code na entrada do parque na data e
                          horário agendados. Todos os visitantes serão validados automaticamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={generateBookingPDF}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg font-semibold"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Baixar Agendamento PDF
                </Button>

                <Button
                  onClick={handleGenerateAnother}
                  variant="outline"
                  className="w-full h-12 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-base font-semibold bg-transparent"
                >
                  Fazer Novo Agendamento
                </Button>

                <Button
                  onClick={handleClose}
                  variant="ghost"
                  className="w-full h-12 text-slate-500 hover:text-slate-700 text-base"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
