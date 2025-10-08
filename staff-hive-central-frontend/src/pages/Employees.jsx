import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Users, RefreshCw, Building2, Eye, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddEmployee from "../components/AddEmployee";
import EmployeeDetailView from "../components/EmployeeDetailView";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const { employees, deleteEmployee, updateEmployee, fetchEmployees, loading } = useData();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Get unique departments from employees
  const getUniqueDepartments = () => {
    const departments = employees
      .map(emp => emp.department)
      .filter(dept => dept && dept.trim() !== '')
      .filter((dept, index, arr) => arr.indexOf(dept) === index)
      .sort();
    
    return ['All Departments', ...departments];
  };

  // Get unique statuses from employees
  const getUniqueStatuses = () => {
    const statuses = employees
      .map(emp => emp.status || 'Active')
      .filter((status, index, arr) => arr.indexOf(status) === index)
      .sort();
    
    return ['All Status', ...statuses];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Helper function to get full name
  const getFullName = (employee) => {
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || 'Unknown Employee';
  };

  // Get display value with fallbacks
  const getDisplayValue = (value, fallback = 'Not set') => {
    return value && value !== '' ? value : fallback;
  };

  // Fixed filter with department and status filters
  const filteredEmployees = employees.filter(employee => {
    // Search term filter
    const fullName = getFullName(employee).toLowerCase();
    const email = (employee.email || '').toLowerCase();
    const position = (employee.position || '').toLowerCase();
    const department = (employee.department || '').toLowerCase();
    const companyName = (employee.companyName || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      position.includes(searchLower) ||
      department.includes(searchLower) ||
      companyName.includes(searchLower);

    // Department filter
    const matchesDepartment = selectedDepartment === 'All Departments' || 
      employee.department === selectedDepartment;

    // Status filter
    const matchesStatus = selectedStatus === 'All Status' || 
      (employee.status || 'Active') === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteEmployee(id);
        toast({
          title: "Employee deleted",
          description: `${name} has been removed successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error deleting employee",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsAddDialogOpen(true);
  };

  const handleView = (employee) => {
    console.log('👁️ Viewing employee:', employee);
    setViewingEmployee(employee);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingEmployee(null);
    // Refresh data after closing dialog to get any updates
    fetchEmployees();
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchEmployees();
      toast({
        title: "Refreshed",
        description: "Employee data has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh employee data.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('All Departments');
    setSelectedStatus('All Status');
  };

  // Debug: Log employee data to see what's being displayed
  useEffect(() => {
    if (employees.length > 0) {
      console.log('📊 Current employees data structure:', employees.map(emp => ({
        id: emp._id,
        name: getFullName(emp),
        email: emp.email,
        position: emp.position,
        department: emp.department,
        companyName: emp.companyName,
        salary: emp.salary,
        status: emp.status
      })));
    }
  }, [employees]);

  if (loading && employees.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Loading employees...</div>;
  }

  const departments = getUniqueDepartments();
  const statuses = getUniqueStatuses();

  return (
    <div className="px-6 py-8 ml-64">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg" style={{fontSize: '1.8rem', marginBottom: '5px'}}>Employees List</CardTitle> 
            <p>Search and filter employees across all companies</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))", 
                display: 'flex'
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, employee ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Department Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                  {selectedDepartment}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px] max-h-[300px] overflow-y-auto">
                {departments.map((dept) => (
                  <DropdownMenuItem
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={selectedDepartment === dept ? "bg-accent" : ""}
                  >
                    {dept}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[150px] justify-between">
                  {selectedStatus}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[150px]">
                {statuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={selectedStatus === status ? "bg-accent" : ""}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters Button */}
            {(searchTerm !== '' || selectedDepartment !== 'All Departments' || selectedStatus !== 'All Status') && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Data Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <div className="text-sm text-gray-600">
              Showing {filteredEmployees.length} of {employees.length} employees
              {(selectedDepartment !== 'All Departments' || selectedStatus !== 'All Status') && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Filtered
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first employee</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Employee
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Monthly Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <div>{getFullName(emp)}</div>
                          {emp.userId && (
                            <div className="text-xs text-gray-500">User Account</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getDisplayValue(emp.email)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{getDisplayValue(emp.position, 'No position set')}</div>
                        {/* Show if position was updated from profile */}
                        {emp.currentTitle && emp.currentTitle !== emp.position && (
                          <div className="text-xs text-gray-500">Profile: {emp.currentTitle}</div>
                        )}
                      </TableCell>
                      <TableCell>{getDisplayValue(emp.department, 'No department set')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-3 w-3 text-gray-500" />
                          <span>{getDisplayValue(emp.companyName, 'No company set')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        <div>{formatCurrency(emp.salary)}</div>
                        {emp.salary ? (
                          <div className="text-xs text-gray-500">Monthly</div>
                        ) : (
                          <div className="text-xs text-red-500">Not set</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          emp.status === 'Active' ? 'bg-green-100 text-green-800' :
                          emp.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                          emp.status === 'On Leave' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {emp.status || 'Active'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(emp)}
                            title="View employee details"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(emp)}
                            title="Edit employee"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(emp._id, getFullName(emp))}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty search state */}
          {employees.length > 0 && filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="mt-2"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEmployee 
        isOpen={isAddDialogOpen} 
        onClose={handleCloseDialog}
        editingEmployee={editingEmployee}
      />

      <EmployeeDetailView 
        employee={viewingEmployee}
        isOpen={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
      />
    </div>
  );
}