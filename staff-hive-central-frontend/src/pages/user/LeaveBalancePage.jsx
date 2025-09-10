import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Award
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

// Leave type configurations
const leaveTypeConfigs = {
  annual: {
    name: "Annual Leave",
    description: "Vacation and holiday time",
    yearlyAllocation: 25,
    carryOverLimit: 5,
    accrualRate: 2.08, // per month
    canCarryOver: true,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50"
  },
  sick: {
    name: "Sick Leave",
    description: "Medical and health-related leave",
    yearlyAllocation: 15,
    carryOverLimit: 0,
    accrualRate: 1.25,
    canCarryOver: false,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50"
  },
  personal: {
    name: "Personal Leave",
    description: "Personal and family matters",
    yearlyAllocation: 7,
    carryOverLimit: 0,
    accrualRate: 0.58,
    canCarryOver: false,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50"
  },
  maternity: {
    name: "Maternity Leave",
    description: "Leave for childbirth and bonding",
    yearlyAllocation: 120,
    carryOverLimit: 0,
    accrualRate: 0,
    canCarryOver: false,
    color: "bg-pink-500",
    textColor: "text-pink-700",
    bgColor: "bg-pink-50"
  },
  paternity: {
    name: "Paternity Leave",
    description: "Leave for new fathers",
    yearlyAllocation: 14,
    carryOverLimit: 0,
    accrualRate: 0,
    canCarryOver: false,
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50"
  },
  bereavement: {
    name: "Bereavement Leave",
    description: "Leave for family loss",
    yearlyAllocation: 5,
    carryOverLimit: 0,
    accrualRate: 0,
    canCarryOver: false,
    color: "bg-gray-500",
    textColor: "text-gray-700",
    bgColor: "bg-gray-50"
  },
  emergency: {
    name: "Emergency Leave",
    description: "Unforeseen circumstances",
    yearlyAllocation: 3,
    carryOverLimit: 0,
    accrualRate: 0,
    canCarryOver: false,
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50"
  }
}

// Mock employee data with balances
const mockEmployee = {
  name: "John Doe",
  employeeId: "EMP001",
  department: "Engineering",
  hireDate: "2022-01-15",
  currentBalances: {
    annual: { current: 18, used: 7, allocated: 25, pending: 0 },
    sick: { current: 12, used: 3, allocated: 15, pending: 0 },
    personal: { current: 5, used: 2, allocated: 7, pending: 0 },
    maternity: { current: 120, used: 0, allocated: 120, pending: 0 },
    paternity: { current: 14, used: 0, allocated: 14, pending: 0 },
    bereavement: { current: 5, used: 0, allocated: 5, pending: 0 },
    emergency: { current: 3, used: 0, allocated: 3, pending: 0 }
  }
}

// Mock balance history for the current year
const balanceHistory = [
  { month: "Jan 2024", annual: 25, sick: 15, personal: 7 },
  { month: "Feb 2024", annual: 24, sick: 15, personal: 7 },
  { month: "Mar 2024", annual: 21, sick: 12, personal: 5 },
  { month: "Apr 2024", annual: 20, sick: 12, personal: 5 },
  { month: "May 2024", annual: 19, sick: 12, personal: 5 },
  { month: "Jun 2024", annual: 18, sick: 12, personal: 5 },
  { month: "Jul 2024", annual: 18, sick: 12, personal: 5 },
  { month: "Aug 2024", annual: 18, sick: 12, personal: 5 }
]

