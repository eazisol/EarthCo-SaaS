import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./assets/css/style.css";
import "./assets/css/bootstrap-select.min.css";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import DashBoard from "./components/DashBoard";
import CustomerIndex from "./components/Customers/CustomerIndex";
import EstimateIndex from "./components/Estimates/EstimateIndex";
import CustomersTable from "./components/Customers/CustomersTable";
import AddCutomer from "./components/Customers/AddCutomer";
import UpdateCustomer from "./components/Customers/UpdateCustomer";
import ServiceIndex from "./components/ServiceRequest/ServiceIndex";
import IrrigationIndex from "./components/Irrigation/IrrigationIndex";
import IrrigationForm from "./components/Irrigation/IrrigationForm";
import Irrigationlist from "./components/Irrigation/Irrigationlist";
import Audit from "./components/Reports/Audit";
import PunchListIndex from "./components/PunchLists/PunchListIndex";
import PunchlistPreview from "./components/PunchLists/PunchlistPreview";
import SummaryReport from "./components/Reports/SummaryReport";
import ProposalSummary from "./components/Reports/ProposalSummary";
import WeeklyReportIndex from "./components/Reports/WeeklyReport/WeeklyReportIndex";
import WeeklyReportlist from "./components/Reports/WeeklyReport/WeeklyReportlist";
import AddWRform from "./components/Reports/WeeklyReport/AddWRform";
import WeeklyReport from "./components/Reports/WeeklyReport/WeeklyReport";
import LandscapeIndex from "./components/Landscape/LandscapeIndex";
import Landscapelist from "./components/Landscape/Landscapelist";
import LandscapeForm from "./components/Landscape/LandscapeForm";
import Landscape from "./components/Landscape/Landscape";
import { useContext, useEffect, useState } from "react";
import { RoutingContext } from "./context/RoutesContext";
import ServiceRequest from "./components/ServiceRequest/ServiceRequest";
import UpdateSRForm from "./components/ServiceRequest/UpdateSRForm";
import SRlist from "./components/ServiceRequest/SRlist";
import EstimateList from "./components/Estimates/EstimateList";
import EstimateIDopen from "./components/Estimates/EstimateIDopen";
import AddEstimate from "./components/Estimates/AddEstimate";
import MapIndex from "./components/Map/MapIndex";
import AddSRform from "./components/ServiceRequest/AddSRform";
import StaffIndex from "./components/Staff/StaffIndex";
import StaffList from "./components/Staff/StaffList";
import AddStaff from "./components/Staff/AddStaff";
import ErrorPage from "./pages/ErrorPage";
import ResetPassword from "./pages/ResetPassword";
import EstimatePreview from "./components/Estimates/EstimatePreview";
import PurchaseOrder from "./components/PurchaseOrder/PurchaseOrder";
import PurchaseOrderIndex from "./components/PurchaseOrder/PurchaseOrderIndex";
import { AddPO } from "./components/PurchaseOrder/AddPO";
import Invoices from "./components/Invoice/Invoices";
import InvoiceIndex from "./components/Invoice/InvoiceIndex";
import AddInvioces from "./components/Invoice/AddInvioces";
import Bills from "./components/Bill/Bills";
import { EstimateProvider } from "./context/EstimateContext";
import SRPreview from "./components/ServiceRequest/SRPreview";
import POPreview from "./components/PurchaseOrder/POPreview";
import InvoicePreview from "./components/Invoice/InvoicePreview";
import BillIndex from "./components/Bill/BillIndex";
import BillPreview from "./components/Bill/BillPreview";
import AddBill from "./components/Bill/AddBill";
import UpdateEstimateForm from "./components/Estimates/UpdateEstimateForm";
import SummaryReportPreview from "./components/Reports/SummaryReportPreview";
import Items from "./components/Items/Items";
import AddItem from "./components/Items/AddItem";
import ItemIndex from "./components/Items/ItemIndex";
import GenralReport from "./components/Reports/GenralReport";
import SendMail from "./components/Reports/SendMail";
import AddRisingCanes from "./components/Reports/WeeklyReport/RisingCanes/AddRisingCanes";
import RisingCaneTable from "./components/Reports/WeeklyReport/RisingCanes/RisingCaneTable";
import RisingCanesPreview from "./components/Reports/WeeklyReport/RisingCanes/RisingCanesPreview";
import PunchListPhotoOnly from "./components/PunchListPhotoOnly/PunchListPhotoOnly";
import AddPLPhotoOnly from "./components/PunchListPhotoOnly/AddPLPhotoOnly";
import PLPhotoOnlyPreview from "./components/PunchListPhotoOnly/PLPhotoOnlyPreview";
import AddVender from "./components/venders/AddVender";
import IrrigationAuditTable from "./components/IrrigationAudit/IrrigationAuditTable";
import AddIrrigationAudit from "./components/IrrigationAudit/AddIrrigationAudit";
import IrrigationAuditPreview from "./components/IrrigationAudit/IrrigationAuditPreview";
import TermsandConditions from "./pages/TermsandConditions";
import Support from "./pages/Support";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CompanySelect from "./pages/CompanySelect";
import WagesTable from "./components/Staff/WagesTable";
import SprayTechPreview from "./components/ServiceRequest/SprayTechPreview";
import SyncLogTable from "./components/SyncLog/SyncLogTable";
import MonthlyGoalsPage from "./components/Staff/MonthlyGoalsPage";
import EstimatePdf from "./components/Estimates/EstimatePdf";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import NotificationPage from "./components/Header/NotificationPage";
import EmailVerification from "./pages/EmailVerification";
import AgingReportTable from "./components/AgingReport/AgingReportTable";
import PaymentsScreen from "./components/Customers/PaymentsScreen";
import KpisDBoard from "./components/Kpis/KpisDBoard";
import AgingReportTableTest from "./AgingReportTableTest";
import SafetyForm from "./components/SafetyForm/SafetyForm";
import SafetyList from "./components/SafetyForm/SafetyList";
import SafetyPreview from "./components/SafetyForm/SafetyPreview";
import JobList from "./components/jobForm/JobList";

