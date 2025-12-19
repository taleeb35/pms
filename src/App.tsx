import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import DoctorAuth from "./pages/DoctorAuth";
import Auth from "./pages/Auth";
import ReceptionistAuth from "./pages/ReceptionistAuth";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import PendingDoctors from "./pages/PendingDoctors";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorProfile from "./pages/DoctorProfile";
import WaitlistPatients from "./pages/WaitlistPatients";
import PatientDetail from "./pages/PatientDetail";
import DoctorSupport from "./pages/DoctorSupport";
import DoctorFinance from "./pages/DoctorFinance";
import DoctorWalkIn from "./pages/DoctorWalkIn";
import DoctorProcedures from "./pages/DoctorProcedures";
import DoctorAllergies from "./pages/DoctorAllergies";
import DoctorDiseases from "./pages/DoctorDiseases";
import DoctorTemplates from "./pages/DoctorTemplates";
import SupportTickets from "./pages/SupportTickets";
import AdminDoctorPatients from "./pages/AdminDoctorPatients";
import AdminSettings from "./pages/AdminSettings";
import AdminClinics from "./pages/AdminClinics";
import ClinicDashboard from "./pages/ClinicDashboard";
import ClinicAddDoctor from "./pages/ClinicAddDoctor";
import ClinicDoctors from "./pages/ClinicDoctors";
import ClinicPatients from "./pages/ClinicPatients";
import ClinicPatientDetail from "./pages/ClinicPatientDetail";
import ClinicAppointments from "./pages/ClinicAppointments";
import ClinicWalkIn from "./pages/ClinicWalkIn";
import ClinicFinance from "./pages/ClinicFinance";
import ClinicSupport from "./pages/ClinicSupport";
import ClinicSpecializations from "./pages/ClinicSpecializations";
import ClinicAllergies from "./pages/ClinicAllergies";
import ClinicDiseases from "./pages/ClinicDiseases";
import ClinicReceptionists from "./pages/ClinicReceptionists";
import ClinicProcedures from "./pages/ClinicProcedures";
import ClinicICDCodes from "./pages/ClinicICDCodes";
import DoctorICDCodes from "./pages/DoctorICDCodes";
import AdminProfile from "./pages/AdminProfile";
import AdminFinance from "./pages/AdminFinance";
import ClinicProfile from "./pages/ClinicProfile";
import ClinicTemplates from "./pages/ClinicTemplates";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/doctor-auth" element={<DoctorAuth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/receptionist-auth" element={<ReceptionistAuth />} />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/patients"
              element={
                <Layout>
                  <Patients />
                </Layout>
              }
            />
            <Route
              path="/appointments"
              element={
                <Layout>
                  <Appointments />
                </Layout>
              }
            />
            <Route
              path="/doctors"
              element={
                <Layout>
                  <Doctors />
                </Layout>
              }
            />
            <Route
              path="/pending-doctors"
              element={
                <Layout>
                  <PendingDoctors />
                </Layout>
              }
            />
            <Route
              path="/doctor/dashboard"
              element={
                <Layout>
                  <DoctorDashboard />
                </Layout>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <Layout>
                  <DoctorPatients />
                </Layout>
              }
            />
            <Route
              path="/doctor/patients/:id"
              element={
                <Layout>
                  <PatientDetail />
                </Layout>
              }
            />
            <Route
              path="/doctor/waitlist"
              element={
                <Layout>
                  <WaitlistPatients />
                </Layout>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <Layout>
                  <DoctorAppointments />
                </Layout>
              }
            />
            <Route
              path="/doctor/procedures"
              element={
                <Layout>
                  <DoctorProcedures />
                </Layout>
              }
            />
            <Route
              path="/doctor/allergies"
              element={
                <Layout>
                  <DoctorAllergies />
                </Layout>
              }
            />
            <Route
              path="/doctor/diseases"
              element={
                <Layout>
                  <DoctorDiseases />
                </Layout>
              }
            />
            <Route
              path="/doctor/templates"
              element={
                <Layout>
                  <DoctorTemplates />
                </Layout>
              }
            />
            <Route
              path="/doctor/icd-codes"
              element={
                <Layout>
                  <DoctorICDCodes />
                </Layout>
              }
            />
            <Route
              path="/doctor/finance"
              element={
                <Layout>
                  <DoctorFinance />
                </Layout>
              }
            />
            <Route
              path="/doctor/walk-in"
              element={
                <Layout>
                  <DoctorWalkIn />
                </Layout>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <Layout>
                  <DoctorProfile />
                </Layout>
              }
            />
            <Route
              path="/doctor/support"
              element={
                <Layout>
                  <DoctorSupport />
                </Layout>
              }
            />
            <Route
              path="/support-tickets"
              element={
                <Layout>
                  <SupportTickets />
                </Layout>
              }
            />
            <Route
              path="/admin/doctor-patients/:doctorId"
              element={
                <Layout>
                  <AdminDoctorPatients />
                </Layout>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <Layout>
                  <AdminSettings />
                </Layout>
              }
            />
            <Route
              path="/admin/clinics"
              element={
                <Layout>
                  <AdminClinics />
                </Layout>
              }
            />
            <Route
              path="/admin/finance"
              element={
                <Layout>
                  <AdminFinance />
                </Layout>
              }
            />
            <Route
              path="/clinic/dashboard"
              element={
                <Layout>
                  <ClinicDashboard />
                </Layout>
              }
            />
            <Route
              path="/clinic/add-doctor"
              element={
                <Layout>
                  <ClinicAddDoctor />
                </Layout>
              }
            />
            <Route
              path="/clinic/doctors"
              element={
                <Layout>
                  <ClinicDoctors />
                </Layout>
              }
            />
            <Route
              path="/clinic/patients"
              element={
                <Layout>
                  <ClinicPatients />
                </Layout>
              }
            />
            <Route
              path="/clinic/patients/:id"
              element={
                <Layout>
                  <ClinicPatientDetail />
                </Layout>
              }
            />
            <Route
              path="/clinic/appointments"
              element={
                <Layout>
                  <ClinicAppointments />
                </Layout>
              }
            />
            <Route
              path="/clinic/walk-in"
              element={
                <Layout>
                  <ClinicWalkIn />
                </Layout>
              }
            />
            <Route
              path="/clinic/finance"
              element={
                <Layout>
                  <ClinicFinance />
                </Layout>
              }
            />
            <Route
              path="/clinic/support"
              element={
                <Layout>
                  <ClinicSupport />
                </Layout>
              }
            />
            <Route
              path="/clinic/specializations"
              element={
                <Layout>
                  <ClinicSpecializations />
                </Layout>
              }
            />
            <Route
              path="/clinic/allergies"
              element={
                <Layout>
                  <ClinicAllergies />
                </Layout>
              }
            />
            <Route
              path="/clinic/diseases"
              element={
                <Layout>
                  <ClinicDiseases />
                </Layout>
              }
            />
            <Route
              path="/clinic/icd-codes"
              element={
                <Layout>
                  <ClinicICDCodes />
                </Layout>
              }
            />
            <Route
              path="/clinic/procedures"
              element={
                <Layout>
                  <ClinicProcedures />
                </Layout>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <Layout>
                  <AdminProfile />
                </Layout>
              }
            />
            <Route
              path="/clinic/profile"
              element={
                <Layout>
                  <ClinicProfile />
                </Layout>
              }
            />
            <Route
              path="/clinic/receptionists"
              element={
                <Layout>
                  <ClinicReceptionists />
                </Layout>
              }
            />
            <Route
              path="/clinic/templates"
              element={
                <Layout>
                  <ClinicTemplates userType="clinic" />
                </Layout>
              }
            />
            {/* Receptionist Routes */}
            <Route
              path="/receptionist/dashboard"
              element={
                <Layout>
                  <ReceptionistDashboard />
                </Layout>
              }
            />
            <Route
              path="/receptionist/patients"
              element={
                <Layout>
                  <ClinicPatients />
                </Layout>
              }
            />
            <Route
              path="/receptionist/patients/:id"
              element={
                <Layout>
                  <ClinicPatientDetail />
                </Layout>
              }
            />
            <Route
              path="/receptionist/appointments"
              element={
                <Layout>
                  <ClinicAppointments />
                </Layout>
              }
            />
            <Route
              path="/receptionist/walk-in"
              element={
                <Layout>
                  <ClinicWalkIn />
                </Layout>
              }
            />
            <Route
              path="/receptionist/finance"
              element={
                <Layout>
                  <ClinicFinance />
                </Layout>
              }
            />
            <Route
              path="/receptionist/doctors"
              element={
                <Layout>
                  <ClinicDoctors />
                </Layout>
              }
            />
            <Route
              path="/receptionist/specializations"
              element={
                <Layout>
                  <ClinicSpecializations />
                </Layout>
              }
            />
            <Route
              path="/receptionist/allergies"
              element={
                <Layout>
                  <ClinicAllergies />
                </Layout>
              }
            />
            <Route
              path="/receptionist/diseases"
              element={
                <Layout>
                  <ClinicDiseases />
                </Layout>
              }
            />
            <Route
              path="/receptionist/icd-codes"
              element={
                <Layout>
                  <ClinicICDCodes />
                </Layout>
              }
            />
            <Route
              path="/receptionist/procedures"
              element={
                <Layout>
                  <ClinicProcedures />
                </Layout>
              }
            />
            <Route
              path="/receptionist/templates"
              element={
                <Layout>
                  <ClinicTemplates userType="receptionist" />
                </Layout>
              }
            />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
