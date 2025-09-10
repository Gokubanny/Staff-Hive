import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';

export default function Companies() {
  const navigate = useNavigate();
  const { companies, deleteCompany, fetchCompanies, loading } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteCompany(id);
        toast({
          title: "Company deleted",
          description: "Company has been removed successfully.",
        });
      } catch (error) {
        toast({
          title: "Error deleting company",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 ml-64">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's company directory
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Directory
            </CardTitle>
            <CardDescription>
              Manage all companies in your network
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/dashboard/add-company')} style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))", display: 'flex'}}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Founded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company._id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>{company.location}</TableCell>
                    <TableCell>{company.size}</TableCell>
                    <TableCell>{company.founded || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/edit-company/${company._id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(company._id, company.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

          {/* Empty state */}
          {filteredCompanies.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No companies found' : 'No companies yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria.' 
                  : 'Start by adding your first company to the directory.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/dashboard/add-company')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Company
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}