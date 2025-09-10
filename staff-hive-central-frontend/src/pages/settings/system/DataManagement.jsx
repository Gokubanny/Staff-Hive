// pages/admin/settings/system/DataManagement.jsx
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, DatabaseBackup } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useJobs } from '@/contexts/JobContext';
import { useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

export default function DataManagement() {
  const { exportData, importData, resetData } = useJobs();
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await importData(file);
      toast({
        title: "Import successful",
        description: "Your data has been imported",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Export section */}
      <div className="space-y-6 p-6 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Export Data</h3>
            <p className="text-sm text-muted-foreground">
              Download company data in various formats
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => exportData('json')}
          >
            JSON
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportData('csv')}
          >
            CSV
          </Button>
        </div>
      </div>

      {/* Import section */}
      <div className="space-y-6 p-6 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Import Data</h3>
            <p className="text-sm text-muted-foreground">
              Upload previously exported data
            </p>
          </div>
        </div>
        <div className="pt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json,.csv"
            className="hidden"
          />
          <Button 
            className="gap-2"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className="h-4 w-4" />
            <span>Select File</span>
          </Button>
        </div>
      </div>

      {/* Data deletion section remains the same but use resetData */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete All Data</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all company data including employees, payroll, and settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={resetData}
            >
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}