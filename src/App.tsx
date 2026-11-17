import { MarketingRedirect, AppHomeGate } from "@/components/MarketingRedirect";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import KeyedByParam from "./components/routing/KeyedByParam";
import { GeoLocationProvider } from "@/contexts/GeoLocationContext";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { PublicDoctorFinderChat } from "@/components/PublicDoctorFinderChat";
const Index = lazy(() => import("./pages/Index"));
const DemoLanding = lazy(() => import("./pages/DemoLanding"));
const Features = lazy(() => import("./pages/Features"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ClinicManagementSoftware = lazy(() => import("./pages/ClinicManagementSoftware"));
const ClinicManagementSystemGuide = lazy(() => import("./pages/ClinicManagementSystemGuide"));
const ClinicSoftwareSmallPractices = lazy(() => import("./pages/ClinicSoftwareSmallPractices"));
const Reviews = lazy(() => import("./pages/Reviews"));
const CityLahore = lazy(() => import("./pages/CityLahore"));
const CityKarachi = lazy(() => import("./pages/CityKarachi"));
const CityIslamabad = lazy(() => import("./pages/CityIslamabad"));
const CityRawalpindi = lazy(() => import("./pages/CityRawalpindi"));
const CityFaisalabad = lazy(() => import("./pages/CityFaisalabad"));
const CityMultan = lazy(() => import("./pages/CityMultan"));
const CityPeshawar = lazy(() => import("./pages/CityPeshawar"));
const CityQuetta = lazy(() => import("./pages/CityQuetta"));
const CitySialkot = lazy(() => import("./pages/CitySialkot"));
const CityGujranwala = lazy(() => import("./pages/CityGujranwala"));
const CityHyderabad = lazy(() => import("./pages/CityHyderabad"));
const CityBahawalpur = lazy(() => import("./pages/CityBahawalpur"));
const CitySargodha = lazy(() => import("./pages/CitySargodha"));
const CitySukkur = lazy(() => import("./pages/CitySukkur"));
const CityAbbottabad = lazy(() => import("./pages/CityAbbottabad"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ReportsHub = lazy(() => import("./pages/ReportsHub"));
const ReceptionistAuth = lazy(() => import("./pages/ReceptionistAuth"));
const UnifiedLogin = lazy(() => import("./pages/UnifiedLogin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Patients = lazy(() => import("./pages/Patients"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Doctors = lazy(() => import("./pages/Doctors"));
const PendingDoctors = lazy(() => import("./pages/PendingDoctors"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const DoctorPatients = lazy(() => import("./pages/DoctorPatients"));
const DoctorAppointments = lazy(() => import("./pages/DoctorAppointments"));
const DoctorAppointmentDetail = lazy(() => import("./pages/DoctorAppointmentDetail"));
const DoctorLeads = lazy(() => import("./pages/DoctorLeads"));
const ClinicLeads = lazy(() => import("./pages/ClinicLeads"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile"));
const WaitlistPatients = lazy(() => import("./pages/WaitlistPatients"));
const PatientDetail = lazy(() => import("./pages/PatientDetail"));
const DoctorSupport = lazy(() => import("./pages/DoctorSupport"));
const DoctorFinance = lazy(() => import("./pages/DoctorFinance"));
const DoctorReports = lazy(() => import("./pages/DoctorReports"));
const DoctorSummary = lazy(() => import("./pages/DoctorSummary"));
const DoctorMedicineReport = lazy(() => import("./pages/DoctorMedicineReport"));
const DoctorWalkIn = lazy(() => import("./pages/DoctorWalkIn"));
const QueueDisplay = lazy(() => import("./pages/QueueDisplay"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const IntakeForm = lazy(() => import("./pages/IntakeForm"));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback"));
const DoctorProcedures = lazy(() => import("./pages/DoctorProcedures"));
const DoctorAllergies = lazy(() => import("./pages/DoctorAllergies"));
const DoctorMedicines = lazy(() => import("./pages/DoctorMedicines"));
const DoctorDiseases = lazy(() => import("./pages/DoctorDiseases"));
const DoctorTemplates = lazy(() => import("./pages/DoctorTemplates"));
const DoctorSchedule = lazy(() => import("./pages/DoctorSchedule"));
const DoctorCalendar = lazy(() => import("./pages/DoctorCalendar"));
const SupportTickets = lazy(() => import("./pages/SupportTickets"));
const AdminDoctorPatients = lazy(() => import("./pages/AdminDoctorPatients"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminClinics = lazy(() => import("./pages/AdminClinics"));
const AdminChatbotLeads = lazy(() => import("./pages/AdminChatbotLeads"));
const ClinicDashboard = lazy(() => import("./pages/ClinicDashboard"));
const ClinicAddDoctor = lazy(() => import("./pages/ClinicAddDoctor"));
const ClinicDoctors = lazy(() => import("./pages/ClinicDoctors"));
const ClinicPatients = lazy(() => import("./pages/ClinicPatients"));
const ClinicPatientDetail = lazy(() => import("./pages/ClinicPatientDetail"));
const ClinicAppointments = lazy(() => import("./pages/ClinicAppointments"));
const ClinicAppointmentDetail = lazy(() => import("./pages/ClinicAppointmentDetail"));
const ClinicWalkIn = lazy(() => import("./pages/ClinicWalkIn"));
const ClinicFinance = lazy(() => import("./pages/ClinicFinance"));
const ClinicReports = lazy(() => import("./pages/ClinicReports"));
const ClinicExpenses = lazy(() => import("./pages/ClinicExpenses"));
const ClinicSupport = lazy(() => import("./pages/ClinicSupport"));
const ClinicSpecializations = lazy(() => import("./pages/ClinicSpecializations"));
const ClinicAllergies = lazy(() => import("./pages/ClinicAllergies"));
const ClinicMedicines = lazy(() => import("./pages/ClinicMedicines"));
const ClinicDiseases = lazy(() => import("./pages/ClinicDiseases"));
const ClinicReceptionists = lazy(() => import("./pages/ClinicReceptionists"));
const ClinicProcedures = lazy(() => import("./pages/ClinicProcedures"));
const ClinicICDCodes = lazy(() => import("./pages/ClinicICDCodes"));
const DoctorICDCodes = lazy(() => import("./pages/DoctorICDCodes"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const AdminFinance = lazy(() => import("./pages/AdminFinance"));
const ClinicProfile = lazy(() => import("./pages/ClinicProfile"));
const ClinicTemplates = lazy(() => import("./pages/ClinicTemplates"));
const ClinicDoctorSchedules = lazy(() => import("./pages/ClinicDoctorSchedules"));
const ReceptionistDashboard = lazy(() => import("./pages/ReceptionistDashboard"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const KnowledgeBaseArticle = lazy(() => import("./pages/KnowledgeBaseArticle"));
import { KBEmbeddedProvider } from "./contexts/KnowledgeBaseContext";
const ReferralProgram = lazy(() => import("./pages/ReferralProgram"));
const ReferralPartnerAuth = lazy(() => import("./pages/ReferralPartnerAuth"));
const ReferralPartnerDashboard = lazy(() => import("./pages/ReferralPartnerDashboard"));
const AdminReferralPartners = lazy(() => import("./pages/AdminReferralPartners"));
const ClinicSubscription = lazy(() => import("./pages/ClinicSubscription"));
const DoctorSubscription = lazy(() => import("./pages/DoctorSubscription"));
const DoctorReceptionists = lazy(() => import("./pages/DoctorReceptionists"));
const DoctorReceptionistDashboard = lazy(() => import("./pages/DoctorReceptionistDashboard"));
const DoctorReceptionistPatients = lazy(() => import("./pages/DoctorReceptionistPatients"));
const DoctorReceptionistAppointments = lazy(() => import("./pages/DoctorReceptionistAppointments"));
const DoctorReceptionistWalkIn = lazy(() => import("./pages/DoctorReceptionistWalkIn"));
const DoctorReceptionistWaitlist = lazy(() => import("./pages/DoctorReceptionistWaitlist"));
const DoctorReceptionistAllergies = lazy(() => import("./pages/DoctorReceptionistAllergies"));
const DoctorReceptionistDiseases = lazy(() => import("./pages/DoctorReceptionistDiseases"));
const DoctorReceptionistICDCodes = lazy(() => import("./pages/DoctorReceptionistICDCodes"));
const DoctorReceptionistProcedures = lazy(() => import("./pages/DoctorReceptionistProcedures"));
const DoctorReceptionistPatientDetail = lazy(() => import("./pages/DoctorReceptionistPatientDetail"));
const ClinicActivityLogs = lazy(() => import("./pages/ClinicActivityLogs"));
const InventoryDashboard = lazy(() => import("./pages/inventory/InventoryDashboard"));
const InventorySuppliers = lazy(() => import("./pages/inventory/InventorySuppliers"));
const InventoryProducts = lazy(() => import("./pages/inventory/InventoryProducts"));
const InventoryPurchaseOrders = lazy(() => import("./pages/inventory/InventoryPurchaseOrders"));
const InventoryPurchaseOrderDetail = lazy(() => import("./pages/inventory/InventoryPurchaseOrderDetail"));
const InventoryInvoices = lazy(() => import("./pages/inventory/InventoryInvoices"));
const InventoryInvoiceDetail = lazy(() => import("./pages/inventory/InventoryInvoiceDetail"));
const InventoryStock = lazy(() => import("./pages/inventory/InventoryStock"));
const InventoryAdjustments = lazy(() => import("./pages/inventory/InventoryAdjustments"));
const InventoryLedger = lazy(() => import("./pages/inventory/InventoryLedger"));
const ClinicMemberships = lazy(() => import("./pages/memberships/ClinicMemberships"));
const DoctorActivityLogs = lazy(() => import("./pages/DoctorActivityLogs"));
const ReceptionistActivityLogs = lazy(() => import("./pages/ReceptionistActivityLogs"));
const DoctorReceptionistActivityLogs = lazy(() => import("./pages/DoctorReceptionistActivityLogs"));
const AdminContentWriters = lazy(() => import("./pages/AdminContentWriters"));
const ContentWriterDashboard = lazy(() => import("./pages/ContentWriterDashboard"));
const ContentWriterBlogs = lazy(() => import("./pages/ContentWriterBlogs"));
const ContentWriterDoctors = lazy(() => import("./pages/ContentWriterDoctors"));
const ContentWriterRegisteredDoctors = lazy(() => import("./pages/ContentWriterRegisteredDoctors"));
const FindDoctors = lazy(() => import("./pages/FindDoctors"));
const DoctorsBySpecialty = lazy(() => import("./pages/DoctorsBySpecialty"));
const PublicDoctorProfile = lazy(() => import("./pages/PublicDoctorProfile"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ServiceStatus = lazy(() => import("./pages/ServiceStatus"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const PatientVideoCall = lazy(() => import("./pages/PatientVideoCall"));
const MobileHome = lazy(() => import("./pages/app/MobileHome"));
const MobileAppointments = lazy(() => import("./pages/app/MobileAppointments"));
const MobilePatients = lazy(() => import("./pages/app/MobilePatients"));
const MobilePatientDetail = lazy(() => import("./pages/app/MobilePatientDetail"));
const MobileReports = lazy(() => import("./pages/app/MobileReports"));
const MobileMore = lazy(() => import("./pages/app/MobileMore"));
const MobileFinance = lazy(() => import("./pages/app/MobileFinance"));
const MobileWalkIn = lazy(() => import("./pages/app/MobileWalkIn"));
const MobileSchedule = lazy(() => import("./pages/app/MobileSchedule"));
const MobileTemplates = lazy(() => import("./pages/app/MobileTemplates"));
const MobileAllergies = lazy(() => import("./pages/app/MobileAllergies"));
const MobileDiseases = lazy(() => import("./pages/app/MobileDiseases"));
const MobileICDCodes = lazy(() => import("./pages/app/MobileICDCodes"));
const MobileProcedures = lazy(() => import("./pages/app/MobileProcedures"));
const MobileReceptionists = lazy(() => import("./pages/app/MobileReceptionists"));
const MobileActivityLogs = lazy(() => import("./pages/app/MobileActivityLogs"));
const MobileProfile = lazy(() => import("./pages/app/MobileProfile"));
const MobileSubscription = lazy(() => import("./pages/app/MobileSubscription"));
const MobileSupport = lazy(() => import("./pages/app/MobileSupport"));
const MobileDoctors = lazy(() => import("./pages/app/MobileDoctors"));
const MobileDoctorSchedules = lazy(() => import("./pages/app/MobileDoctorSchedules"));
const MobileExpenses = lazy(() => import("./pages/app/MobileExpenses"));
const MobileSpecializations = lazy(() => import("./pages/app/MobileSpecializations"));
import Layout from "./components/Layout";
const NotFound = lazy(() => import("./pages/NotFound"));
import ScrollToTop from "./components/ScrollToTop";
import StandaloneRedirect from "./components/StandaloneRedirect";
import PortalPageTitle from "./components/PortalPageTitle";
import { IdleLogoutWatcher } from "./lib/idleLogout";
import LegacyDoctorRedirect from "./components/public/LegacyDoctorRedirect";
import { RegionProvider } from "./contexts/RegionContext";

// Shown while a page's code downloads (pages load on demand to keep the first load small).
const PageLoading = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="zonoir-theme">
    <GeoLocationProvider>
      <RegionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <PortalPageTitle />
          <IdleLogoutWatcher />
          <StandaloneRedirect />
          <FloatingWhatsApp />
          <PublicDoctorFinderChat />
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<AppHomeGate><Index /></AppHomeGate>} />
          <Route path="/demo-landing" element={<MarketingRedirect><DemoLanding /></MarketingRedirect>} />
          <Route path="/app" element={<MobileHome />} />
          <Route path="/app/appointments" element={<MobileAppointments />} />
          <Route path="/app/patients" element={<MobilePatients />} />
          <Route path="/app/patients/:id" element={<MobilePatientDetail />} />
          <Route path="/app/reports" element={<MobileReports />} />
          <Route path="/app/more" element={<MobileMore />} />
          <Route path="/app/finance" element={<MobileFinance />} />
          <Route path="/app/walk-in" element={<MobileWalkIn />} />
          <Route path="/app/schedule" element={<MobileSchedule />} />
          <Route path="/app/templates" element={<MobileTemplates />} />
          <Route path="/app/allergies" element={<MobileAllergies />} />
          <Route path="/app/diseases" element={<MobileDiseases />} />
          <Route path="/app/icd-codes" element={<MobileICDCodes />} />
          <Route path="/app/procedures" element={<MobileProcedures />} />
          <Route path="/app/receptionists" element={<MobileReceptionists />} />
          <Route path="/app/activity-logs" element={<MobileActivityLogs />} />
          <Route path="/app/profile" element={<MobileProfile />} />
          <Route path="/app/subscription" element={<MobileSubscription />} />
          <Route path="/app/support" element={<MobileSupport />} />
          <Route path="/app/doctors" element={<MobileDoctors />} />
          <Route path="/app/doctor-schedules" element={<MobileDoctorSchedules />} />
          <Route path="/app/expenses" element={<MobileExpenses />} />
          <Route path="/app/specializations" element={<MobileSpecializations />} />
          <Route path="/features" element={<MarketingRedirect><Features /></MarketingRedirect>} />
          <Route path="/contact" element={<MarketingRedirect><Contact /></MarketingRedirect>} />
          <Route path="/pricing" element={<MarketingRedirect><Pricing /></MarketingRedirect>} />
          <Route path="/clinic-management-software" element={<MarketingRedirect><ClinicManagementSoftware /></MarketingRedirect>} />
          <Route path="/clinic-management-system-guide" element={<MarketingRedirect><ClinicManagementSystemGuide /></MarketingRedirect>} />
          <Route path="/clinic-software-small-practices" element={<MarketingRedirect><ClinicSoftwareSmallPractices /></MarketingRedirect>} />
          <Route path="/reviews" element={<MarketingRedirect><Reviews /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-lahore" element={<MarketingRedirect><CityLahore /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-karachi" element={<MarketingRedirect><CityKarachi /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-islamabad" element={<MarketingRedirect><CityIslamabad /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-rawalpindi" element={<MarketingRedirect><CityRawalpindi /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-faisalabad" element={<MarketingRedirect><CityFaisalabad /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-multan" element={<MarketingRedirect><CityMultan /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-peshawar" element={<MarketingRedirect><CityPeshawar /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-quetta" element={<MarketingRedirect><CityQuetta /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-sialkot" element={<MarketingRedirect><CitySialkot /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-gujranwala" element={<MarketingRedirect><CityGujranwala /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-hyderabad" element={<MarketingRedirect><CityHyderabad /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-bahawalpur" element={<MarketingRedirect><CityBahawalpur /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-sargodha" element={<MarketingRedirect><CitySargodha /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-sukkur" element={<MarketingRedirect><CitySukkur /></MarketingRedirect>} />
          <Route path="/emr-software-for-doctors-in-abbottabad" element={<MarketingRedirect><CityAbbottabad /></MarketingRedirect>} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} /> {/* zonoir.com sends the knowledge base here; redirecting back made a blank loop */}
          <Route path="/knowledge-base/:slug" element={<KnowledgeBaseArticle />} />
          <Route path="/doctor/knowledge-base" element={<Layout><KBEmbeddedProvider><KnowledgeBase /></KBEmbeddedProvider></Layout>} />
          <Route path="/doctor/knowledge-base/:slug" element={<Layout><KBEmbeddedProvider><KnowledgeBaseArticle /></KBEmbeddedProvider></Layout>} />
          <Route path="/clinic/knowledge-base" element={<Layout><KBEmbeddedProvider><KnowledgeBase /></KBEmbeddedProvider></Layout>} />
          <Route path="/clinic/knowledge-base/:slug" element={<Layout><KBEmbeddedProvider><KnowledgeBaseArticle /></KBEmbeddedProvider></Layout>} />
          <Route path="/referral-program" element={<MarketingRedirect><ReferralProgram /></MarketingRedirect>} />
          <Route path="/find-doctors" element={<FindDoctors />} />
          <Route path="/doctors/:specialty" element={<DoctorsBySpecialty />} />
          <Route path="/doctors/:specialty/:doctorSlug" element={<PublicDoctorProfile />} />
          <Route path="/doctors/:city/:specialty/:doctorSlug" element={<LegacyDoctorRedirect />} />
          <Route path="/doctors/:country/:city/:specialty/:doctorSlug" element={<LegacyDoctorRedirect />} />
          <Route path="/referral-partner/login" element={<ReferralPartnerAuth />} />
          <Route path="/referral-partner/dashboard" element={<ReferralPartnerDashboard />} />
          <Route path="/blog" element={<MarketingRedirect><Blogs /></MarketingRedirect>} />
          <Route path="/blog/:slug" element={<MarketingRedirect><BlogPost /></MarketingRedirect>} />
          <Route path="/privacy-policy" element={<MarketingRedirect><PrivacyPolicy /></MarketingRedirect>} />
          <Route path="/terms-of-service" element={<MarketingRedirect><TermsOfService /></MarketingRedirect>} />
          <Route path="/service-status" element={<MarketingRedirect><ServiceStatus /></MarketingRedirect>} />
          <Route path="/install" element={<MarketingRedirect><InstallApp /></MarketingRedirect>} />
          <Route path="/install-app" element={<MarketingRedirect><InstallApp /></MarketingRedirect>} />
          <Route path="/video-call" element={<PatientVideoCall />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/queue" element={<QueueDisplay />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/verify/:code" element={<VerifyCertificate />} />
          <Route path="/intake/:token" element={<IntakeForm />} />
          <Route path="/doctor-auth" element={<SignUp />} />
          <Route path="/auth" element={<SignUp />} />
          <Route path="/receptionist-auth" element={<ReceptionistAuth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
              path="/doctor/appointments/:id"
              element={
                <Layout>
                  <KeyedByParam><DoctorAppointmentDetail /></KeyedByParam>
                </Layout>
              }
            />
            <Route
              path="/doctor/leads"
              element={
                <Layout>
                  <DoctorLeads />
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
              path="/doctor/medicines"
              element={
                <Layout>
                  <DoctorMedicines />
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
              element={<Navigate to="/doctor/reports?tab=money" replace />}
            />
            <Route
              path="/doctor/reports"
              element={
                <Layout>
                  <ReportsHub scope="doctor" />
                </Layout>
              }
            />
            <Route
              path="/doctor/summary"
              element={<Navigate to="/doctor/reports?tab=today" replace />}
            />
            <Route
              path="/doctor/medicine-report"
              element={<Navigate to="/doctor/reports?tab=medicines" replace />}
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
              path="/doctor/schedule"
              element={
                <Layout>
                  <DoctorSchedule />
                </Layout>
              }
            />
            <Route
              path="/doctor/calendar"
              element={
                <Layout>
                  <DoctorCalendar />
                </Layout>
              }
            />
            <Route
              path="/doctor/subscription"
              element={
                <Layout>
                  <DoctorSubscription />
                </Layout>
              }
            />
            <Route
              path="/doctor/receptionists"
              element={
                <Layout>
                  <DoctorReceptionists />
                </Layout>
              }
            />
            <Route
              path="/doctor/activity-logs"
              element={
                <Layout>
                  <DoctorActivityLogs />
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
              path="/admin/feedback"
              element={
                <Layout>
                  <AdminFeedback />
                </Layout>
              }
            />
            <Route
              path="/admin/chatbot-leads"
              element={
                <Layout>
                  <AdminChatbotLeads />
                </Layout>
              }
            />
            <Route
              path="/admin/referral-partners"
              element={
                <Layout>
                  <AdminReferralPartners />
                </Layout>
              }
            />
            <Route
              path="/admin/content-writers"
              element={
                <Layout>
                  <AdminContentWriters />
                </Layout>
              }
            />
            {/* Content Writer Routes */}
            <Route
              path="/content-writer/dashboard"
              element={
                <Layout>
                  <ContentWriterDashboard />
                </Layout>
              }
            />
            <Route
              path="/content-writer/blogs"
              element={<Navigate to="/content-writer/dashboard" replace />}
            />
            <Route
              path="/content-writer/doctors"
              element={
                <Layout>
                  <ContentWriterDoctors />
                </Layout>
              }
            />
            <Route
              path="/content-writer/registered-doctors"
              element={
                <Layout>
                  <ContentWriterRegisteredDoctors />
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
              path="/clinic/appointments/:id"
              element={
                <Layout>
                  <KeyedByParam><ClinicAppointmentDetail /></KeyedByParam>
                </Layout>
              }
            />
            <Route
              path="/clinic/leads"
              element={
                <Layout>
                  <ClinicLeads />
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
              element={<Navigate to="/clinic/reports?tab=money" replace />}
            />
            <Route
              path="/clinic/reports"
              element={
                <Layout>
                  <ReportsHub scope="clinic" />
                </Layout>
              }
            />
            <Route
              path="/clinic/expenses"
              element={<Navigate to="/clinic/reports?tab=expenses" replace />}
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
              path="/clinic/medicines"
              element={
                <Layout>
                  <ClinicMedicines />
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
            <Route
              path="/clinic/schedules"
              element={
                <Layout>
                  <ClinicDoctorSchedules />
                </Layout>
              }
            />
            <Route
              path="/clinic/subscription"
              element={
                <Layout>
                  <ClinicSubscription />
                </Layout>
              }
            />
            <Route
              path="/clinic/activity-logs"
              element={
                <Layout>
                  <ClinicActivityLogs />
                </Layout>
              }
            />
            {/* Inventory routes (clinic owner + receptionist share) */}
            <Route path="/clinic/inventory" element={<Layout><InventoryDashboard /></Layout>} />
            <Route path="/clinic/inventory/suppliers" element={<Layout><InventorySuppliers /></Layout>} />
            <Route path="/clinic/inventory/products" element={<Layout><InventoryProducts /></Layout>} />
            <Route path="/clinic/inventory/purchase-orders" element={<Layout><InventoryPurchaseOrders /></Layout>} />
            <Route path="/clinic/inventory/purchase-orders/:id" element={<Layout><InventoryPurchaseOrderDetail /></Layout>} />
            <Route path="/clinic/inventory/invoices" element={<Layout><InventoryInvoices /></Layout>} />
            <Route path="/clinic/inventory/invoices/:id" element={<Layout><InventoryInvoiceDetail /></Layout>} />
            <Route path="/clinic/inventory/stock" element={<Layout><InventoryStock /></Layout>} />
            <Route path="/clinic/inventory/adjustments" element={<Layout><InventoryAdjustments /></Layout>} />
            <Route path="/clinic/inventory/ledger" element={<Layout><InventoryLedger /></Layout>} />
            <Route path="/clinic/memberships" element={<Layout><ClinicMemberships /></Layout>} />
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
              path="/receptionist/appointments/:id"
              element={
                <Layout>
                  <KeyedByParam><ClinicAppointmentDetail /></KeyedByParam>
                </Layout>
              }
            />
            <Route
              path="/receptionist/leads"
              element={
                <Layout>
                  <ClinicLeads />
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
              path="/receptionist/expenses"
              element={
                <Layout>
                  <ClinicExpenses />
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
              path="/receptionist/schedules"
              element={
                <Layout>
                  <ClinicDoctorSchedules readOnly />
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
            <Route
              path="/receptionist/activity-logs"
              element={
                <Layout>
                  <ReceptionistActivityLogs />
                </Layout>
              }
            />
            {/* Doctor Receptionist Routes */}
            <Route
              path="/doctor-receptionist/dashboard"
              element={
                <Layout>
                  <DoctorReceptionistDashboard />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/patients"
              element={
                <Layout>
                  <DoctorReceptionistPatients />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/patients/:id"
              element={
                <Layout>
                  <DoctorReceptionistPatientDetail />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/appointments"
              element={
                <Layout>
                  <DoctorReceptionistAppointments />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/walk-in"
              element={
                <Layout>
                  <DoctorReceptionistWalkIn />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/waitlist"
              element={
                <Layout>
                  <DoctorReceptionistWaitlist />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/allergies"
              element={
                <Layout>
                  <DoctorReceptionistAllergies />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/diseases"
              element={
                <Layout>
                  <DoctorReceptionistDiseases />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/icd-codes"
              element={
                <Layout>
                  <DoctorReceptionistICDCodes />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/procedures"
              element={
                <Layout>
                  <DoctorReceptionistProcedures />
                </Layout>
              }
            />
            <Route
              path="/doctor-receptionist/activity-logs"
              element={
                <Layout>
                  <DoctorReceptionistActivityLogs />
                </Layout>
              }
            />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
      </RegionProvider>
    </GeoLocationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