import Cookies from "js-cookie";
import { RecurringTable } from "./components/RecurringBilling/recurringTable";
import RecurringInvoices from "./components/recurringInvoices";
import { CreateRecurringTransaction } from "./components/CreateRecurringTransaction";
import { applyCompanyBranding } from "./custom/companyBranding";
import { companyDetail, getCompanySubdomain, STATIC_SUBDOMAIN } from "./API/companydetail";
import { RoleAndPermision } from "./components/roleandpermision";
import { VenderList } from "./components/venders/VenderList";
import { AccountList } from "./components/account";
import AddAccount from "./components/account/AddAccount";
import { ForemanTable } from "./components/Foreman/foremanTable";
import { QCList } from "./components/QCCheckListForeman/QCList";
import { AddQCList } from "./components/QCCheckListForeman/addQCList";
import EstimmateMapScreen from "./components/geofence/estimateScreen";
import { CostCenter } from "./components/geofence/costCenter";
import { GoogleCalendar } from "./components/geofence/googleCalendar";
import RecurringSR from "./components/RecurringSR/RecurringSR";



function App() {
  const { SRroute, estimateRoute } = useContext(RoutingContext);
  useEffect(() => {
    const key = Cookies.get('EstimateAccess');

    // If the cookie doesn't exist, set it to null
    if (!key) {
      Cookies.set('EstimateAccess', null, { expires: 30 }); // Set it to null for 30 days
    }
  }, []);
  useEffect(() => {
   
   
      const getCompanyDetail = async () => {
        const subdomain = getCompanySubdomain();
        const response = await companyDetail(STATIC_SUBDOMAIN);
        applyCompanyBranding(response?.data);
      }
      getCompanyDetail();
    
 
       
    
  }, []);
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <EstimateProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route
                path="/VerifyEmail"
                element={<EmailVerification />}
              />
              <Route
                path="/terms-and-conditions"
                element={<TermsandConditions />}
              />
               <Route
                path="/Support"
                element={<Support />}
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/ResetPassword" element={<ResetPassword />} />

              <Route path="/" element={<DashboardPage />}>
                <Route path="/dashBoard" element={<DashBoard />} />
                <Route path="/kpi-dashboard" element={<KpisDBoard /> } />
                <Route path="/RecurringTable" element={<RecurringTable /> } />

                <Route path="customers" element={<CustomerIndex />}>
                  <Route path="" element={<CustomersTable />} />
                  <Route path="add-customer" element={<AddCutomer />} />
                  <Route path="update-customer" element={<UpdateCustomer />} />
                </Route>
                <Route path="staff/*" element={<StaffIndex />}>
                  <Route path="" element={<StaffList />} />
                  <Route path="add-staff" element={<AddStaff />} />
                </Route>
                <Route path="map" element={<MapIndex />} />
                <Route path="Notifications" element={<NotificationPage />} />
                <Route path="estimates" element={<EstimateIndex />}>
                  <Route path="" element={<EstimateList />} />
                  <Route path="add-estimate" element={<AddEstimate />} />
                  <Route
                    path="update-estimate"
                    element={<UpdateEstimateForm />}
                  />
                  <Route
                    path="estimate-preview"
                    element={<EstimatePreview />}
                  />
                  <Route path={estimateRoute} element={<EstimateIDopen />} />
                </Route>
                <Route path="service-requests/*" element={<ServiceIndex />}>
                  <Route path="" element={<SRlist />} />
                  <Route
                    path="service-request-preview"
                    element={<SRPreview />}
                  />
                  <Route
                    path="spray-tech-preview"
                    element={<SprayTechPreview />}
                  />
                  <Route path="add-sRform" element={<AddSRform />} />
                  <Route path="update-sRform" element={<UpdateSRForm />} />
                  <Route path={SRroute} element={<ServiceRequest />} />
                </Route>
                 <Route path="RecurringSR-list" element={<RecurringSR/>} />

                <Route path="purchase-order/*" element={<PurchaseOrderIndex />}>
                  <Route path="" element={<PurchaseOrder />}>
                    <Route
                      path="purchase-order-preview"
                      element={<POPreview />}
                    />

                    <Route path="add-po" element={<AddPO />}></Route>
                  </Route>
                </Route>
                <Route path="venders" element={<VenderList />} />
                <Route path="add-vender" element={<AddVender />} />
                <Route path="accounts" element={<AccountList />} />
                <Route path="accounts/add-account" element={<AddAccount />} />
                 <Route path="create-recurring-transaction" element={<CreateRecurringTransaction />} />
                {/* <Route path="Bills" element={<Bills />}></Route> */}
                <Route path="bills/*" element={<BillIndex />}>
                  <Route path="" element={<Bills />}></Route>
                  <Route path="add-bill" element={<AddBill />} />
                  <Route path="bill-preview" element={<BillPreview />} />
                </Route>

                <Route path="invoices/*" element={<InvoiceIndex />}>
                  <Route path="" element={<Invoices />}></Route>
                  <Route path="add-invoices" element={<AddInvioces />}></Route>
                  <Route path="invoice-preview" element={<InvoicePreview />} />
                </Route>
                <Route path="recurring-invoices/*" element={<RecurringInvoices />}>
                  <Route path="" element={<Invoices />}></Route>
                  <Route path="add-invoices" element={<AddInvioces />}></Route>
                  <Route path="invoice-preview" element={<InvoicePreview />} />
                </Route>
             
                <Route path="items/*" element={<ItemIndex />}>
                  <Route path="" element={<Items />} />
                  <Route path="add-item" element={<AddItem />} />
                </Route>

                <Route path="irrigation" element={<IrrigationIndex />}>
                  <Route path="" element={<Irrigationlist />} />
                  <Route path="add-irrigation" element={<IrrigationForm />} />
                </Route>
                <Route path="irrigation/audit-report" element={<Audit />} />
                <Route path="punchlist" element={<PunchListIndex />} />
                <Route path="summary-report" element={<SummaryReport />} />
                <Route path="PunchlistPreview" element={<PunchlistPreview />} />
                <Route
                  path="summary-report-preview"
                  element={<SummaryReportPreview />}
                />
                <Route path="general-report" element={<GenralReport />} />
                <Route path="/company-select" element={<CompanySelect />} />
                <Route path="/wages" element={<WagesTable />} />
                <Route path="/monthly-goals" element={<MonthlyGoalsPage />} />
                <Route path="/Sync-log" element={<SyncLogTable />} />

                <Route path="/aging-report" element={<AgingReportTable />} />
                <Route path="/Payment" element={<PaymentsScreen />} />

                <Route path="proposal-summary" element={<ProposalSummary />} />
                <Route path="weekly-reports" element={<WeeklyReportIndex />}>
                  <Route path="" element={<WeeklyReportlist />} />
                  <Route
                    path="weekly-report-preview"
                    element={<WeeklyReport />}
                  />
                  <Route path="add-weekly-report" element={<AddWRform />} />
                </Route>
                <Route path="landscape" element={<LandscapeIndex />}>
                  <Route path="" element={<Landscapelist />} />
                  <Route path="add-landscape" element={<LandscapeForm />} />
                </Route>
               
                <Route path="safety-reports/list" element={<SafetyList />} />
                <Route path="safety-reports/add" element={<SafetyForm/>} />

                  <Route path="safety-reports/preview" element={<SafetyPreview />} />

                  <Route path="job/list" element={<JobList/>} />
                  <Route path="role-and-permision" element={<RoleAndPermision />} />
                  <Route path="foreman" element={<ForemanTable/>} />
                  <Route path="qc-list" element={<QCList/>} />
                  <Route path="qc-checklist-foreman/add" element={<AddQCList/>} />
                <Route
                  path="landscape/landscape-report"
                  element={<Landscape />}
                />
                <Route path="send-mail" element={<SendMail />} />
                <Route
                  path="weekly-reports/add-rising-canes"
                  element={<AddRisingCanes />}
                />
                <Route
                  path="weekly-reports/rising-canes"
                  element={<RisingCaneTable />}
                />
               
                <Route
                  path="weekly-reports/rising-canes-preview"
                  element={<RisingCanesPreview />}
                />
               <Route path="safety-reports/preview" element={<SafetyPreview />} />
                <Route
                  path="punchList-photos-only"
                  element={<PunchListPhotoOnly />}
                />
                <Route
                  path="punchList-photos-only/add"
                  element={<AddPLPhotoOnly />}
                />
                <Route
                  path="punchList-photos-only/preview"
                  element={<PLPhotoOnlyPreview />}
                />

                <Route path="venders/list" element={<VenderList />} />
                <Route path="venders/add-vender" element={<AddVender />} />

                <Route
                  path="irrigation-audit"
                  element={<IrrigationAuditTable />}
                />
                <Route
                  path="irrigation-audit/add"
                  element={<AddIrrigationAudit />}
                />
                <Route
                  path="irrigation-audit/preview"
                  element={<IrrigationAuditPreview />}
                />
                <Route path="testpdf" element={<AgingReportTableTest />} />
              
                <Route path="estimate-map" element={<EstimmateMapScreen />} />
                <Route path="cost-center" element={<CostCenter />} />
                <Route path="booking-calendar" element={<GoogleCalendar />} />
              </Route>
              <Route path="*" element={<ErrorPage />} />
              
            </Routes>
            {/* <DataFun>
          <DashboardPage />
        </DataFun> */}
          </BrowserRouter>
        </EstimateProvider>
      </DndProvider>
    </>
  );
}

export default App;