export default function LeaveBalancePage() {
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState("2024")
  const [leaveRequests, setLeaveRequests] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadLeaveData()
  }, [])

  const loadLeaveData = () => {
    setIsLoading(true)
    try {
      const requests = JSON.parse(localStorage.getItem('leaveRequests') || '[]')
      setLeaveRequests(requests)
      
      // Filter pending requests
      const pending = requests.filter(req => req.status === 'pending')
      setPendingRequests(pending)
      
      // Update pending days in balances based on actual requests
      updatePendingBalances(pending)
    } catch (error) {
      console.error('Error loading leave data:', error)
      toast.error('Failed to load balance data')
    } finally {
      setIsLoading(false)
    }
  }

  const updatePendingBalances = (pending) => {
    // Calculate pending days by leave type
    const pendingByType = pending.reduce((acc, req) => {
      const type = req.leaveType
      if (!acc[type]) acc[type] = 0
      acc[type] += req.daysRequested || 0
      return acc
    }, {})

    // Update mock employee data with actual pending requests
    Object.keys(mockEmployee.currentBalances).forEach(type => {
      mockEmployee.currentBalances[type].pending = pendingByType[type] || 0
    })
  }

  const getBalanceStatus = (current, allocated) => {
    const percentage = (current / allocated) * 100
    if (percentage <= 20) return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' }
    if (percentage <= 50) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-100' }
    if (percentage <= 80) return { status: 'good', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const calculateProjectedBalance = (type, currentBalance, monthsRemaining = 4) => {
    const config = leaveTypeConfigs[type]
    if (!config || config.accrualRate === 0) return currentBalance
    
    const accrual = config.accrualRate * monthsRemaining
    return Math.min(currentBalance + accrual, config.yearlyAllocation)
  }

  const handleExportBalances = () => {
    try {
      const exportData = {
        employee: mockEmployee,
        balances: mockEmployee.currentBalances,
        history: balanceHistory,
        exportDate: new Date().toISOString(),
        year: selectedYear
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `leave-balances-${selectedYear}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success("Leave balances exported successfully!")
    } catch (error) {
      toast.error("Failed to export leave balances")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your leave balances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Balances</h1>
          <p className="text-muted-foreground mt-2">
            View your current leave balances, usage, and projections
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadLeaveData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportBalances} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Employee Info */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Name</Label>
              <p className="font-medium">{mockEmployee.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
              <p className="font-medium">{mockEmployee.employeeId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Department</Label>
              <p className="font-medium">{mockEmployee.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Hire Date</Label>
              <p className="font-medium">{new Date(mockEmployee.hireDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pending Leave Requests</AlertTitle>
          <AlertDescription>
            You have {pendingRequests.length} pending leave request{pendingRequests.length !== 1 ? 's' : ''} 
            that may affect your available balance once approved.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
          <TabsTrigger value="history">Usage History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Balance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(mockEmployee.currentBalances).map(([type, balance]) => {
              const config = leaveTypeConfigs[type]
              const balanceStatus = getBalanceStatus(balance.current, balance.allocated)
              const usagePercentage = ((balance.used / balance.allocated) * 100) || 0
              const availablePercentage = ((balance.current / balance.allocated) * 100) || 0
              
              return (
                <Card key={type} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{config.name}</span>
                      <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {config.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Balance */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">
                        {balance.current}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        of {balance.allocated} days available
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Available</span>
                        <span>{availablePercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={availablePercentage} className="h-2" />
                    </div>

                    {/* Balance Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="font-medium text-green-600">{balance.current}</div>
                        <div className="text-muted-foreground">Available</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-600">{balance.used}</div>
                        <div className="text-muted-foreground">Used</div>
                      </div>
                      <div>
                        <div className="font-medium text-yellow-600">{balance.pending}</div>
                        <div className="text-muted-foreground">Pending</div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <Badge className={`${balanceStatus.bg} ${balanceStatus.color} border-0`}>
                        {balanceStatus.status === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {balanceStatus.status === 'excellent' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {balanceStatus.status === 'good' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {balanceStatus.status === 'low' && <TrendingDown className="h-3 w-3 mr-1" />}
                        {balanceStatus.status.charAt(0).toUpperCase() + balanceStatus.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Accrual Info */}
                    {config.accrualRate > 0 && (
                      <div className="text-xs text-muted-foreground text-center">
                        Accrues {config.accrualRate} days/month
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total Available</p>
                    <p className="text-xl font-bold text-foreground">
                      {Object.values(mockEmployee.currentBalances).reduce((sum, b) => sum + b.current, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 shadow-lg border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-6 w-6 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total Used</p>
                    <p className="text-xl font-bold text-foreground">
                      {Object.values(mockEmployee.currentBalances).reduce((sum, b) => sum + b.used, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold text-foreground">
                      {Object.values(mockEmployee.currentBalances).reduce((sum, b) => sum + b.pending, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <PieChart className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Usage Rate</p>
                    <p className="text-xl font-bold text-foreground">
                      {Math.round((Object.values(mockEmployee.currentBalances).reduce((sum, b) => sum + b.used, 0) / Object.values(mockEmployee.currentBalances).reduce((sum, b) => sum + b.allocated, 0)) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed View Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Detailed Balance Breakdown
              </CardTitle>
              <CardDescription>
                Comprehensive view of all leave types with projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Leave Type</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Used</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead className="text-right">Projected (EOY)</TableHead>
                      <TableHead className="text-right">Carry Over</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(mockEmployee.currentBalances).map(([type, balance]) => {
                      const config = leaveTypeConfigs[type]
                      const balanceStatus = getBalanceStatus(balance.current, balance.allocated)
                      const projected = calculateProjectedBalance(type, balance.current)
                      const canCarryOver = config.canCarryOver ? Math.min(projected, config.carryOverLimit) : 0

                      return (
                        <TableRow key={type} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
                              <div>
                                <div className="font-medium">{config.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {config.accrualRate > 0 && `+${config.accrualRate}/month`}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{balance.allocated}</TableCell>
                          <TableCell className="text-right text-red-600">{balance.used}</TableCell>
                          <TableCell className="text-right text-yellow-600">{balance.pending}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">{balance.current}</TableCell>
                          <TableCell className="text-right">{projected.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{canCarryOver}</TableCell>
                          <TableCell>
                            <Badge className={`${balanceStatus.bg} ${balanceStatus.color} border-0 text-xs`}>
                              {balanceStatus.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Leave Policies & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(leaveTypeConfigs).map(([type, config]) => (
                  <div key={type} className={`p-4 rounded-lg ${config.bgColor} border`}>
                    <h4 className={`font-medium ${config.textColor} mb-2`}>{config.name}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• Annual allocation: {config.yearlyAllocation} days</p>
                      {config.accrualRate > 0 && <p>• Accrues: {config.accrualRate} days/month</p>}
                      <p>• Carry over: {config.canCarryOver ? `Up to ${config.carryOverLimit} days` : 'Not allowed'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Balance History ({selectedYear})
              </CardTitle>
              <CardDescription>
                Monthly balance changes throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Annual Leave</TableHead>
                      <TableHead className="text-right">Sick Leave</TableHead>
                      <TableHead className="text-right">Personal Leave</TableHead>
                      <TableHead className="text-right">Total Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceHistory.map((record, index) => (
                      <TableRow key={index} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{record.month}</TableCell>
                        <TableCell className="text-right">{record.annual}</TableCell>
                        <TableCell className="text-right">{record.sick}</TableCell>
                        <TableCell className="text-right">{record.personal}</TableCell>
                        <TableCell className="text-right font-medium">
                          {record.annual + record.sick + record.personal}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          {leaveRequests.filter(req => req.status === 'approved').length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Leave Transactions
                </CardTitle>
                <CardDescription>
                  Approved leave requests affecting your balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveRequests
                    .filter(req => req.status === 'approved')
                    .slice(0, 5)
                    .map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${leaveTypeConfigs[request.leaveType]?.color || 'bg-gray-500'}`}></div>
                          <div>
                            <p className="font-medium">{request.leaveTypeName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">-{request.daysRequested} days</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.submissionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}