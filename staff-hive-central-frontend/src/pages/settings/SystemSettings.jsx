// pages/admin/settings/SystemSettings.jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyInfo from "./system/CompanyInfo";
import DataManagement from "./system/DataManagement";
import Integrations from "./system/Integrations";

export default function SystemSettings() {
  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-xl">
        <TabsTrigger value="company">Company Info</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="data">Data Management</TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="pt-6">
        <CompanyInfo />
      </TabsContent>

      <TabsContent value="integrations" className="pt-6">
        <Integrations />
      </TabsContent>

      <TabsContent value="data" className="pt-6">
        <DataManagement />
      </TabsContent>
    </Tabs>
  );
}