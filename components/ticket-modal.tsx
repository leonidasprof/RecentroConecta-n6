"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Download, QrCode, User, MapPin, Upload, FileDown, Users, Camera } from "lucide-react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import jsPDF from "jspdf"
import { getSupabase } from "@/lib/supabase"

interface TicketModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TicketModal({ isOpen, onClose }: TicketModalProps) {
  const [step, setStep] = useState(1)
  const [ticketType, setTicketType] = useState<"individual" | "group" | null>(null)
  const [ticketData, setTicketData] = useState({
    name: "",
    age: "",
    visitorType: "",
    origin: "",
    neighborhood: "",
  })
  const [groupData, setGroupData] = useState({
    partnerName: "",
    partnerType: "",
    visitorCount: "",
    uploadedFile: null as File | null,
  })
  const [generatedTicketId, setGeneratedTicketId] = useState<string>("")

  if (!isOpen) return null

  const handleClose = () => {
    console.log("[v0] Close button clicked")
    onClose()
  }

  const handleTypeSelection = (type: "individual" | "group") => {
    setTicketType(type)
    setStep(2)
  }

  const handleNext = async () => {
    if (step < 3) {
      if (step === 2) {
        const supabase = getSupabase()
        const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setGeneratedTicketId(ticketId)

        const ticketPayload = {
          ticket_number: ticketId,
          ticket_type: ticketType === "individual" ? "individual" : "scheduled",
          visitor_name: ticketType === "individual" ? ticketData.name : groupData.partnerName,
          visitor_type: ticketType === "individual" ? ticketData.visitorType : groupData.partnerType,
          visitor_email: null,
          visitor_phone: null,
          visitor_origin: ticketData.origin || null,
          visit_date: new Date().toISOString().split("T")[0],
          number_of_people: ticketType === "individual" ? 1 : Number.parseInt(groupData.visitorCount),
          qr_code: ticketId, // Store ticket ID as QR code value
          is_validated: false,
        }

        const { error } = await supabase.from("tickets").insert(ticketPayload)

        if (error) {
          console.error("[v0] Error saving ticket:", error)
          alert("Erro ao gerar ingresso. Tente novamente.")
          return
        }
      }
      setStep(step + 1)
    }
  }

  const handleGenerateAnother = () => {
    setStep(1)
    setTicketType(null)
    setTicketData({
      name: "",
      age: "",
      visitorType: "",
      origin: "",
      neighborhood: "",
    })
    setGroupData({
      partnerName: "",
      partnerType: "",
      visitorCount: "",
      uploadedFile: null,
    })
    setGeneratedTicketId("")
  }

  const generateTicketPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("PARQUE DAS ESCULTURAS", 105, 30, { align: "center" })

    doc.setFontSize(16)
    doc.setFont("helvetica", "normal")
    doc.text("Ingresso Gratuito", 105, 40, { align: "center" })

    const qrCodeElement = document.getElementById("ticket-qr-code")
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

        if (ticketType === "individual") {
          doc.text(`Nome: ${ticketData.name}`, 20, 135)
          doc.text(`Idade: ${ticketData.age} anos`, 20, 145)
          doc.text(`Tipo: ${ticketData.visitorType === "local" ? "Morador Local" : "Turista"}`, 20, 155)
          if (ticketData.origin) doc.text(`Origem: ${ticketData.origin}`, 20, 165)
          if (ticketData.neighborhood) doc.text(`Bairro: ${ticketData.neighborhood}`, 20, 165)
        } else {
          doc.text(`Parceiro: ${groupData.partnerName}`, 20, 135)
          doc.text(`Tipo: ${groupData.partnerType}`, 20, 145)
          doc.text(`Visitantes: ${groupData.visitorCount}`, 20, 155)
        }

        doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 175)
        doc.text(`ID: ${generatedTicketId}`, 20, 185)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Válido por 24 horas", 20, 195)

        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text("Explore as esculturas no aplicativo!", 20, 210)
        doc.setFont("helvetica", "normal")
        doc.text("Conecte-se às obras apontando sua câmera para o QR code em cada escultura.", 20, 220, {
          maxWidth: 170,
        })

        doc.save(`ingresso-${generatedTicketId}.pdf`)
      }

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
    }
  }

  const downloadListTemplate = () => {
    console.log("[v0] Downloading visitor list template")
    alert("Modelo de lista de visitantes baixado com sucesso!")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setGroupData({ ...groupData, uploadedFile: file })
      console.log("[v0] File uploaded:", file.name)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <Card
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in rounded-2xl p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative rounded-t-lg overflow-hidden p-0 h-40 sm:h-44 m-0">
          <div className="absolute inset-0">
            <Image src="/images/marco-zero.jpeg" alt="Marco Zero" fill className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-800/80 to-cyan-700/90" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0 z-50 transition-all hover:scale-110 pointer-events-auto"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white gap-1 md:gap-2 px-4 py-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-7 h-7 md:w-9 md:h-9 opacity-50" />
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold drop-shadow-lg">Olá!</h2>
            </div>
            <p className="text-white/95 text-sm sm:text-base md:text-lg text-center max-w-lg leading-snug font-medium px-2">
              Gere seu ingresso digital e acesse o museu de arte a céu aberto do Recife.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTypeSelection("individual")}
                  className="group relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl border-4 border-blue-300 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-lg">Individual</h4>
                    <p className="text-sm text-white/90 font-medium">Visitante individual</p>
                  </div>
                </button>

                <button
                  onClick={() => handleTypeSelection("group")}
                  className="group relative overflow-hidden p-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl border-4 border-emerald-300 hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2 text-lg">Agendamento</h4>
                    <p className="text-sm text-white/90 font-medium">Grupos e parceiros</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && ticketType === "individual" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Digite seu nome
                  </Label>
                  <Input
                    id="name"
                    value={ticketData.name}
                    onChange={(e) => setTicketData({ ...ticketData, name: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-blue-500"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-base font-semibold text-slate-700">
                    Digite sua idade
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={ticketData.age}
                    onChange={(e) => setTicketData({ ...ticketData, age: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-blue-500"
                    placeholder="Sua idade"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Você é:
                  </Label>
                  <RadioGroup
                    value={ticketData.visitorType}
                    onValueChange={(value) => setTicketData({ ...ticketData, visitorType: value })}
                    className="mt-3 space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="local" id="local" className="text-blue-600" />
                      <Label htmlFor="local" className="text-base cursor-pointer flex-1">
                        Morador local
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="tourist" id="tourist" className="text-blue-600" />
                      <Label htmlFor="tourist" className="text-base cursor-pointer flex-1">
                        Turista
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {ticketData.visitorType === "tourist" && (
                  <div className="animate-fade-in">
                    <Label htmlFor="origin" className="text-base font-semibold text-slate-700">
                      De onde você é?
                    </Label>
                    <Input
                      id="origin"
                      value={ticketData.origin}
                      onChange={(e) => setTicketData({ ...ticketData, origin: e.target.value })}
                      className="mt-2 h-12 text-base border-2 focus:border-blue-500"
                      placeholder="Cidade/Estado/País"
                    />
                  </div>
                )}

                {ticketData.visitorType === "local" && (
                  <div className="animate-fade-in">
                    <Label htmlFor="neighborhood" className="text-base font-semibold text-slate-700">
                      Qual seu bairro?
                    </Label>
                    <Input
                      id="neighborhood"
                      value={ticketData.neighborhood}
                      onChange={(e) => setTicketData({ ...ticketData, neighborhood: e.target.value })}
                      className="mt-2 h-12 text-base border-2 focus:border-blue-500"
                      placeholder="Digite seu bairro"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-14 border-2 border-slate-300 text-slate-600 hover:bg-slate-50 text-base font-semibold"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!ticketData.name || !ticketData.age || !ticketData.visitorType}
                  className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg font-semibold modern-button disabled:opacity-50"
                >
                  Gerar Ingresso
                </Button>
              </div>
            </div>
          )}

          {step === 2 && ticketType === "group" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="partnerName"
                    className="text-base font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Nome do Parceiro
                  </Label>
                  <Input
                    id="partnerName"
                    value={groupData.partnerName}
                    onChange={(e) => setGroupData({ ...groupData, partnerName: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-blue-500"
                    placeholder="Nome da instituição ou grupo"
                  />
                </div>

                <div>
                  <Label htmlFor="partnerType" className="text-base font-semibold text-slate-700">
                    Tipo de Parceiro
                  </Label>
                  <Select
                    value={groupData.partnerType}
                    onValueChange={(value) => setGroupData({ ...groupData, partnerType: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 text-base border-2">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="escola">Escola</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="agencia">Agência de Turismo</SelectItem>
                      <SelectItem value="grupo">Grupo</SelectItem>
                      <SelectItem value="ong">ONG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visitorCount" className="text-base font-semibold text-slate-700">
                    Quantidade de Visitantes
                  </Label>
                  <Input
                    id="visitorCount"
                    type="number"
                    value={groupData.visitorCount}
                    onChange={(e) => setGroupData({ ...groupData, visitorCount: e.target.value })}
                    className="mt-2 h-12 text-base border-2 focus:border-blue-500"
                    placeholder="Número de visitantes"
                  />
                </div>

                <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50/50">
                  <Label className="text-base font-semibold text-slate-700 mb-3 block">Lista de Visitantes</Label>

                  <Button
                    type="button"
                    onClick={downloadListTemplate}
                    variant="outline"
                    className="w-full h-12 mb-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-base font-semibold bg-transparent"
                  >
                    <FileDown className="w-5 h-5 mr-2" />
                    Baixar Modelo de Lista
                  </Button>

                  <div className="relative">
                    <Input
                      id="fileUpload"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label
                      htmlFor="fileUpload"
                      className="flex items-center justify-center h-12 px-4 border-2 border-emerald-500 bg-emerald-50 text-emerald-700 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors font-semibold"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      {groupData.uploadedFile ? groupData.uploadedFile.name : "Upload da Lista"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-14 border-2 border-slate-300 text-slate-600 hover:bg-slate-50 text-base font-semibold"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!groupData.partnerName || !groupData.partnerType || !groupData.visitorCount}
                  className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg font-semibold modern-button disabled:opacity-50"
                >
                  Confirmar Agendamento
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-cyan-50 animate-fade-in">
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

                  <h3 className="text-2xl font-bold text-slate-800">PARQUE DAS ESCULTURAS</h3>
                  <p className="text-lg text-slate-600">Ingresso Gratuito</p>

                  <div className="w-32 h-32 mx-auto bg-white border-4 border-blue-500 rounded-2xl flex items-center justify-center shadow-lg p-2">
                    <QRCodeSVG id="ticket-qr-code" value={generatedTicketId} size={112} level="H" />
                  </div>

                  <div className="bg-white/80 p-4 rounded-xl text-left space-y-2 shadow-inner">
                    {ticketType === "individual" ? (
                      <>
                        <p className="text-base">
                          <strong>Nome:</strong> {ticketData.name}
                        </p>
                        <p className="text-base">
                          <strong>Idade:</strong> {ticketData.age} anos
                        </p>
                        <p className="text-base">
                          <strong>Tipo:</strong> {ticketData.visitorType === "local" ? "Morador Local" : "Turista"}
                        </p>
                        {ticketData.origin && (
                          <p className="text-base">
                            <strong>Origem:</strong> {ticketData.origin}
                          </p>
                        )}
                        {ticketData.neighborhood && (
                          <p className="text-base">
                            <strong>Bairro:</strong> {ticketData.neighborhood}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-base">
                          <strong>Parceiro:</strong> {groupData.partnerName}
                        </p>
                        <p className="text-base">
                          <strong>Tipo:</strong> {groupData.partnerType}
                        </p>
                        <p className="text-base">
                          <strong>Visitantes:</strong> {groupData.visitorCount}
                        </p>
                      </>
                    )}
                    <p className="text-base">
                      <strong>Data:</strong> {new Date().toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>ID:</strong> {generatedTicketId}
                    </p>
                    <p className="text-sm text-slate-500 mt-3">Válido por 24 horas</p>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-5 rounded-xl border-2 border-cyan-200 mt-4">
                    <div className="flex items-start gap-3">
                      <Camera className="w-7 h-7 text-cyan-600 flex-shrink-0 mt-1" />
                      <div className="text-left">
                        <p className="text-base font-bold text-slate-800 mb-2">Explore Mais!</p>
                        <p className="text-base text-slate-700 leading-relaxed">
                          Explore as esculturas no aplicativo. Conecte-se às obras apontando sua câmera para o QR code
                          em cada escultura.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={generateTicketPDF}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg font-semibold"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Baixar Ingresso PDF
                </Button>

                <Button
                  onClick={handleGenerateAnother}
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-base font-semibold modern-button bg-transparent"
                >
                  Gerar Outro Ingresso
                </Button>

                <Button
                  onClick={onClose}
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
