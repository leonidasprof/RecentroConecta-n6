"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Users,
  TrendingUp,
  UserPlus,
  MessageSquare,
  Star,
  Home,
  Building2,
  School,
  Hotel,
  Plane,
  Briefcase,
  MapPin,
  BarChart3,
  UserCog,
  Handshake,
  ImageIcon,
  Database,
  QrCode,
  Download,
  Camera,
  AlertCircle,
  Plus,
  Edit2,
  Upload,
  Trash2,
  Calendar,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getSupabase } from "@/lib/supabase"
import QrScanner from "@/components/qr-scanner" // Imported QrScanner

export default function AdminDashboard() {
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", role: "" })
  const [employees, setEmployees] = useState([
    { id: 1, name: "Carlos Silva", email: "carlos@parque.com", role: "admin" },
    { id: 2, name: "Ana Santos", email: "ana@parque.com", role: "guide" },
    { id: 3, name: "Pedro Costa", email: "pedro@parque.com", role: "manager" },
  ])
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [editingEmployeePassword, setEditingEmployeePassword] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")

  const [newPartner, setNewPartner] = useState({
    name: "",
    type: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  })
  const [editingPartner, setEditingPartner] = useState<any>(null)

  const [partners, setPartners] = useState([
    { id: 1, name: "Colégio Santa Maria", type: "Escola", contact: "Maria Santos", email: "contato@santamaria.edu.br" },
    { id: 2, name: "Hotel Atlante Plaza", type: "Hotel", contact: "João Silva", email: "eventos@atlanteplaza.com.br" },
    { id: 3, name: "Recife Turismo", type: "Agência", contact: "Ana Costa", email: "ana@recifeturismo.com.br" },
  ])

  const [exportPeriod, setExportPeriod] = useState("day")
  const [exportFormat, setExportFormat] = useState("csv")

  const [scannerActive, setScannerActive] = useState(false)
  const [lastScannedTicket, setLastScannedTicket] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null) // Added for potential video stream in future

  const [parkOpen, setParkOpen] = useState(true)

  // Added states for QR Scanner integration
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  const [editingSculpture, setEditingSculpture] = useState<any>(null)

  const [bookings, setBookings] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [editingBooking, setEditingBooking] = useState<any>(null)

  useEffect(() => {
    const loadParkStatus = async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("park_settings").select("is_open").single()

      if (data && !error) {
        setParkOpen(data.is_open)
      } else {
        // Fallback to localStorage if Supabase fails
        const savedStatus = localStorage.getItem("parkStatus")
        if (savedStatus !== null) {
          setParkOpen(savedStatus === "true")
        }
      }
    }

    loadParkStatus()
  }, [])

  useEffect(() => {
    const loadBookings = async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (data && !error) {
        setBookings(data)
      }
    }

    loadBookings()
  }, [])

  const handleSaveParkStatus = async () => {
    console.log("[v0] Saving park status:", parkOpen)

    const supabase = getSupabase()
    const { error } = await supabase
      .from("park_settings")
      .update({ is_open: parkOpen, updated_at: new Date().toISOString() })
      .eq("id", 1)

    if (error) {
      console.error("[v0] Error saving park status:", error)
      alert("Erro ao salvar status do parque. Tente novamente.")
      return
    }

    // Also save to localStorage for immediate UI update
    localStorage.setItem("parkStatus", parkOpen.toString())
    alert(`Status do parque salvo com sucesso!\n\nO parque está agora: ${parkOpen ? "ABERTO" : "FECHADO"}`)
  }

  const [newSculpture, setNewSculpture] = useState({
    name: "",
    description: "",
    curiosity: "",
  })
  const [sculptureImage, setSculptureImage] = useState<File | null>(null) // Added for image upload

  const [sculptures, setSculptures] = useState([
    {
      id: 1,
      code: "ESC001",
      name: "Coluna de Cristal",
      description: "Escultura em bronze",
      curiosity: "Pesa 2 toneladas",
    },
    {
      id: 2,
      code: "ESC002",
      name: "Monumento aos Náufragos",
      description: "Homenagem aos navegadores",
      curiosity: "Inaugurada em 2000",
    },
  ])

  const sculptureVisits = [
    { name: "Coluna de Cristal", visits: 3456, color: "#06B6D4" },
    { name: "Monumento aos Náufragos", visits: 2987, color: "#3B82F6" },
    { name: "Totem Francisco Brennand", visits: 2654, color: "#A855F7" },
    { name: "Marco Zero", visits: 4123, color: "#EC4899" },
    { name: "Arco de Brennand", visits: 2234, color: "#8B5CF6" },
  ]

  const localVisitors = 5234
  const touristVisitors = 3889
  const totalVisitorsToday = localVisitors + touristVisitors // 9123 total

  const visitorsByType = [
    { name: "Locais", value: localVisitors, color: "#06B6D4" },
    { name: "Turistas", value: touristVisitors, color: "#3B82F6" },
  ]

  const visitorsByOrigin = [
    { name: "Individual", value: 4123, color: "#06B6D4" },
    { name: "Escola", value: 2234, color: "#3B82F6" },
    { name: "Agência", value: 1567, color: "#A855F7" },
    { name: "Hotel", value: 1199, color: "#EC4899" },
  ]

  const visitorsByTicketType = [
    { name: "Individual", value: 6234, color: "#06B6D4" },
    { name: "Visita Agendada", value: 2889, color: "#A855F7" },
  ]

  const weeklyDetailedData = [
    { day: "Seg", local: 85, turista: 60, escola: 45, agencia: 30, hotel: 25 },
    { day: "Ter", local: 95, turista: 94, escola: 52, agencia: 38, hotel: 32 },
    { day: "Qua", local: 120, turista: 114, escola: 68, agencia: 45, hotel: 41 },
    { day: "Qui", local: 102, turista: 96, escola: 55, agencia: 42, hotel: 35 },
    { day: "Sex", local: 135, turista: 132, escola: 78, agencia: 58, hotel: 51 },
    { day: "Sáb", local: 198, turista: 214, escola: 95, agencia: 88, hotel: 77 },
    { day: "Dom", local: 185, turista: 204, escola: 88, agencia: 82, hotel: 71 },
  ]

  // Mock data for visitors
  const dailyVisitors = [
    { day: "Seg", visitors: 145 },
    { day: "Ter", visitors: 189 },
    { day: "Qua", visitors: 234 },
    { day: "Qui", visitors: 198 },
    { day: "Sex", visitors: 267 },
    { day: "Sáb", visitors: 412 },
    { day: "Dom", visitors: 389 },
  ]

  const weeklyVisitors = [
    { week: "Sem 1", visitors: 1234 },
    { week: "Sem 2", visitors: 1456 },
    { week: "Sem 3", visitors: 1678 },
    { week: "Sem 4", visitors: 1834 },
  ]

  const monthlyVisitors = [
    { month: "Jan", visitors: 5234 },
    { month: "Fev", visitors: 6123 },
    { month: "Mar", visitors: 7456 },
    { month: "Abr", visitors: 6789 },
    { month: "Mai", visitors: 8234 },
    { month: "Jun", visitors: 9123 },
  ]

  const satisfactionData = [
    { name: "Muito Satisfeito", value: 45, color: "#06B6D4" },
    { name: "Satisfeito", value: 35, color: "#3B82F6" },
    { name: "Neutro", value: 15, color: "#A855F7" },
    { name: "Insatisfeito", value: 5, color: "#EC4899" },
  ]

  const feedbacks = [
    {
      id: 1,
      name: "Maria Silva",
      rating: 5,
      comment: "Experiência incrível! As esculturas são magníficas e o parque é muito bem cuidado.",
      date: "2025-01-15",
    },
    {
      id: 2,
      name: "João Santos",
      rating: 4,
      comment: "Lugar maravilhoso para visitar com a família. Recomendo!",
      date: "2025-01-14",
    },
    {
      id: 3,
      name: "Ana Costa",
      rating: 5,
      comment: "Arte a céu aberto no coração do Recife. Simplesmente perfeito!",
      date: "2025-01-13",
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      rating: 4,
      comment: "Muito bonito, mas poderia ter mais informações sobre as obras.",
      date: "2025-01-12",
    },
    {
      id: 5,
      name: "Carla Mendes",
      rating: 5,
      comment: "Visitei com minha escola e foi uma experiência educativa maravilhosa!",
      date: "2025-01-11",
    },
  ]

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee)
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      role: employee.role,
    })
  }

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    setEmployees(
      employees.map((emp) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              name: newEmployee.name,
              email: newEmployee.email,
              role: newEmployee.role,
            }
          : emp,
      ),
    )
    alert(`Funcionário atualizado!\nNome: ${newEmployee.name}\nEmail: ${newEmployee.email}`)
    setNewEmployee({ name: "", email: "", role: "" })
    setEditingEmployee(null)
  }

  const handleDeleteEmployee = (employeeId: number) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) {
      return
    }
    setEmployees(employees.filter((emp) => emp.id !== employeeId))
    alert("Funcionário excluído com sucesso!")
  }

  const handleEditPassword = (employee: any) => {
    setEditingEmployeePassword(employee)
    setNewPassword("")
  }

  const handleSavePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres!")
      return
    }
    alert(`Senha atualizada com sucesso para ${editingEmployeePassword.name}!\nNova senha: ${newPassword}`)
    setEditingEmployeePassword(null)
    setNewPassword("")
  }

  const handleCancelEmployeeEdit = () => {
    setEditingEmployee(null)
    setNewEmployee({ name: "", email: "", role: "" })
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = getSupabase()

    const tempPassword = Math.random().toString(36).slice(-8)

    const { data, error } = await supabase
      .from("employees")
      .insert({
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        password_hash: tempPassword, // Em produção, usar bcrypt
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating employee:", error)
      alert("Erro ao criar funcionário. Verifique se o email já está cadastrado.")
      return
    }

    if (data) {
      setEmployees([
        ...employees,
        {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        },
      ])
      alert(
        `Funcionário criado!\nNome: ${data.name}\nEmail: ${data.email}\nSenha temporária: ${tempPassword}\n\nO funcionário deve alterar a senha no primeiro acesso.`,
      )
      setNewEmployee({ name: "", email: "", role: "" })
    }
  }

  const handleEditPartner = (partner: any) => {
    setEditingPartner(partner)
    setNewPartner({
      name: partner.name,
      type: partner.type,
      contact: partner.contact,
      email: partner.email,
      phone: partner.phone || "",
      address: partner.address || "",
    })
  }

  const handleUpdatePartner = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Updating partner:", editingPartner, "with data:", newPartner)

    setPartners(
      partners.map((p) =>
        p.id === editingPartner.id
          ? {
              ...p,
              name: newPartner.name,
              type: newPartner.type,
              contact: newPartner.contact,
              email: newPartner.email,
            }
          : p,
      ),
    )
    alert(`Parceiro atualizado!\nNome: ${newPartner.name}\nTipo: ${newPartner.type}`)
    setNewPartner({ name: "", type: "", contact: "", email: "", phone: "", address: "" })
    setEditingPartner(null)
  }

  const handleDeletePartner = (partnerId: number) => {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) {
      return
    }
    setPartners(partners.filter((p) => p.id !== partnerId))
    alert("Parceiro excluído com sucesso!")
  }

  const handleCancelPartnerEdit = () => {
    setEditingPartner(null)
    setNewPartner({ name: "", type: "", contact: "", email: "", phone: "", address: "" })
  }

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault()
    const newPartnerData = {
      id: partners.length + 1,
      name: newPartner.name,
      type: newPartner.type,
      contact: newPartner.contact,
      email: newPartner.email,
    }
    setPartners([...partners, newPartnerData])
    alert(`Parceiro cadastrado com sucesso!\nNome: ${newPartner.name}\nTipo: ${newPartner.type}`)
    setNewPartner({ name: "", type: "", contact: "", email: "", phone: "", address: "" })
  }

  const handleExportData = () => {
    const periodText = exportPeriod === "day" ? "Diário" : exportPeriod === "week" ? "Semanal" : "Mensal"
    const formatText = exportFormat.toUpperCase()
    alert(`Exportando dados ${periodText} em formato ${formatText}...\n\nDownload iniciado!`)
  }

  // Function to load tickets (needed for refresh after validation)
  const loadTickets = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false })

    if (data && !error) {
      // Assuming you have a state to store tickets, e.g., setTickets(data)
      // For now, we'll just log it or handle it as needed.
      console.log("Tickets loaded:", data)
    } else {
      console.error("Error loading tickets:", error)
    }
  }

  const handleStartScanner = () => {
    setShowQrScanner(true)
    setScanResult(null)
  }

  // QR scan handler
  const handleQrScan = async (qrCode: string) => {
    try {
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrCode }),
      })

      const result = await response.json()
      setScanResult(result)
      setShowQrScanner(false)

      if (result.valid) {
        await loadTickets()
      }
    } catch (error) {
      console.error("[v0] Error validating ticket:", error)
      setScanResult({
        valid: false,
        error: "Erro ao validar ingresso",
      })
      setShowQrScanner(false)
    }
  }

  useEffect(() => {
    const loadSculptures = async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("sculptures").select("*").order("code", { ascending: true })

      if (data && !error) {
        setSculptures(
          data.map((s) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            description: s.description,
            curiosity: s.curiosity,
          })),
        )
      }
    }

    loadSculptures()
  }, [])

  const handleCreateSculpture = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Creating sculpture with data:", newSculpture)

    const supabase = getSupabase()

    // Get the next code number
    const { data: existingSculptures } = await supabase
      .from("sculptures")
      .select("code")
      .order("code", { ascending: false })
      .limit(1)

    let nextNumber = 1
    if (existingSculptures && existingSculptures.length > 0) {
      const lastCode = existingSculptures[0].code
      const match = lastCode.match(/ESC(\d+)/)
      if (match) {
        nextNumber = Number.parseInt(match[1]) + 1
      }
    }

    const newCode = `ESC${String(nextNumber).padStart(3, "0")}`

    // TODO: Upload image to storage if sculptureImage exists
    const imageUrl = null
    if (sculptureImage) {
      // In a real implementation, upload to Supabase Storage or Vercel Blob
      console.log("[v0] Would upload image:", sculptureImage.name)
    }

    const { data, error } = await supabase
      .from("sculptures")
      .insert({
        code: newCode,
        name: newSculpture.name,
        description: newSculpture.description,
        curiosity: newSculpture.curiosity,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating sculpture:", error)
      alert("Erro ao cadastrar escultura. Tente novamente.")
      return
    }

    if (data) {
      setSculptures([
        ...sculptures,
        {
          id: data.id,
          code: data.code,
          name: data.name,
          description: data.description,
          curiosity: data.curiosity,
        },
      ])
      alert(`Escultura cadastrada!\nCódigo: ${newCode}\nNome: ${newSculpture.name}`)
      setNewSculpture({ name: "", description: "", curiosity: "" })
      setSculptureImage(null) // Reset image state
    }
  }

  const handleEditSculpture = (sculpture: any) => {
    setEditingSculpture(sculpture)
    setNewSculpture({
      name: sculpture.name,
      description: sculpture.description,
      curiosity: sculpture.curiosity,
    })
  }

  const handleUpdateSculpture = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = getSupabase()

    // TODO: Upload image to storage if sculptureImage exists
    const imageUrl = editingSculpture.image_url
    if (sculptureImage) {
      console.log("[v0] Would upload image:", sculptureImage.name)
    }

    const { data, error } = await supabase
      .from("sculptures")
      .update({
        name: newSculpture.name,
        description: newSculpture.description,
        curiosity: newSculpture.curiosity,
        image_url: imageUrl,
      })
      .eq("id", editingSculpture.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating sculpture:", error)
      alert("Erro ao atualizar escultura. Tente novamente.")
      return
    }

    if (data) {
      setSculptures(
        sculptures.map((s) =>
          s.id === data.id
            ? {
                id: data.id,
                code: data.code,
                name: data.name,
                description: data.description,
                curiosity: data.curiosity,
              }
            : s,
        ),
      )
      alert(`Escultura atualizada!\nCódigo: ${data.code}\nNome: ${data.name}`)
      setNewSculpture({ name: "", description: "", curiosity: "" })
      setSculptureImage(null)
      setEditingSculpture(null)
    }
  }

  const handleDeleteSculpture = async (sculptureId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta escultura?")) {
      return
    }

    const supabase = getSupabase()
    const { error } = await supabase.from("sculptures").delete().eq("id", sculptureId)

    if (error) {
      console.error("[v0] Error deleting sculpture:", error)
      alert("Erro ao excluir escultura. Tente novamente.")
      return
    }

    setSculptures(sculptures.filter((s) => s.id !== sculptureId))
    alert("Escultura excluída com sucesso!")
  }

  const handleCancelEdit = () => {
    setEditingSculpture(null)
    setNewSculpture({ name: "", description: "", curiosity: "" })
    setSculptureImage(null)
  }

  const renderPieLabel = (entry: any) => {
    const percent = (entry.percent * 100).toFixed(0)
    return `${entry.name}\n${percent}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="header-navy text-white py-4 md:py-6 px-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 flex items-center gap-1 md:gap-2 h-10 md:h-auto px-2 md:px-4"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Início</span>
              </Button>
            </Link>
            <h1 className="text-lg md:text-2xl font-bold">PAINEL DE CONTROLE DO PARQUE</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Image
              src="/images/recentro-logo.png"
              alt="Recentro"
              width={35}
              height={35}
              className="rounded-lg md:w-[45px] md:h-[45px]"
            />
            <Image
              src="/images/recentro-conecta-logo.png"
              alt="Recentro Conecta"
              width={35}
              height={35}
              className="rounded-lg md:w-[45px] md:h-[45px]"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 h-auto p-2 bg-transparent">
            <TabsTrigger
              value="dashboard"
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-blue-300 bg-white shadow-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#1694f2] data-[state=active]:via-[#1ed5bb] data-[state=active]:to-[#1694f2] data-[state=active]:text-white data-[state=active]:border-[#1694f2] data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-300 hover:shadow-lg hover:scale-102"
            >
              <BarChart3 className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-lg font-bold">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger
              value="employees"
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-pink-300 bg-white shadow-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#e082ca] data-[state=active]:via-[#1ed5bb] data-[state=active]:to-[#e082ca] data-[state=active]:text-white data-[state=active]:border-[#e082ca] data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-300 hover:shadow-lg hover:scale-102"
            >
              <UserCog className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-lg font-bold">Funcionários</span>
            </TabsTrigger>
            <TabsTrigger
              value="partners"
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-green-300 bg-white shadow-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#16A34A] data-[state=active]:via-[#1ed5bb] data-[state=active]:to-[#16A34A] data-[state=active]:text-white data-[state=active]:border-[#16A34A] data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-300 hover:shadow-lg hover:scale-102"
            >
              <Handshake className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-lg font-bold">Parceiros</span>
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-purple-300 bg-white shadow-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#A855F7] data-[state=active]:via-[#1ed5bb] data-[state=active]:to-[#A855F7] data-[state=active]:text-white data-[state=active]:border-[#A855F7] data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-300 hover:shadow-lg hover:scale-102"
            >
              <Database className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-lg font-bold">Dados</span>
            </TabsTrigger>
            <TabsTrigger
              value="scanner"
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-orange-300 bg-white shadow-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#F97316] data-[state=active]:via-[#1ed5bb] data-[state=active]:to-[#F97316] data-[state=active]:text-white data-[state=active]:border-[#F97316] data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-300 hover:shadow-lg hover:scale-102"
            >
              <QrCode className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-lg font-bold">Ler Ingressos</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="modern-card border-l-4 border-l-[#1694f2]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Visitantes Hoje</CardTitle>
                  <Users className="w-5 h-5 text-[#1694f2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#1694f2]">{totalVisitorsToday.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Locais + Turistas</p>
                </CardContent>
              </Card>

              <Card className="modern-card border-l-4 border-l-[#1694f2]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Locais</CardTitle>
                  <MapPin className="w-5 h-5 text-[#1694f2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#1694f2]">{localVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">57% do total</p>
                </CardContent>
              </Card>

              <Card className="modern-card border-l-4 border-l-[#1ed5bb]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Turistas</CardTitle>
                  <Plane className="w-5 h-5 text-[#1ed5bb]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#1ed5bb]">{touristVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">43% do total</p>
                </CardContent>
              </Card>

              <Card className="modern-card border-l-4 border-l-[#16A34A]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Via Escolas</CardTitle>
                  <School className="w-5 h-5 text-[#16A34A]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#16A34A]">2,234</div>
                  <p className="text-xs text-muted-foreground mt-1">24% do total</p>
                </CardContent>
              </Card>

              <Card className="modern-card border-l-4 border-l-[#EAB308]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Satisfação</CardTitle>
                  <Star className="w-5 h-5 text-[#EAB308]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#EAB308]">80%</div>
                  <p className="text-xs text-muted-foreground mt-1">Muito satisfeitos</p>
                </CardContent>
              </Card>
            </div>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-[#06B6D4]" />
                  Esculturas Mais Visitadas
                </CardTitle>
                <CardDescription>Ranking de acessos por escultura</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={sculptureVisits} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="visits" radius={[0, 8, 8, 0]}>
                      {sculptureVisits.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Visitantes por Tipo</CardTitle>
                  <CardDescription>Locais vs Turistas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={visitorsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderPieLabel}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {visitorsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Visitantes por Origem</CardTitle>
                  <CardDescription>Como chegaram ao parque</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={visitorsByOrigin}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderPieLabel}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {visitorsByOrigin.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Tipo de Ingresso</CardTitle>
                  <CardDescription>Individual vs Agendado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={visitorsByTicketType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderPieLabel}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {visitorsByTicketType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Detalhamento Semanal de Visitantes</CardTitle>
                <CardDescription>Visitantes por tipo e origem - Última semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={weeklyDetailedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="local" name="Locais" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="turista" name="Turistas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="escola" name="Escolas" fill="#A855F7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="agencia" name="Agências" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hotel" name="Hotéis" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Visitantes por Dia da Semana</CardTitle>
                  <CardDescription>Últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyVisitors}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Visitantes por Semana</CardTitle>
                  <CardDescription>Último mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyVisitors}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="visitors" stroke="#3B82F6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Visitantes por Mês</CardTitle>
                  <CardDescription>Últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyVisitors}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#A855F7" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Satisfação dos Visitantes</CardTitle>
                  <CardDescription>Avaliações recebidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={satisfactionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderPieLabel}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {satisfactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="modern-card bg-gradient-to-br from-[#1694f2]/10 to-[#1ed5bb]/10 border-2 border-[#1694f2]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#1694f2]" />
                    Insight 1: Perfil dos Visitantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    <span className="font-bold text-[#1694f2]">57% dos visitantes são locais</span>, enquanto{" "}
                    <span className="font-bold text-[#1ed5bb]">43% são turistas</span>. As escolas representam{" "}
                    <span className="font-bold text-[#16A34A]">24% do total</span>, mostrando forte engajamento
                    educacional. Finais de semana atraem mais turistas.
                  </p>
                </CardContent>
              </Card>

              <Card className="modern-card bg-gradient-to-br from-[#e082ca]/10 to-[#1ed5bb]/10 border-2 border-[#e082ca]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#e082ca]" />
                    Insight 2: Parcerias Estratégicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    Visitas agendadas representam{" "}
                    <span className="font-bold text-[#EAB308]">32% do total de visitantes</span>. Parcerias com hotéis e
                    agências trazem <span className="font-bold text-[#e082ca]">2.766 visitantes</span>, demonstrando a
                    importância das relações institucionais.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Feedbacks Section */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[#1694f2]" />
                  Feedbacks dos Visitantes
                </CardTitle>
                <CardDescription>Últimas avaliações recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{feedback.name}</h4>
                          <p className="text-sm text-muted-foreground">{feedback.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(feedback.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#EAB308] text-[#EAB308]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-blue-200">
                  <p className="text-center text-lg font-semibold text-[#1694f2]">
                    Total de Feedbacks: {feedbacks.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-[#1694f2]" />
                  <span className="text-2xl font-bold">
                    {editingEmployee ? "Editar Funcionário" : "Cadastrar Novo Funcionário"}
                  </span>
                </CardTitle>
                <CardDescription>
                  {editingEmployee
                    ? "Atualize os dados do funcionário"
                    : "Preencha os dados para criar um novo funcionário e gerar uma senha"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        placeholder="Digite o nome completo"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo</Label>
                    <Select
                      value={newEmployee.role}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="guide">Guia Turístico</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-[#1694f2] hover:bg-[#1694f2]/90 text-white text-lg modern-button"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      {editingEmployee ? "Atualizar Funcionário" : "Criar Funcionário e Gerar Senha"}
                    </Button>
                    {editingEmployee && (
                      <Button
                        type="button"
                        onClick={handleCancelEmployeeEdit}
                        variant="outline"
                        className="h-12 px-6 text-lg bg-transparent"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#1694f2]" />
                  <span className="text-2xl font-bold">Funcionários Cadastrados</span>
                </CardTitle>
                <CardDescription>
                  Lista de todos os funcionários do parque • Total: {employees.length} funcionários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {employee.email} • {employee.role}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditEmployee(employee)}
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleEditPassword(employee)}
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-purple-50 text-purple-600 hover:text-purple-700"
                          >
                            🔒 Senha
                          </Button>
                          <Button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status do Parque */}
            <Card className="modern-card border-2 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  Status do Parque
                </CardTitle>
                <CardDescription>Controle o status de abertura do parque</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center gap-4">
                    <Image
                      src={parkOpen ? "/images/brennand-happy.png" : "/images/brennand-sad.png"}
                      alt={parkOpen ? "Brennand de braços abertos" : "Brennand triste"}
                      width={100}
                      height={100}
                      className="rounded-lg"
                    />
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {parkOpen ? (
                          <span className="text-emerald-600">ABERTO</span>
                        ) : (
                          <span className="text-red-600">TEMPORARIAMENTE FECHADO</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {parkOpen ? "O parque está aberto para visitação" : "O parque está temporariamente fechado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label htmlFor="park-status" className="text-base font-semibold">
                      {parkOpen ? "Fechar Parque" : "Abrir Parque"}
                    </Label>
                    <Switch
                      id="park-status"
                      checked={parkOpen}
                      onCheckedChange={setParkOpen}
                      className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500"
                    />
                  </div>
                </div>

                {!parkOpen && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <p className="text-red-800 font-semibold">
                      ⚠️ Atenção: Esta mensagem será exibida na página principal para todos os visitantes.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSaveParkStatus}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg font-semibold"
                >
                  <Image src="/images/icone-salvar.png" alt="Salvar" width={24} height={24} className="mr-2" />
                  Salvar Status do Parque
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#1694f2]" />
                  <span className="text-2xl font-bold">
                    {editingPartner ? "Editar Parceiro" : "Cadastrar Novo Parceiro"}
                  </span>
                </CardTitle>
                <CardDescription>
                  {editingPartner
                    ? "Atualize os dados do parceiro"
                    : "Cadastre escolas, hotéis, agências de turismo e empresas parceiras do parque"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingPartner ? handleUpdatePartner : handleCreatePartner} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partner-name">Nome do Parceiro</Label>
                      <Input
                        id="partner-name"
                        placeholder="Ex: Colégio Santa Maria"
                        value={newPartner.name}
                        onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner-type">Tipo de Parceiro</Label>
                      <Select
                        value={newPartner.type}
                        onValueChange={(value) => setNewPartner({ ...newPartner, type: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Escola">
                            <div className="flex items-center gap-2">
                              <School className="w-4 h-4" />
                              Escola
                            </div>
                          </SelectItem>
                          <SelectItem value="Hotel">
                            <div className="flex items-center gap-2">
                              <Hotel className="w-4 h-4" />
                              Hotel
                            </div>
                          </SelectItem>
                          <SelectItem value="Agência">
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4" />
                              Agência de Turismo
                            </div>
                          </SelectItem>
                          <SelectItem value="Empresa">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              Empresa (Eventos)
                            </div>
                          </SelectItem>
                          <SelectItem value="ONG">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              ONG
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partner-contact">Nome do Contato</Label>
                      <Input
                        id="partner-contact"
                        placeholder="Nome da pessoa responsável"
                        value={newPartner.contact}
                        onChange={(e) => setNewPartner({ ...newPartner, contact: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner-email">Email</Label>
                      <Input
                        id="partner-email"
                        type="email"
                        placeholder="contato@parceiro.com.br"
                        value={newPartner.email}
                        onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partner-phone">Telefone</Label>
                      <Input
                        id="partner-phone"
                        placeholder="(81) 99999-9999"
                        value={newPartner.phone}
                        onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partner-address">Endereço</Label>
                      <Input
                        id="partner-address"
                        placeholder="Rua, número, bairro"
                        value={newPartner.address}
                        onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-[#1694f2] hover:bg-[#1694f2]/90 text-white text-lg modern-button"
                    >
                      <Building2 className="w-5 h-5 mr-2" />
                      {editingPartner ? "Atualizar Parceiro" : "Cadastrar Parceiro"}
                    </Button>
                    {editingPartner && (
                      <Button
                        type="button"
                        onClick={handleCancelPartnerEdit}
                        variant="outline"
                        className="h-12 px-6 text-lg bg-transparent"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#1694f2]" />
                  <span className="text-2xl font-bold">Parceiros Cadastrados</span>
                </CardTitle>
                <CardDescription>
                  Lista de todos os parceiros do parque • Total: {partners.length} parceiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners.map((partner) => (
                    <div
                      key={partner.id}
                      className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-[#1694f2] flex items-center justify-center text-white">
                            {partner.type === "Escola" && <School className="w-6 h-6" />}
                            {partner.type === "Hotel" && <Hotel className="w-6 h-6" />}
                            {partner.type === "Agência" && <Plane className="w-6 h-6" />}
                            {partner.type === "Empresa" && <Briefcase className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{partner.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {partner.type} • Contato: {partner.contact}
                            </p>
                            <p className="text-sm text-muted-foreground">{partner.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditPartner(partner)}
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeletePartner(partner.id)}
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-6 h-6 text-[#A855F7]" />
                  <span className="text-2xl font-bold">Exportar Dados</span>
                </CardTitle>
                <CardDescription>Escolha o período e formato para exportar os dados do parque</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="export-period">Período</Label>
                    <Select value={exportPeriod} onValueChange={setExportPeriod}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Por Dia</SelectItem>
                        <SelectItem value="week">Por Semana</SelectItem>
                        <SelectItem value="month">Por Mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="export-format">Formato</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">XLSX (Excel)</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleExportData}
                  className="w-full h-14 bg-gradient-to-r from-[#A855F7] to-[#1ed5bb] hover:from-[#A855F7]/90 hover:to-[#1ed5bb]/90 text-white text-lg font-semibold"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exportar Dados
                </Button>
              </CardContent>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-6 h-6 text-[#A855F7]" />
                  <span className="text-2xl font-bold">
                    {editingSculpture ? "Editar Escultura" : "Cadastrar Escultura"}
                  </span>
                </CardTitle>
                <CardDescription>
                  {editingSculpture
                    ? "Atualize as informações da escultura"
                    : "Adicione novas esculturas ao catálogo do parque"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingSculpture ? handleUpdateSculpture : handleCreateSculpture} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sculpture-name">Nome da Escultura</Label>
                    <Input
                      id="sculpture-name"
                      placeholder="Ex: Coluna de Cristal"
                      value={newSculpture.name}
                      onChange={(e) => setNewSculpture({ ...newSculpture, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sculpture-description">Descrição</Label>
                    <Textarea
                      id="sculpture-description"
                      placeholder="Descreva a escultura..."
                      value={newSculpture.description}
                      onChange={(e) => setNewSculpture({ ...newSculpture, description: e.target.value })}
                      required
                      className="min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sculpture-curiosity">Curiosidade</Label>
                    <Textarea
                      id="sculpture-curiosity"
                      placeholder="Adicione uma curiosidade sobre a escultura..."
                      value={newSculpture.curiosity}
                      onChange={(e) => setNewSculpture({ ...newSculpture, curiosity: e.target.value })}
                      required
                      className="min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sculpture-image">Imagem da Escultura</Label>
                    <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 bg-purple-50/50">
                      <Input
                        id="sculpture-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSculptureImage(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Label
                        htmlFor="sculpture-image"
                        className="flex items-center justify-center h-12 px-4 border-2 border-purple-500 bg-white text-purple-700 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors font-semibold"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        {sculptureImage ? sculptureImage.name : "Upload da Imagem"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 h-12 bg-[#A855F7] hover:bg-[#A855F7]/90 text-white text-lg">
                      {editingSculpture ? (
                        <>
                          <Edit2 className="w-5 h-5 mr-2" />
                          Atualizar Escultura
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          Cadastrar Escultura
                        </>
                      )}
                    </Button>
                    {editingSculpture && (
                      <Button
                        type="button"
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="h-12 px-6 text-lg bg-transparent"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-[#A855F7]" />
                  <span className="text-2xl font-bold">Esculturas Cadastradas</span>
                </CardTitle>
                <CardDescription>Total: {sculptures.length} esculturas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sculptures.map((sculpture) => (
                    <div
                      key={sculpture.id}
                      className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono bg-purple-200 text-purple-800 px-2 py-1 rounded">
                              {sculpture.code}
                            </span>
                            <h4 className="font-semibold text-lg">{sculpture.name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{sculpture.description}</p>
                          <p className="text-sm text-purple-700 italic">{sculpture.curiosity}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditSculpture(sculpture)}
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteSculpture(sculpture.id)}
                            variant="outline"
                            size="sm"
                            className="bg-transparent hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-[#F97316]" />
                  Leitura de Ingressos
                </CardTitle>
                <CardDescription>Escaneie o QR code dos ingressos para validar a entrada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!scannerActive && !lastScannedTicket && !showQrScanner && (
                  <div className="text-center py-12">
                    <div className="w-32 h-32 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                      <Camera className="w-16 h-16 text-[#F97316]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pronto para Escanear</h3>
                    <p className="text-muted-foreground mb-6">
                      Clique no botão abaixo para ativar a câmera e ler o QR code do ingresso
                    </p>
                    <Button
                      onClick={handleStartScanner}
                      className="h-14 px-8 bg-gradient-to-r from-[#F97316] to-[#1ed5bb] hover:from-[#F97316]/90 hover:to-[#1ed5bb]/90 text-white text-lg font-semibold"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Ativar Câmera
                    </Button>
                  </div>
                )}

                {scannerActive && (
                  <div className="text-center py-12">
                    <div className="w-64 h-64 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-cyan-100 rounded-2xl flex items-center justify-center border-4 border-dashed border-[#F97316] animate-pulse">
                      <QrCode className="w-32 h-32 text-[#F97316]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Escaneando...</h3>
                    <p className="text-muted-foreground">Aponte a câmera para o QR code do ingresso</p>
                  </div>
                )}

                {lastScannedTicket && !scannerActive && (
                  <div className="space-y-4">
                    <div
                      className={`p-6 rounded-lg border-2 ${
                        lastScannedTicket.valid ? "bg-emerald-50 border-emerald-500" : "bg-red-50 border-red-500"
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            lastScannedTicket.valid ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        >
                          {lastScannedTicket.valid ? (
                            <span className="text-4xl text-white">✓</span>
                          ) : (
                            <span className="text-4xl text-white">✗</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            {lastScannedTicket.valid ? "Ingresso Válido" : "Ingresso Inválido"}
                          </h3>
                          <p className="text-muted-foreground">
                            {lastScannedTicket.valid ? "Entrada autorizada" : "Entrada negada"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 bg-white/50 p-4 rounded-lg">
                        <p className="text-base">
                          <strong>Tipo:</strong>{" "}
                          {lastScannedTicket.type === "individual" ? "Individual" : "Agendamento"}
                        </p>
                        <p className="text-base">
                          <strong>Nome:</strong> {lastScannedTicket.name}
                        </p>
                        <p className="text-base">
                          <strong>Data:</strong> {lastScannedTicket.date}
                        </p>
                        {lastScannedTicket.alreadyUsed && (
                          <p className="text-yellow-800 font-semibold">Este ingresso já foi utilizado.</p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setLastScannedTicket(null)
                        handleStartScanner()
                      }}
                      className="w-full h-14 bg-gradient-to-r from-[#F97316] to-[#1ed5bb] hover:from-[#F97316]/90 hover:to-[#1ed5bb]/90 text-white text-lg font-semibold"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Escanear Próximo Ingresso
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-[#F97316]" />
                  <span className="text-2xl font-bold">Últimos Agendamentos</span>
                </CardTitle>
                <CardDescription>Lista dos 5 agendamentos mais recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum agendamento registrado ainda</p>
                  ) : (
                    bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{booking.organization || "Sem organização"}</h4>
                            <p className="text-sm text-muted-foreground">
                              Data: {new Date(booking.visit_date).toLocaleDateString("pt-BR")} • Horário:{" "}
                              {booking.visit_time} • Pessoas: {booking.number_of_people}
                            </p>
                            <p className="text-sm text-muted-foreground">Responsável: {booking.responsible_name}</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-transparent hover:bg-orange-50">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showQrScanner && <QrScanner onScan={handleQrScan} onClose={() => setShowQrScanner(false)} />}

      {scanResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className={scanResult.valid ? "text-emerald-600" : "text-red-600"}>
                {scanResult.valid ? "✓ Ingresso Válido" : "✗ Ingresso Inválido"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{scanResult.message || scanResult.error}</p>

              {scanResult.ticket && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                  <p>
                    <strong>Nome:</strong> {scanResult.ticket.visitor_name}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {scanResult.ticket.ticket_type}
                  </p>
                  <p>
                    <strong>Data:</strong> {new Date(scanResult.ticket.visit_date).toLocaleDateString("pt-BR")}
                  </p>
                  {scanResult.validated_at && (
                    <p className="text-red-600">
                      <strong>Validado em:</strong> {new Date(scanResult.validated_at).toLocaleString("pt-BR")}
                    </p>
                  )}
                </div>
              )}

              <Button onClick={() => setScanResult(null)} className="w-full">
                Fechar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {editingEmployeePassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🔒 Editar Senha</CardTitle>
              <CardDescription>Alterar senha do funcionário: {editingEmployeePassword.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="text"
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSavePassword} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                  Salvar Senha
                </Button>
                <Button
                  onClick={() => {
                    setEditingEmployeePassword(null)
                    setNewPassword("")
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalhes do Agendamento</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(null)
                    setEditingBooking(null)
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <p>
                  <strong>Organização:</strong> {selectedBooking.organization || "Não informado"}
                </p>
                <p>
                  <strong>Responsável:</strong> {selectedBooking.responsible_name}
                </p>
                <p>
                  <strong>E-mail:</strong> {selectedBooking.responsible_email}
                </p>
                <p>
                  <strong>Telefone:</strong> {selectedBooking.responsible_phone}
                </p>
                <p>
                  <strong>Data:</strong> {new Date(selectedBooking.visit_date).toLocaleDateString("pt-BR")}
                </p>
                <p>
                  <strong>Horário:</strong> {selectedBooking.visit_time}
                </p>
                <p>
                  <strong>Total de Pessoas:</strong> {selectedBooking.number_of_people}
                </p>
                <p>
                  <strong>ID:</strong> {selectedBooking.booking_number}
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">Lista de Visitantes</h4>
                  {!editingBooking && (
                    <Button
                      onClick={() => setEditingBooking({ ...selectedBooking })}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>

                {editingBooking ? (
                  <div className="space-y-4">
                    {editingBooking.visitors?.map((visitor: any, index: number) => (
                      <div key={index} className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-slate-700">Visitante {index + 1}</span>
                          {editingBooking.visitors.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newVisitors = editingBooking.visitors.filter((_: any, i: number) => i !== index)
                                setEditingBooking({
                                  ...editingBooking,
                                  visitors: newVisitors,
                                  number_of_people: newVisitors.length,
                                })
                              }}
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
                              onChange={(e) => {
                                const newVisitors = [...editingBooking.visitors]
                                newVisitors[index].name = e.target.value
                                setEditingBooking({ ...editingBooking, visitors: newVisitors })
                              }}
                              className="mt-1 h-10 text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">Idade</Label>
                            <Input
                              type="number"
                              value={visitor.age}
                              onChange={(e) => {
                                const newVisitors = [...editingBooking.visitors]
                                newVisitors[index].age = e.target.value
                                setEditingBooking({ ...editingBooking, visitors: newVisitors })
                              }}
                              className="mt-1 h-10 text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">CPF ou RG</Label>
                            <Input
                              value={visitor.cpf_rg}
                              onChange={(e) => {
                                const newVisitors = [...editingBooking.visitors]
                                newVisitors[index].cpf_rg = e.target.value
                                setEditingBooking({ ...editingBooking, visitors: newVisitors })
                              }}
                              className="mt-1 h-10 text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-600">Contato</Label>
                            <Input
                              value={visitor.contact}
                              onChange={(e) => {
                                const newVisitors = [...editingBooking.visitors]
                                newVisitors[index].contact = e.target.value
                                setEditingBooking({ ...editingBooking, visitors: newVisitors })
                              }}
                              className="mt-1 h-10 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      onClick={() => {
                        const newVisitor = { id: Date.now().toString(), name: "", age: "", cpf_rg: "", contact: "" }
                        setEditingBooking({
                          ...editingBooking,
                          visitors: [...editingBooking.visitors, newVisitor],
                          number_of_people: editingBooking.visitors.length + 1,
                        })
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Visitante
                    </Button>

                    <div className="flex gap-3">
                      <Button
                        onClick={async () => {
                          const supabase = getSupabase()
                          const { error } = await supabase
                            .from("bookings")
                            .update({
                              visitors: editingBooking.visitors,
                              number_of_people: editingBooking.visitors.length,
                            })
                            .eq("id", editingBooking.id)

                          if (error) {
                            console.error("[v0] Error updating booking:", error)
                            alert("Erro ao atualizar agendamento")
                            return
                          }

                          alert("Agendamento atualizado com sucesso!")
                          setSelectedBooking(editingBooking)
                          setEditingBooking(null)

                          // Reload bookings
                          const { data } = await supabase
                            .from("bookings")
                            .select("*")
                            .order("created_at", { ascending: false })
                            .limit(5)

                          if (data) {
                            setBookings(data)
                          }
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Salvar Alterações
                      </Button>
                      <Button onClick={() => setEditingBooking(null)} variant="outline">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedBooking.visitors?.map((visitor: any, index: number) => (
                      <div key={index} className="p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="font-semibold">
                          {index + 1}. {visitor.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {visitor.age} anos • {visitor.cpf_rg} • {visitor.contact}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
