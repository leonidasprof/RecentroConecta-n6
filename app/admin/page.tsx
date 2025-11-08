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
  Trash2,
  Calendar,
  X,
  Pencil,
  Package,
  Loader2,
  Save,
  CheckCircle2,
  Upload,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getSupabase } from "@/lib/supabase"
import QrScanner from "@/components/qr-scanner" // Imported QrScanner

// Added helper function for partner icons
const getPartnerIcon = (organization: string) => {
  const org = organization?.toLowerCase() || ""
  if (org.includes("escola") || org.includes("school")) return <School className="w-6 h-6" />
  if (org.includes("hotel")) return <Hotel className="w-6 h-6" />
  if (org.includes("agência") || org.includes("agency")) return <Plane className="w-6 h-6" />
  if (org.includes("empresa") || org.includes("company")) return <Briefcase className="w-6 h-6" />
  if (org.includes("ong")) return <Users className="w-6 h-6" />
  // Default icon for other types
  return <Building2 className="w-6 h-6" />
}

const generateQRCodeUrl = (sculptureId: string) => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const sculptureUrl = `${baseUrl}/escultura/${sculptureId}`
  // Using a QR code generator API
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(sculptureUrl)}`
}

const handlePrintQRCode = (sculpture: any) => {
  const qrCodeUrl = generateQRCodeUrl(sculpture.id)
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${sculpture.name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #A855F7;
              padding: 30px;
              border-radius: 10px;
              background: white;
            }
            h1 {
              color: #A855F7;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .code {
              color: #666;
              font-family: monospace;
              font-size: 18px;
              margin-bottom: 20px;
            }
            img {
              display: block;
              margin: 0 auto;
            }
            p {
              margin-top: 20px;
              color: #666;
              font-size: 14px;
            }
            @media print {
              body {
                background: white;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${sculpture.name}</h1>
            <p class="code">Código: ESC${String(sculpture.code).padStart(3, "0")}</p>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p>Escaneie para ver detalhes da escultura</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }
}

export default function AdminDashboard() {
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", role: "" })
  const [employees, setEmployees] = useState<any[]>([])
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [editingEmployeePassword, setEditingEmployeePassword] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")

  const [newPartner, setNewPartner] = useState({
    name: "",
    type: "", // This will map to 'organization' in the backend
    contact: "",
    email: "",
    phone: "",
    address: "",
  })
  const [editingPartner, setEditingPartner] = useState<any>(null)

  const [partners, setPartners] = useState<any[]>([])

  const [exportPeriod, setExportPeriod] = useState("day")
  const [exportFormat, setExportFormat] = useState("csv")

  const [scannerActive, setScannerActive] = useState(false)
  const [lastScannedTicket, setLastScannedTicket] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null) // Added for potential video stream in future

  const [parkOpen, setParkOpen] = useState(true)

  // Added states for QR Scanner integration
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  const [newSculpture, setNewSculpture] = useState({
    name: "",
    description: "",
    curiosity: "",
    imageUrl: "",
  })
  const [editingSculpture, setEditingSculpture] = useState<any>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [bookings, setBookings] = useState<any[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [editingBooking, setEditingBooking] = useState<any>(null)

  const [loggedEmployee, setLoggedEmployee] = useState<any>(null)
  const [greeting, setGreeting] = useState("")

  const [feedbacks, setFeedbacks] = useState<any[]>([])

  const [showCreateSculpture, setShowCreateSculpture] = useState(false)

  useEffect(() => {
    const employeeData = localStorage.getItem("employee")
    if (employeeData) {
      const employee = JSON.parse(employeeData)
      setLoggedEmployee(employee)

      // Determine greeting based on time
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        setGreeting(`Bom dia, ${employee.name}!`)
      } else if (hour >= 12 && hour < 18) {
        setGreeting(`Boa tarde, ${employee.name}!`)
      } else {
        setGreeting(`Boa noite, ${employee.name}!`)
      }
    }

    loadFeedbacks()
  }, [])

  // Define loadEmployees here to fix undeclared variable error
  const loadEmployees = async () => {
    try {
      const response = await fetch("/api/employees/list")
      const result = await response.json()

      if (result.success) {
        console.log("[v0] Loaded employees:", result.data)
        setEmployees(result.data)
      }
    } catch (error) {
      console.error("[v0] Error loading employees:", error)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

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

  const loadFeedbacks = async () => {
    try {
      const response = await fetch("/api/feedbacks/list")
      const result = await response.json()

      if (result.success) {
        console.log("[v0] Loaded feedbacks:", result.data)
        // Map database fields to component format
        // Note: satisfaction_ratings table doesn't have visitor_name column
        const formattedFeedbacks = result.data.map((feedback: any) => ({
          id: feedback.id,
          name: "Visitante", // Default name since we don't have visitor_name in the table
          rating: feedback.rating,
          comment: feedback.comment || "Sem comentário",
          date: new Date(feedback.created_at).toLocaleDateString("pt-BR"),
        }))
        setFeedbacks(formattedFeedbacks)
      } else {
        console.error("[v0] Error loading feedbacks:", result.error)
      }
    } catch (error) {
      console.error("[v0] Error loading feedbacks:", error)
    }
  }

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

  const [sculptureImage, setSculptureImage] = useState<File | null>(null) // Added for image upload

  const [sculptures, setSculptures] = useState<any[]>([])

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

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) {
      return
    }

    try {
      const response = await fetch("/api/employees/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete employee")
      }

      // Remove from local state
      setEmployees(employees.filter((emp) => emp.id !== employeeId))
      alert("Funcionário excluído com sucesso!")
    } catch (error: any) {
      console.error("[v0] Error deleting employee:", error)
      alert(`Erro ao excluir funcionário: ${error.message}`)
    }
  }

  const handleEditPassword = async (employee: any) => {
    setEditingEmployeePassword(employee)
    setNewPassword("")
  }

  const handleCancelEmployeeEdit = () => {
    setEditingEmployee(null)
    setNewEmployee({ name: "", email: "", role: "" })
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Creating employee:", newEmployee)

    if (!newEmployee.name || !newEmployee.email || !newEmployee.role) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    try {
      const response = await fetch("/api/employees/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("[v0] Error creating employee:", result.error)
        alert(result.error || "Erro ao criar funcionário")
        return
      }

      console.log("[v0] Employee created successfully:", result)

      const employeesResponse = await fetch("/api/employees/list")
      const employeesResult = await employeesResponse.json()

      if (employeesResult.success) {
        setEmployees(employeesResult.data)
      }

      alert(
        `Funcionário criado com sucesso!\n\nNome: ${result.employee.name}\nEmail: ${result.employee.email}\nSenha temporária: ${result.tempPassword}\n\nO funcionário pode usar esta senha para fazer login.`,
      )

      setNewEmployee({ name: "", email: "", role: "" })
    } catch (error) {
      console.error("[v0] Error creating employee:", error)
      alert("Erro ao criar funcionário. Tente novamente.")
    }
  }

  const handleEditPartner = (partner: any) => {
    setEditingPartner(partner)
    setNewPartner({
      name: partner.name,
      type: partner.organization || "", // Use organization directly
      contact: partner.contact || "",
      email: partner.email || "",
      phone: partner.phone || "",
      address: partner.address || "",
    })
  }

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Updating partner:", editingPartner, "with data:", newPartner)

    try {
      const organizationValue = newPartner.type || editingPartner.organization

      if (!organizationValue) {
        alert("Por favor, preencha o tipo/organização do parceiro")
        return
      }

      const response = await fetch("/api/partners/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPartner.id,
          name: newPartner.name,
          organization: organizationValue,
          phone: newPartner.phone,
          email: newPartner.email,
          // Address is not currently being updated in the backend, but can be added if needed
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao atualizar parceiro")
      }

      const data = await response.json()
      console.log("[v0] Partner updated:", data)

      // Reload partners list
      await loadPartners()

      alert(`Parceiro atualizado!\nNome: ${newPartner.name}\nOrganização: ${organizationValue}`)
      setNewPartner({ name: "", type: "", contact: "", email: "", phone: "", address: "" })
      setEditingPartner(null)
    } catch (error: any) {
      console.error("[v0] Error updating partner:", error)
      alert("Erro ao atualizar parceiro: " + error.message)
    }
  }

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) {
      return
    }

    try {
      const response = await fetch(`/api/partners/delete?id=${partnerId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao excluir parceiro")
      }

      // Reload partners list
      await loadPartners()

      alert("Parceiro excluído com sucesso!")
    } catch (error: any) {
      console.error("[v0] Error deleting partner:", error)
      alert("Erro ao excluir parceiro: " + error.message)
    }
  }

  const handleCancelPartnerEdit = () => {
    setEditingPartner(null)
    setNewPartner({ name: "", type: "", contact: "", email: "", phone: "", address: "" })
  }

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/partners/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPartner.name,
          organization: newPartner.type, // Use 'organization' field for type
          phone: newPartner.phone,
          email: newPartner.email,
          // Address is not currently being saved in the backend, but can be added if needed
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao cadastrar parceiro")
      }

      const data = await response.json()
      console.log("[v0] Partner created:", data)

      // Reload partners list
      await loadPartners()

      alert(`Parceiro cadastrado com sucesso!\nNome: ${newPartner.name}\nOrganização: ${newPartner.type}`)
      setNewPartner({ name: "", type: "", contact: "", email: "", phone: "", address: "" })
    } catch (error: any) {
      console.error("[v0] Error creating partner:", error)
      alert("Erro ao cadastrar parceiro: " + error.message)
    }
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
    setScannerActive(true) // Start scanner animation/feedback immediately
  }

  // QR scan handler
  const handleQrScan = async (qrCode: string) => {
    console.log("[v0] QR Code scanned:", qrCode)

    try {
      setShowQrScanner(false) // Hide the scanner UI (webcam view)
      setScannerActive(true) // Keep animation/feedback active while processing

      // Check if it's a ticket or booking
      const supabase = getSupabase()

      // Try to find in tickets table
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", qrCode)
        .single()

      if (ticketData && !ticketError) {
        // Found a ticket
        const isValid = !ticketData.validated_at
        const ticketDate = new Date(ticketData.created_at).toLocaleDateString("pt-BR")

        if (isValid) {
          // Mark as validated
          await supabase.from("tickets").update({ validated_at: new Date().toISOString() }).eq("id", qrCode)
        }

        setLastScannedTicket({
          valid: isValid,
          type: "individual",
          name: ticketData.visitor_name || "Visitante",
          date: ticketDate,
          alreadyUsed: !isValid,
        })
        setScannerActive(false)
        return
      }

      // Try to find in bookings table
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", qrCode)
        .single()

      if (bookingData && !bookingError) {
        // Found a booking
        const isValid = !bookingData.validated_at
        const bookingDate = new Date(bookingData.visit_date).toLocaleDateString("pt-BR")

        if (isValid) {
          // Mark as validated
          await supabase.from("bookings").update({ validated_at: new Date().toISOString() }).eq("id", qrCode)
        }

        setLastScannedTicket({
          valid: isValid,
          type: "agendamento",
          name: bookingData.organization_name || "Organização",
          date: bookingDate,
          alreadyUsed: !isValid,
        })
        setScannerActive(false)
        return
      }

      // Not found in either table
      setLastScannedTicket({
        valid: false,
        type: "unknown", // Indicate it wasn't found in known types
        name: "Ingresso/Agendamento não encontrado",
        date: new Date().toLocaleDateString("pt-BR"),
        alreadyUsed: false,
      })
      setScannerActive(false)
    } catch (error) {
      console.error("[v0] Error validating QR code:", error)
      setLastScannedTicket({
        valid: false,
        type: "error", // Indicate a processing error
        name: "Erro na validação",
        date: new Date().toLocaleDateString("pt-BR"),
        alreadyUsed: false,
      })
      setScannerActive(false)
    }
  }

  const loadSculptures = async () => {
    try {
      const response = await fetch("/api/sculptures/list")
      const result = await response.json()

      if (result.success) {
        console.log("[v0] Loaded sculptures:", result.data)
        setSculptures(result.data)
      } else {
        console.error("[v0] Error loading sculptures:", result.error)
      }
    } catch (error) {
      console.error("[v0] Error loading sculptures:", error)
    }
  }

  useEffect(() => {
    loadSculptures()
  }, [])

  const handleImageUpload = async (file: File): Promise<string> => {
    console.log("[v0] Starting upload for file:", file.name, "Size:", file.size, "bytes")

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Arquivo muito grande. Tamanho máximo: 10MB")
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Arquivo deve ser uma imagem (JPG, PNG, etc.)")
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      console.log("[v0] Sending POST request to /api/upload...")
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Upload failed with status:", response.status, "Error:", errorText)
        throw new Error(`Falha no upload (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] Upload successful! URL:", data.url)

      if (!data.url || typeof data.url !== "string") {
        throw new Error("URL inválida retornada pelo servidor")
      }

      return data.url
    } catch (error) {
      console.error("[v0] Upload error:", error)
      throw error
    }
  }

  const handleCreateSculpture = async () => {
    try {
      console.log("[v0] handleCreateSculpture called. imageFile:", imageFile?.name)

      if (!newSculpture.name.trim()) {
        alert("Por favor, preencha o nome da escultura")
        return
      }

      setUploadingImage(true)
      let imageUrl = newSculpture.imageUrl

      if (imageFile) {
        try {
          console.log("[v0] Uploading image file:", imageFile.name)
          imageUrl = await handleImageUpload(imageFile)
          console.log("[v0] Image uploaded successfully:", imageUrl)
        } catch (error) {
          console.error("[v0] Error uploading image:", error)
          alert("Erro ao fazer upload da imagem. A escultura será criada sem imagem.")
        }
      } else {
        console.log("[v0] No image file selected")
      }

      console.log("[v0] Creating sculpture with image_url:", imageUrl)

      const response = await fetch("/api/sculptures/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSculpture.name,
          description: newSculpture.description,
          curiosity: newSculpture.curiosity,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar escultura")
      }

      const data = await response.json()
      console.log("[v0] Sculpture created:", data)

      // Reload sculptures from database
      await loadSculptures()

      // Reset form
      setNewSculpture({ name: "", description: "", curiosity: "", imageUrl: "" })
      setImageFile(null)
      setImagePreview(null)
      setShowCreateSculpture(false)
    } catch (error: any) {
      console.error("[v0] Error creating sculpture:", error.message)
      alert(`Erro ao criar escultura: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEditSculpture = (sculpture: any) => {
    console.log("[v0] Edit sculpture button clicked:", sculpture.name)
    setEditingSculpture(sculpture)
    setNewSculpture({
      name: sculpture.name,
      description: sculpture.description,
      curiosity: sculpture.curiosity,
      imageUrl: sculpture.image_url,
    })
    setImageFile(null)
    setImagePreview(sculpture.image_url && !sculpture.image_url.includes("placeholder") ? sculpture.image_url : null)
  }

  const handleUpdateSculpture = async () => {
    try {
      console.log("[v0] handleUpdateSculpture called. imageFile:", imageFile?.name)

      if (!editingSculpture || !newSculpture.name.trim()) {
        alert("Nome é obrigatório")
        return
      }

      setUploadingImage(true)
      let imageUrl = editingSculpture.image_url

      if (imageFile) {
        try {
          console.log("[v0] Uploading new image for sculpture:", imageFile.name)
          imageUrl = await handleImageUpload(imageFile)
          console.log("[v0] New image uploaded successfully:", imageUrl)
        } catch (error) {
          console.error("[v0] Error uploading image:", error)
          alert("Erro ao fazer upload da nova imagem. As outras alterações serão salvas.")
        }
      } else {
        console.log("[v0] No new image selected, keeping existing:", imageUrl)
      }

      console.log("[v0] Updating sculpture with image_url:", imageUrl)

      const response = await fetch("/api/sculptures/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSculpture.id,
          name: newSculpture.name,
          description: newSculpture.description,
          curiosity: newSculpture.curiosity,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao atualizar escultura")
      }

      const data = await response.json()
      console.log("[v0] Sculpture updated:", data)

      // Reload sculptures from database
      await loadSculptures()

      // Reset form
      setEditingSculpture(null)
      setNewSculpture({ name: "", description: "", curiosity: "", imageUrl: "" })
      setImageFile(null)
      setImagePreview(null)
    } catch (error: any) {
      console.error("[v0] Error updating sculpture:", error.message)
      alert(`Erro ao atualizar escultura: ${error.message}`)
    } finally {
      setUploadingImage(false)
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
    setNewSculpture({ name: "", description: "", curiosity: "", imageUrl: "" }) // Resetting newSculpture as well
    setImageFile(null) // Clear image file when cancelling edit
    setImagePreview(null) // Clear preview when cancelling edit
  }

  const renderPieLabel = (entry: any) => {
    const percent = (entry.percent * 100).toFixed(0)
    return `${entry.name}\n${percent}%`
  }

  // Function to save password - implemented below to fix undeclared variable error
  const handleSavePassword = async () => {
    if (!editingEmployeePassword || !newPassword) {
      alert("Selecione um funcionário e digite uma nova senha.")
      return
    }

    if (newPassword.length < 6) {
      alert("A nova senha deve ter no mínimo 6 caracteres.")
      return
    }

    try {
      const response = await fetch("/api/employees/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: editingEmployeePassword.id,
          newPassword: newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("[v0] Error updating password:", result.error)
        alert(result.error || "Erro ao atualizar senha")
        return
      }

      console.log("[v0] Password updated successfully:", result)
      alert(`Senha do funcionário ${result.employee.name} atualizada com sucesso!`)
      setEditingEmployeePassword(null)
      setNewPassword("")
    } catch (error) {
      console.error("[v0] Error updating password:", error)
      alert("Erro ao atualizar senha. Tente novamente.")
    }
  }

  const loadPartners = async () => {
    try {
      const response = await fetch("/api/partners/list")
      const data = await response.json()

      if (data.partners) {
        console.log("[v0] Loaded partners:", data.partners)
        setPartners(data.partners)
      }
    } catch (error) {
      console.error("[v0] Error loading partners:", error)
    }
  }

  useEffect(() => {
    loadEmployees()
    loadPartners()
    loadFeedbacks()
    loadSculptures() // Added call to load sculptures
  }, [])

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
            <div>
              <h1 className="text-lg md:text-2xl font-bold">PAINEL DE CONTROLE DO PARQUE</h1>
              {loggedEmployee && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-sm italic text-white/80">{greeting}</p>
                </div>
              )}
            </div>
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
              value="sculptures"
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-amber-300 bg-white shadow-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#F59E0B] data-[state=active]:via-[#1ed5bb] data-[state=active]:to-[#F59E0B] data-[state=active]:text-white data-[state=active]:border-[#F59E0B] data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-300 hover:shadow-lg hover:scale-102"
            >
              <Package className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-lg font-bold">Esculturas</span>
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
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16A34A] to-[#1ed5bb] flex items-center justify-center text-white">
                          {getPartnerIcon(partner.organization)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{partner.name}</h4>
                          <p className="text-sm text-muted-foreground">Organização: {partner.organization}</p>
                          {partner.email && <p className="text-sm text-muted-foreground">Email: {partner.email}</p>}
                          {partner.phone && <p className="text-sm text-muted-foreground">Telefone: {partner.phone}</p>}
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sculptures" className="space-y-6">
            <Card className="modern-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-[#F59E0B]" />
                    <div>
                      <CardTitle className="text-2xl font-bold">Esculturas Cadastradas</CardTitle>
                      <CardDescription>
                        Gerencie as esculturas do parque • Total: {sculptures.length} esculturas
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowCreateSculpture(true)}
                    className="bg-gradient-to-r from-[#F59E0B] to-[#1ed5bb] hover:from-[#F59E0B]/90 hover:to-[#1ed5bb]/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Escultura
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sculptures.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Nenhuma escultura cadastrada ainda.</p>
                    <p className="text-sm">Clique em "Nova Escultura" para começar.</p>
                  </div>
                ) : (
                  sculptures.map((sculpture) => (
                    <div
                      key={sculpture.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200">
                          {sculpture.image_url && !sculpture.image_url.includes("placeholder.svg") ? (
                            <img
                              src={sculpture.image_url || "/placeholder.svg"}
                              alt={sculpture.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log(
                                  "[v0] Image failed to load for sculpture:",
                                  sculpture.name,
                                  "URL:",
                                  sculpture.image_url,
                                )
                                e.currentTarget.style.display = "none"
                                e.currentTarget.parentElement!.innerHTML =
                                  `<div class="w-full h-full flex items-center justify-center"><svg class="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div>`
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-10 h-10 text-amber-400" />
                              <span className="sr-only">Sem imagem</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{sculpture.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Código: ESC{String(sculpture.code).padStart(3, "0")}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{sculpture.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditSculpture(sculpture) // Use handleEditSculpture to set editing state
                          }}
                          className="bg-transparent hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSculpture(sculpture.id)}
                          className="bg-transparent hover:bg-red-50 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintQRCode(sculpture)}
                          className="bg-transparent hover:bg-amber-50 text-amber-600 hover:text-amber-700"
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {showCreateSculpture && (
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Nova Escultura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sculpture-image">Imagem da Escultura</Label>
                    <Input
                      id="sculpture-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setImageFile(file)
                          console.log("[v0] Image file selected:", file.name, "Size:", file.size, "bytes")

                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string)
                            console.log("[v0] Image preview created")
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-muted-foreground">Pré-visualização:</p>
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
                        />
                      </div>
                    )}
                    {imageFile && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Arquivo selecionado: {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
                      </p>
                    )}
                    {!imageFile && (
                      <p className="text-sm text-muted-foreground">
                        Selecione uma imagem para a escultura (recomendado: JPG ou PNG)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sculpture-name">Nome</Label>
                    <Input
                      id="sculpture-name"
                      value={newSculpture.name}
                      onChange={(e) => setNewSculpture({ ...newSculpture, name: e.target.value })}
                      placeholder="Nome da escultura"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sculpture-description">Descrição</Label>
                    <Textarea
                      id="sculpture-description"
                      value={newSculpture.description}
                      onChange={(e) => setNewSculpture({ ...newSculpture, description: e.target.value })}
                      placeholder="Descrição da escultura"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sculpture-curiosity">Curiosidade</Label>
                    <Textarea
                      id="sculpture-curiosity"
                      value={newSculpture.curiosity}
                      onChange={(e) => setNewSculpture({ ...newSculpture, curiosity: e.target.value })}
                      placeholder="Curiosidades sobre a escultura"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateSculpture} disabled={uploadingImage} className="flex-1">
                      {uploadingImage ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Enviando imagem...
                        </>
                      ) : (
                        "Criar Escultura"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateSculpture(false)
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Sculpture Modal */}
            {editingSculpture && (
              <Card className="modern-card border-2 border-blue-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-blue-700">
                      <Package className="w-8 h-8" />
                      Editar Escultura
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSculpture(null)
                        setNewSculpture({ name: "", description: "", curiosity: "", imageUrl: "" })
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Imagem da Escultura</Label>

                    {/* Current or preview image */}
                    <div className="flex items-center gap-4">
                      {imagePreview ? (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-blue-300 shadow-md"
                        />
                      ) : editingSculpture?.image_url && !editingSculpture.image_url.includes("placeholder") ? (
                        <img
                          src={editingSculpture.image_url || "/placeholder.svg"}
                          alt="Imagem atual"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                          <Package className="w-16 h-16 text-blue-300" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <input
                          id="edit-sculpture-image-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              console.log("[v0] Image file selected for edit:", file.name, "Size:", file.size)
                              setImageFile(file)
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setImagePreview(reader.result as string)
                                console.log("[v0] Image preview generated for edit")
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("edit-sculpture-image-input")?.click()}
                          className="w-full h-12 border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          {imageFile ? "Alterar Imagem" : "Selecionar Nova Imagem"}
                        </Button>
                        {imageFile && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">{imageFile.name}</span>
                            <span className="text-xs text-gray-500">({(imageFile.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-sculpture-name" className="text-base font-semibold">
                      Nome da Escultura
                    </Label>
                    <Input
                      id="edit-sculpture-name"
                      value={newSculpture.name}
                      onChange={(e) => setNewSculpture({ ...newSculpture, name: e.target.value })}
                      placeholder="Nome da escultura"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sculpture-description" className="text-base font-semibold">
                      Descrição
                    </Label>
                    <Textarea
                      id="edit-sculpture-description"
                      value={newSculpture.description}
                      onChange={(e) => setNewSculpture({ ...newSculpture, description: e.target.value })}
                      placeholder="Descreva a escultura"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sculpture-curiosity" className="text-base font-semibold">
                      Curiosidade
                    </Label>
                    <Textarea
                      id="edit-sculpture-curiosity"
                      value={newSculpture.curiosity}
                      onChange={(e) => setNewSculpture({ ...newSculpture, curiosity: e.target.value })}
                      placeholder="Curiosidades sobre a escultura"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingSculpture(null)
                        setNewSculpture({ name: "", description: "", curiosity: "", imageUrl: "" })
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                      className="h-12 px-6"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpdateSculpture}
                      disabled={uploadingImage}
                      className="h-12 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-semibold"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {imageFile ? "Enviando imagem..." : "Salvando..."}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                          {lastScannedTicket.type === "individual"
                            ? "Ingresso Individual"
                            : lastScannedTicket.type === "agendamento"
                              ? "Agendamento"
                              : "Desconhecido"}
                        </p>
                        <p className="text-base">
                          <strong>Nome/Organização:</strong> {lastScannedTicket.name}
                        </p>
                        <p className="text-base">
                          <strong>Data:</strong> {lastScannedTicket.date}
                        </p>
                        {lastScannedTicket.alreadyUsed && (
                          <p className="text-yellow-800 font-semibold">Este ingresso/agendamento já foi utilizado.</p>
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
                      onClick={() =>
                        setEditingBooking({ ...selectedBooking, visitors: selectedBooking.visitors || [] })
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>

                {editingBooking ? (
                  <div className="space-y-4">
                    {(editingBooking.visitors || []).map((visitor: any, index: number) => (
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
                          visitors: [...(editingBooking.visitors || []), newVisitor],
                          number_of_people: (editingBooking.visitors || []).length + 1,
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
                    {(selectedBooking.visitors || []).map((visitor: any, index: number) => (
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
