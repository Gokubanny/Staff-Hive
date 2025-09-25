// src/App.jsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { JobProvider } from "@/contexts/JobContext";
import { AttendanceProvider } from "@/contexts/AttendanceContext";
import { LeaveProvider } from "@/contexts/LeaveContext"; // ✅ Added

import { DashboardLayout } from "@/components/DashboardLayout";
import { UserLayout } from "@/components/UserLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/user/UserDashboard";
import Employees from "./pages/Employees";
import Companies from "./pages/Companies";
import Payroll from "@/pages/Payroll";
import GeneratePayroll from "@/pages/GeneratePayroll";
import Applicants from "./pages/Applicants";
import AddApplicant from "./pages/AddApplicant";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import AddCompanies from "./components/AddCompanies";
import EditCompany from "./components/EditCompany";
import Landing from "./pages/Landing";
import Contact from "./pages/Contact";
import Knowledge from "./pages/Knowledge";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Payslip from './pages/Payslip';
import AdminPostJob from "./pages/admin/AdminPostJob";
import AdminAllJob from "./pages/admin/AdminAllJob";
import AdminViewJob from "./pages/admin/AdminViewJob";
import AdminEditJob from "./pages/admin/AdminEditJob";
import AdminLeaveManagement from "./pages/admin/LeaveManagement";

// Attendance Pages
import AdminAttendance from "./pages/admin/AdminAttendance";
import UserAttendance from "./pages/user/UserAttendance";

// Job Application
import JobApplicationForm from "./pages/JobApplicationForm";

// User pages
import UserLeavePage from "./pages/user/UserLeavePage";
import UserTrainingPage from "./pages/user/UserTrainingPage";
import UserBenefitsPage from "./pages/user/UserBenefitsPage";
import UserJobsPage from "./pages/user/UserJobsPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import LeaveRequestPage from "./pages/user/LeaveRequestPage";
import LeaveBalancePage from "./pages/user/LeaveBalancePage";
import LeaveHistoryPage from "./pages/user/LeaveHistoryPage";

// Settings
import ProfileSettings from "./pages/settings/ProfileSetting";
import SecuritySettings from "./pages/settings/SecuritySettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import SystemSettings from "./pages/settings/SystemSettings";
import CompanyInfo from "./pages/settings/system/CompanyInfo";
import DataManagement from "./pages/settings/system/DataManagement";
import Integrations from "./pages/settings/system/Integrations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <JobProvider>
              <AttendanceProvider>
                <LeaveProvider> {/* ✅ Added LeaveProvider */}
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Admin routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="companies" element={<Companies />} />
                      <Route path="edit-company/:id" element={<EditCompany />} />
                      <Route path="employees" element={<Employees />} />
                      <Route path="attendance" element={<AdminAttendance />} />
                      <Route path="/dashboard/payroll" element={<Payroll />} />
                      <Route path="/dashboard/generate-payroll" element={<GeneratePayroll />} />
                      <Route path="payslip/:employeeId" element={<Payslip />} />
                      <Route path="leave-management" element={<AdminLeaveManagement />} />

                      {/* Applicant Management */}
                      <Route path="applicants" element={<Applicants />} />
                      <Route path="add-applicant" element={<AddApplicant />} />

                      {/* Job Management */}
                      <Route path="post-job" element={<AdminPostJob />} />
                      <Route path="job-postings" element={<AdminAllJob />} />
                      <Route path="jobs" element={<AdminAllJob />} /> {/* alias */}
                      <Route path="jobs/view/:id" element={<AdminViewJob />} />
                      <Route path="jobs/edit/:id" element={<AdminEditJob />} />

                      <Route path="knowledge" element={<Knowledge />} />
                      <Route path="reports" element={<Reports />} />

                      {/* Settings */}
                      <Route path="/dashboard/settings" element={<Settings />}>
                        <Route index element={<Navigate to="profile" replace />} />
                        <Route path="profile" element={<ProfileSettings />} />
                        <Route path="security" element={<SecuritySettings />} />
                        <Route path="notifications" element={<NotificationSettings />} />
                        <Route path="system" element={<SystemSettings />}>
                          <Route index element={<Navigate to="company" replace />} />
                          <Route path="company" element={<CompanyInfo />} />
                          <Route path="integrations" element={<Integrations />} />
                          <Route path="data" element={<DataManagement />} />
                        </Route>
                      </Route>
                    </Route>

                    {/* User routes */}
                    <Route
                      path="/user-dashboard"
                      element={
                        <ProtectedRoute requiredRole="user">
                          <UserLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<UserDashboard />} />
                      <Route path="attendance" element={<UserAttendance />} />

                      {/* Leave */}
                      <Route path="leave" element={<LeaveRequestPage />} />
                      <Route path="leave/balance" element={<LeaveBalancePage />} />
                      <Route path="leave/history" element={<LeaveHistoryPage />} />

                      {/* Training */}
                      <Route path="training" element={<UserTrainingPage />} />
                      <Route path="training/courses" element={<div>Available Courses Page</div>} />

                      {/* Jobs */}
                      <Route path="jobs" element={<UserJobsPage />} />
                      <Route path="apply-job/:jobId" element={<JobApplicationForm />} />

                      {/* Other user pages */}
                      <Route path="benefits" element={<UserBenefitsPage />} />
                      <Route path="profile" element={<UserProfilePage />} />
                      <Route path="company" element={<div>Company Info Page</div>} />
                    </Route>

                    {/* Shared job application route */}
                    <Route
                      path="/apply-job/:jobId"
                      element={
                        <ProtectedRoute requiredRole="user">
                          <JobApplicationForm />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin-only standalone */}
                    <Route
                      path="/add-companies"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AddCompanies />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </LeaveProvider>
              </AttendanceProvider>
            </JobProvider>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
