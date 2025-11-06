"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  MapPin,
  Camera,
  Star,
  QrCode,
  Menu,
  Calendar,
  Instagram,
  Facebook,
  Youtube,
  Languages,
  Palette,
} from "lucide-react"
import TicketModal from "@/components/ticket-modal"
import LoginModal from "@/components/login-modal"
import VisitBookingModal from "@/components/visit-booking-modal"
import { getSupabase } from "@/lib/supabase"

export default function RecentroConecta() {
  const [currentScreen, setCurrentScreen] = useState("home")
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [visitorCount, setVisitorCount] = useState(127543)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [language, setLanguage] = useState("pt")
  const [parkOpen, setParkOpen] = useState(true)

  const bannerImages = [
    "/images/banner.jpeg",
    "/images/sculptures-2.jpeg",
    "/images/sculptures-3.jpeg",
    "/images/sculptures-4.jpeg",
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTicketModal(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadParkStatus = async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("park_settings").select("is_open").single()

      if (data && !error) {
        setParkOpen(data.is_open)
      } else {
        // Fallback to localStorage
        const savedStatus = localStorage.getItem("parkStatus")
        if (savedStatus !== null) {
          setParkOpen(savedStatus === "true")
        }
      }
    }

    loadParkStatus()

    // Poll for updates every 30 seconds
    const interval = setInterval(loadParkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const renderHomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="header-navy shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/recentro-logo.png" alt="Recentro" width={45} height={45} className="rounded-lg" />
              <Image
                src="/images/recentro-conecta-logo.png"
                alt="Recentro Conecta"
                width={45}
                height={45}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-white">RecentroConecta</h1>
                <p className="text-white/80 text-xs">Parque de Esculturas Francisco Brennand</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Button
                  onClick={() => setShowMenu(!showMenu)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 modern-button"
                >
                  <Menu className="w-5 h-5" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                    <button
                      onClick={() => {
                        setShowLoginModal(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => {
                        setShowTicketModal(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Ingresso
                    </button>
                    <button
                      onClick={() => {
                        setShowBookingModal(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Agendar Visita
                    </button>
                    <button
                      onClick={() => {
                        setLanguage(language === "pt" ? "en" : "pt")
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Languages className="w-4 h-4" />
                      {language === "pt" ? "English" : "Português"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Section 1: Welcome Banner */}
        <div className="mb-8">
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
            {bannerImages.map((image, index) => (
              <div
                key={image}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image src={image || "/placeholder.svg"} alt="Parque das Esculturas" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
              </div>
            ))}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white animate-fade-in">
                <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">Bem-vindo ao Parque</h2>
                <p className="text-2xl drop-shadow-md">Descubra a arte em cada escultura</p>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <Card
            className={`modern-card animate-fade-in border-2 ${parkOpen ? "border-emerald-200" : "border-red-200"}`}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
                {/* Left side: Status with Brennand image */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                  <div className="flex-shrink-0">
                    <Image
                      src={parkOpen ? "/images/brennand-happy.png" : "/images/brennand-sad.png"}
                      alt={parkOpen ? "Brennand de braços abertos" : "Brennand triste"}
                      width={120}
                      height={120}
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    {parkOpen ? (
                      <>
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse-color"></div>
                          <span className="text-2xl md:text-3xl text-emerald-600 font-bold">ABERTO</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-sm md:text-base px-3 py-1 bg-emerald-100 text-emerald-800"
                        >
                          Hoje: 8h às 17h
                        </Badge>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span className="text-lg md:text-2xl text-red-600 font-bold">TEMPORARIAMENTE FECHADO</span>
                        </div>
                        <p className="text-sm text-red-700">O parque está temporariamente fechado para visitação</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side: Tide information */}
                <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto justify-center lg:justify-end">
                  <div className="text-center bg-blue-50 px-4 py-3 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Maré Alta</p>
                    <p className="text-lg md:text-xl font-bold text-blue-600">14:30</p>
                  </div>
                  <div className="text-center bg-blue-50 px-4 py-3 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Maré Baixa</p>
                    <p className="text-lg md:text-xl font-bold text-blue-600">20:45</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Function buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => setCurrentScreen("info")}
              className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white modern-button text-base flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Como Chegar
            </Button>

            <Button
              onClick={() => setCurrentScreen("feedback")}
              className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white modern-button text-base flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              Avaliar
            </Button>

            <Button
              onClick={() => setShowBookingModal(true)}
              className="h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white modern-button text-base flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Agendar Visita
            </Button>

            <Button
              onClick={() => setShowTicketModal(true)}
              className="h-20 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white modern-button text-base flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Ingresso
            </Button>
          </div>
        </div>

        {/* Section 4: Sculptures */}
        <div className="mb-8">
          <Card className="modern-card animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text flex items-center gap-3">
                <Palette className="w-7 h-7 text-purple-600" />
                Conheça as Esculturas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative h-48 rounded-lg overflow-hidden group">
                  <Image
                    src="/images/sculptures-1.jpeg"
                    alt="Esculturas marinhas"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-semibold">Serpentes do Mar</h3>
                    <p className="text-sm opacity-90">Francisco Brennand</p>
                  </div>
                </div>

                <div className="relative h-48 rounded-lg overflow-hidden group">
                  <Image
                    src="/images/sculptures-4.jpeg"
                    alt="Totens artísticos"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-semibold">Totens Cerâmicos</h3>
                    <p className="text-sm opacity-90">Arte Contemporânea</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setCurrentScreen("qr")}
                className="w-full h-14 text-base font-medium bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Explorar Esculturas
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="modern-card animate-fade-in bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text flex items-center gap-2">
                <Instagram className="w-6 h-6 text-pink-600" />
                Fique Ligado
              </CardTitle>
              <p className="text-slate-600">Acompanhe as últimas novidades do parque</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Instagram post 1 */}
                <div className="relative h-64 rounded-lg overflow-hidden group cursor-pointer">
                  <Image
                    src="/images/instagram-post-1.jpeg"
                    alt="Post Instagram 1"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-semibold">Vista panorâmica do parque 🌊</p>
                    <p className="text-xs mt-1">Há 2 dias</p>
                  </div>
                </div>

                {/* Instagram post 2 */}
                <div className="relative h-64 rounded-lg overflow-hidden group cursor-pointer">
                  <Image
                    src="/images/instagram-post-2.jpeg"
                    alt="Post Instagram 2"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-semibold">Visitantes apreciando as esculturas 🎨</p>
                    <p className="text-xs mt-1">Há 4 dias</p>
                  </div>
                </div>

                {/* Instagram post 3 */}
                <div className="relative h-64 rounded-lg overflow-hidden group cursor-pointer">
                  <Image
                    src="/images/instagram-post-3.jpeg"
                    alt="Post Instagram 3"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-semibold">Museu a céu aberto gratuito! 📸</p>
                    <p className="text-xs mt-1">Há 1 semana</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.open("https://instagram.com/recentrorecife", "_blank")}
                className="w-full h-14 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white text-base font-semibold modern-button"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Seguir no Instagram
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="bg-slate-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-4 gap-4 md:gap-8 mb-8">
            {/* Column 1: Institutional */}
            <div>
              <h4 className="text-sm md:text-lg font-semibold mb-3 md:mb-4 text-cyan-400">Institucional</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Sobre o Recentro
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Quem Somos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    História do Parque
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Transparência
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Visitação */}
            <div>
              <h4 className="text-sm md:text-lg font-semibold mb-3 md:mb-4 text-cyan-400">Visitação</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Horários
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Como Chegar
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Regras
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Acessibilidade
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="hover:text-cyan-400 transition-colors text-left"
                  >
                    Agendar Visita
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Arte & Cultura */}
            <div>
              <h4 className="text-sm md:text-lg font-semibold mb-3 md:mb-4 text-cyan-400">Arte & Cultura</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Esculturas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Artistas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Eventos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Educativo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Galeria
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Contato */}
            <div>
              <h4 className="text-sm md:text-lg font-semibold mb-3 md:mb-4 text-cyan-400">Contato</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Fale Conosco
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Imprensa
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Parcerias
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Suporte
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <Image src="/images/recentro-logo.png" alt="Recentro" width={50} height={50} className="rounded-lg" />
                <Image
                  src="/images/prefeitura-recife-logo.png"
                  alt="Prefeitura do Recife"
                  width={50}
                  height={50}
                  className="rounded-lg bg-white p-1"
                />
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-1">{visitorCount.toLocaleString("pt-BR")}</div>
                <p className="text-sm text-slate-400">Visitantes desde 2000</p>
              </div>

              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-pink-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 text-center text-sm text-slate-400">
              <p>© 2025 Recentro - Prefeitura do Recife. Todos os direitos reservados.</p>
              <p className="mt-1">RECENTRO CONECTA - recentro@recife.pe.gov.br</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )

  const renderInfoScreen = () => (
    <div className="min-h-screen bg-white">
      <header className="bg-primary text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" onClick={() => setCurrentScreen("home")} className="text-white hover:bg-white/20">
            ← Voltar
          </Button>
          <h1 className="large-text font-bold">Informações do Parque</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="large-text flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Horários de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="large-text">Segunda a Sexta</span>
              <span className="large-text font-semibold">8h às 17h</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="large-text">Sábados e Domingos</span>
              <span className="large-text font-semibold">8h às 18h</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="large-text">Feriados</span>
              <span className="large-text font-semibold">9h às 16h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="large-text flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Como Chegar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="large-text font-semibold mb-2">Endereço</h3>
              <p className="large-text text-muted-foreground">
                Av. Brasília Formosa, s/n - Brasília Teimosa, Recife - PE
              </p>
            </div>

            <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.3827654321!2d-34.8654321!3d-8.0654321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMDMnNTUuNiJTIDM0wrA1MSc1NS42Ilc!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa do Parque de Esculturas"
              />
            </div>

            <div>
              <h3 className="large-text font-semibold mb-2">Transporte Público</h3>
              <ul className="space-y-2">
                <li className="large-text">• Ônibus: Linhas 042, 051, 060</li>
                <li className="large-text">• Metrô: Estação Central + ônibus</li>
                <li className="large-text">• Uber/Taxi: Disponível</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="large-text font-semibold mb-2">⚠️ Regras Importantes</h3>
              <ul className="space-y-1">
                <li className="large-text">• Não toque nas esculturas</li>
                <li className="large-text">• Mantenha o local limpo</li>
                <li className="large-text">• Cuidado com as marés</li>
                <li className="large-text">• Use protetor solar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderQRScreen = () => (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary text-secondary-foreground p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" onClick={() => setCurrentScreen("home")} className="hover:bg-white/20">
            ← Voltar
          </Button>
          <h1 className="large-text font-bold">Escanear Escultura</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="w-24 h-24 text-gray-400" />
            </div>

            <h2 className="extra-large-text font-bold mb-4">Aponte a câmera para o QR Code</h2>
            <p className="large-text text-muted-foreground mb-6">
              Encontre o código QR na base da escultura e aponte sua câmera
            </p>

            <Button
              onClick={() => setCurrentScreen("sculpture")}
              className="h-16 text-lg font-medium px-6 py-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Camera className="w-6 h-6 mr-3" />
              Abrir Câmera
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="relative h-40 rounded-lg overflow-hidden">
            <Image src="/images/sculptures-2.jpeg" alt="Vista do parque" fill className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSculptureScreen = () => (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary text-secondary-foreground p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" onClick={() => setCurrentScreen("qr")} className="hover:bg-white/20">
            ← Voltar
          </Button>
          <h1 className="large-text font-bold">Informações da Escultura</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="relative h-64 rounded-lg overflow-hidden">
          <Image src="/images/sculptures-1.jpeg" alt="Esculturas Marinhas" fill className="object-cover" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="extra-large-text">Serpentes do Mar</CardTitle>
            <p className="large-text text-muted-foreground">Por Francisco Brennand</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="large-text leading-relaxed">
              Estas magníficas esculturas em bronze representam serpentes marinhas, simbolizando a conexão entre a terra
              e o mar. Criadas pelo renomado artista pernambucano Francisco Brennand, elas fazem parte do conjunto
              escultórico que transforma o quebra-mar em uma galeria de arte a céu aberto.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="large-text font-semibold mb-2">Curiosidades</h3>
              <ul className="space-y-2">
                <li className="large-text">• Inauguradas em 2000</li>
                <li className="large-text">• Feitas em bronze patinado</li>
                <li className="large-text">• Resistem à maresia</li>
                <li className="large-text">• Cada peça pesa cerca de 2 toneladas</li>
              </ul>
            </div>

            <Button className="h-16 text-lg font-medium px-6 py-4 w-full bg-primary hover:bg-primary/90 text-white">
              🔊 Ouvir Áudio Explicativo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderFeedbackScreen = () => (
    <div className="min-h-screen bg-white">
      <header className="bg-accent text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" onClick={() => setCurrentScreen("home")} className="text-white hover:bg-white/20">
            ← Voltar
          </Button>
          <h1 className="large-text font-bold">Avalie sua Experiência</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="extra-large-text text-center">Como foi sua visita?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="large-text mb-4">Dê uma nota de 1 a 5 estrelas:</p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="outline"
                    size="lg"
                    className="w-16 h-16 text-2xl hover:bg-yellow-100 bg-transparent"
                  >
                    ⭐
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="large-text font-semibold mb-3 block">Conte-nos mais sobre sua experiência:</label>
              <textarea
                className="w-full h-32 p-4 border-2 rounded-lg text-lg resize-none"
                placeholder="Escreva aqui seus comentários..."
              />
            </div>

            <div className="space-y-3">
              <p className="large-text font-semibold">Você é:</p>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="h-16 text-lg font-medium px-6 py-4 justify-start bg-transparent">
                  🏠 Morador local
                </Button>
                <Button variant="outline" className="h-16 text-lg font-medium px-6 py-4 justify-start bg-transparent">
                  ✈️ Turista
                </Button>
              </div>
            </div>

            <Button className="h-16 text-lg font-medium px-6 py-4 w-full bg-accent hover:bg-accent/90 text-white">
              Enviar Avaliação
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const screens = {
    home: renderHomeScreen,
    info: renderInfoScreen,
    qr: renderQRScreen,
    sculpture: renderSculptureScreen,
    feedback: renderFeedbackScreen,
  }

  return (
    <>
      {screens[currentScreen as keyof typeof screens]()}
      <TicketModal isOpen={showTicketModal} onClose={() => setShowTicketModal(false)} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <VisitBookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} />
    </>
  )
}
