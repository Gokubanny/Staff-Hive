import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useData } from "@/contexts/DataContext"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  Download,
  Search,
  Play,
  Users,
  CheckCircle,
  Plus
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

export default function Payroll() {
  const { employees, loading: dataLoading } = useData()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isPayslipDialogOpen, setIsPayslipDialogOpen] = useState(false)
  const [payrollRecords, setPayrollRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const currentPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  useEffect(() => {
    fetchPayroll()
  }, [])

  const fetchPayroll = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/payroll?period=${currentPeriod}`)
      if (res.data.success) {
        setPayrollRecords(res.data.data)
      } else {
        toast({ title: "Error", description: "Failed to fetch payroll" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Could not fetch payroll records" })
    } finally {
      setLoading(false)
    }
  }

  const filteredPayroll = payrollRecords.filter(record =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase()

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "failed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewPayslip = (record) => {
    setSelectedEmployee(record)
    setIsPayslipDialogOpen(true)
  }

  const totalPayrollAmount = payrollRecords.reduce((sum, record) => sum + (record.totalAmount || 0), 0)

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage employee payroll and generate salary payments
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/generate-payroll')}
          className="flex bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Play className="h-4 w-4 mr-2" />
          Generate Payroll
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPayrollAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Records</p>
                <p className="text-2xl font-bold text-foreground">{payrollRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                <p className="text-lg font-bold text-foreground">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Current Month Payroll</CardTitle>
          <CardDescription>
            Review and manage employee salaries for the current period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="default" className="flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {payrollRecords.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll records found</h3>
              <p className="text-gray-600 mb-4">Generate payroll to see records here</p>
              <Button onClick={() => navigate('/dashboard/generate-payroll')}>
                <Play className="h-4 w-4 mr-2" />
                Generate Payroll
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Employee</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Bonuses</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayroll.map(record => (
                    <TableRow key={record._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-medium text-sm">{getInitials(record.employeeName)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-foreground">{record.employeeName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(record.baseSalary)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(record.bonuses)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(record.deductions.tax + record.deductions.pension + record.deductions.other)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(record.totalAmount)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewPayslip(record)}>
                          <FileText className="h-4 w-4" />
                          Payslip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslip Dialog */}
      <Dialog open={isPayslipDialogOpen} onOpenChange={setIsPayslipDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Payslip</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.avatar || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(selectedEmployee.employeeName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{selectedEmployee.employeeName}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-muted-foreground">Base Salary</p>
                  <p className="font-bold text-lg">{formatCurrency(selectedEmployee.baseSalary)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-muted-foreground">Bonuses</p>
                  <p className="font-bold text-lg text-green-600">{formatCurrency(selectedEmployee.bonuses)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-muted-foreground">Deductions</p>
                  <p className="font-bold text-lg text-red-600">{formatCurrency(selectedEmployee.deductions.tax + selectedEmployee.deductions.pension + selectedEmployee.deductions.other)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-muted-foreground">Net Pay</p>
                  <p className="font-bold text-lg">{formatCurrency(selectedEmployee.totalAmount)}</p>
                </div>
              </div>

              <Button className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
