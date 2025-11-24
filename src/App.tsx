import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import DoctorAuth from "./pages/DoctorAuth";
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
import SupportTickets from "./pages/SupportTickets";
import AdminDoctorPatients from "./pages/AdminDoctorPatients";
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
