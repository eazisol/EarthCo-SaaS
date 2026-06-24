import React, { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import DashBoard from "../components/DashBoard";
import HeaderExp from "../components/Header/HeaderExp";
import SideBar from "../components/SideBar/SideBar";
import Footer from "../components/Footer";
import CustomerIndex from "../components/Customers/CustomerIndex";
import EstimateIndex from "../components/Estimates/EstimateIndex";
import ServiceIndex from "../components/ServiceRequest/ServiceIndex";
import UpdateSRForm from "../components/ServiceRequest/UpdateSRForm";
import IrrigationIndex from "../components/Irrigation/IrrigationIndex";
import CustomersTable from "../components/Customers/CustomersTable";
import AddCutomer from "../components/Customers/AddCutomer";
import UpdateCustomer from "../components/Customers/UpdateCustomer";
import Irrigationlist from "../components/Irrigation/Irrigationlist";
import IrrigationForm from "../components/Irrigation/IrrigationForm";
import Audit from "../components/Reports/Audit";
import PunchListIndex from "../components/PunchLists/PunchListIndex";
import PunchlistPreview from "../components/PunchLists/PunchlistPreview";
import SummaryReport from "../components/Reports/SummaryReport";
import ProposalSummary from "../components/Reports/ProposalSummary";
import WeeklyReportIndex from "../components/Reports/WeeklyReport/WeeklyReportIndex";
import WeeklyReportlist from "../components/Reports/WeeklyReport/WeeklyReportlist";
import WeeklyReport from "../components/Reports/WeeklyReport/WeeklyReport";
import AddWRform from "../components/Reports/WeeklyReport/AddWRform";
import LandscapeIndex from "../components/Landscape/LandscapeIndex";
import Landscapelist from "../components/Landscape/Landscapelist";
import LandscapeForm from "../components/Landscape/LandscapeForm";
import Landscape from "../components/Landscape/Landscape";
import ServiceRequest from "../components/ServiceRequest/ServiceRequest";
import { RoutingContext } from "../context/RoutesContext";
import SRlist from "../components/ServiceRequest/SRlist";
import EstimateList from "../components/Estimates/EstimateList";
import EstimateIDopen from "../components/Estimates/EstimateIDopen";
import AddEstimate from "../components/Estimates/AddEstimate";
import MapIndex from "../components/Map/MapIndex";
import AddSRform from "../components/ServiceRequest/AddSRform";
import StaffIndex from "../components/Staff/StaffIndex";
import StaffList from "../components/Staff/StaffList";
import AddStaff from "../components/Staff/AddStaff";
import CustomerData from "../context/CustomerData";
import PurchaseOrder from "../components/PurchaseOrder/PurchaseOrder";
import { AddPO } from "../components/PurchaseOrder/AddPO";
import PurchaseOrderIndex from "../components/PurchaseOrder/PurchaseOrderIndex";
import AddItem from "../components/Items/AddItem";
import Bills from "../components/Bill/Bills";
import Invoices from "../components/Invoice/Invoices";
import InvoiceIndex from "../components/Invoice/InvoiceIndex";
import AddInvioces from "../components/Invoice/AddInvioces";
import Items from "../components/Items/Items";
import Cookies from "js-cookie";
import EstimatePreview from "../components/Estimates/EstimatePreview";
import SRPreview from "../components/ServiceRequest/SRPreview";
import POPreview from "../components/PurchaseOrder/POPreview";
import InvoicePreview from "../components/Invoice/InvoicePreview";
import BillPreview from "../components/Bill/BillPreview";
import BillIndex from "../components/Bill/BillIndex";
import AddBill from "../components/Bill/AddBill";
import UpdateEstimateForm from "../components/Estimates/UpdateEstimateForm";
import SummaryReportPreview from "../components/Reports/SummaryReportPreview";
import { DataContext } from "../context/AppData";
import ItemIndex from "../components/Items/ItemIndex";
import GenralReport from "../components/Reports/GenralReport";
import SendMail from "../components/Reports/SendMail.js";
import AddRisingCanes from "../components/Reports/WeeklyReport/RisingCanes/AddRisingCanes.js";
import RisingCaneTable from "../components/Reports/WeeklyReport/RisingCanes/RisingCaneTable.js";
import RisingCanesPreview from "../components/Reports/WeeklyReport/RisingCanes/RisingCanesPreview.js";
import PLPhotoOnlyPreview from "../components/PunchListPhotoOnly/PLPhotoOnlyPreview.js";
import PunchListPhotoOnly from "../components/PunchListPhotoOnly/PunchListPhotoOnly.js";
import AddPLPhotoOnly from "../components/PunchListPhotoOnly/AddPLPhotoOnly.js";
import IrrigationAuditTable from "../components/IrrigationAudit/IrrigationAuditTable.js";
import AddIrrigationAudit from "../components/IrrigationAudit/AddIrrigationAudit.js";
import IrrigationAuditPreview from "../components/IrrigationAudit/IrrigationAuditPreview.js";
import CompanySelect from "./CompanySelect.js";
import WagesTable from "../components/Staff/WagesTable.js";
import SprayTechPreview from "../components/ServiceRequest/SprayTechPreview.js";
import { useLocation } from "react-router-dom";
import SyncLogTable from "../components/SyncLog/SyncLogTable.js";
import MonthlyGoalsPage from "../components/Staff/MonthlyGoalsPage.js";
import EstimatePdf from "../components/Estimates/EstimatePdf.js";
import NotificationPage from "../components/Header/NotificationPage.js";
import AgingReportTable from "../components/AgingReport/AgingReportTable.js";
import PaymentsScreen from "../components/Customers/PaymentsScreen.js";
import KpisDBoard from "../components/Kpis/KpisDBoard.js";
import AgingReportTableTest from "../AgingReportTableTest.js";
import SafetyForm from "../components/SafetyForm/SafetyForm.js";
import SafetyList from "../components/SafetyForm/SafetyList.js";
import SafetyPreview from "../components/SafetyForm/SafetyPreview.js";
import { useIsAuthorized } from "../components/Header/utills.js";
import JobList from "../components/jobForm/JobList.js";
import { RecurringTable } from "../components/RecurringBilling/recurringTable.js";
import RecurringInvoices from "../components/recurringInvoices/index.js";
import { CreateRecurringTransaction } from "../components/CreateRecurringTransaction.js";
import { RoleAndPermision } from "../components/roleandpermision/index.js";
import { VenderList } from "../components/venders/VenderList";
import AddVender from "../components/venders/AddVender";
import { AccountList } from "../components/account";
import AddAccount from "../components/account/AddAccount.js";

import { ForemanTable } from "../components/Foreman/foremanTable.js";
import { QCList } from "../components/QCCheckListForeman/QCList.js";
import { AddQCList } from "../components/QCCheckListForeman/addQCList.js";
import EstimmateMapScreen from "../components/geofence/estimateScreen.js";
import { CostCenter } from "../components/geofence/costCenter.js";
import { GoogleCalendar } from "../components/geofence/googleCalendar.js";
import RecurringSR from "../components/RecurringSR/RecurringSR.js";
const DashboardPage = () => {
  const { SRroute, estimateRoute } = useContext(RoutingContext);
  const { toggleFullscreen, setLoggedInUser, loggedInUser } = useContext(DataContext);

  const location = useLocation();

  const token = Cookies.get("token");

  const navigate = useNavigate();


  useIsAuthorized([1, 4, 5, 6])


  useEffect(() => {
    const segments = location.pathname.split("/");
    const lastSegment = segments[1]; // Extracting the last segment value from the URL

    // Capitalize the last segment for better readability
    const capitalizedSegment =
      lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

    document.title = `${capitalizedSegment}`;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        document.title = "EarthCo";
      } else {
        document.title = `${capitalizedSegment} - EarthCo`;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname]);
  const isEstimatePreviewRoute =
    window.location.pathname.includes("estimate-preview");
  const isSRPreviewRoute = window.location.pathname.includes(
    "service-request-preview"
  );
  const isSTPreviewRoute =
    window.location.pathname.includes("spray-tech-preview");
  const isBillPreviewRoute = window.location.pathname.includes("bill-preview");
  const isInvoicePreviewRoute =
    window.location.pathname.includes("invoice-preview");
  const isPOPreviewRoute = window.location.pathname.includes(
    "purchase-order-preview"
  );

  const isIrrPreviewRoute = window.location.pathname.includes("audit-report");
  const isSummeryPreviewRoute = window.location.pathname.includes(
    "summary-report-preview"
  );
  const isProposalPreviewRoute =
    window.location.pathname.includes("proposal-summary");
  const isLandscapPreviewRoute =
    window.location.pathname.includes("landscape-report");
  const isWeeklyReportPreviewRoute = window.location.pathname.includes(
    "weekly-report-preview"
  );
  const isGenetalReportPreviewRoute =
    window.location.pathname.includes("general-report");
  const isPLPreviewRoute = window.location.pathname.includes(
    "PunchlistPreview" || "punchList-photos-only/preview"
  );

  const isPLphotosPreviewRoute = window.location.pathname.includes(
    "punchList-photos-only/preview"
  );

  const isWeeklyReportRisingCanesRoute = window.location.pathname.includes(
    "weekly-reports/rising-canes-preview"
  );
  const isIrrigationAuditPreviewRoute = window.location.pathname.includes(
    "irrigation-audit/preview"
  );
  const safetyRatingPreview = window.location.pathname.includes(
    "safety-reports/preview"
  );

  const isCompanySelectRoute =
    window.location.pathname.includes("company-select");

  const isPreview =
    !isEstimatePreviewRoute &&
    !isSRPreviewRoute &&
    !isBillPreviewRoute &&
    !isInvoicePreviewRoute &&
    !isPOPreviewRoute &&
    !isIrrPreviewRoute &&
    !isSummeryPreviewRoute &&
    !isProposalPreviewRoute &&
    !isLandscapPreviewRoute &&
    !isWeeklyReportPreviewRoute &&
    !isPLPreviewRoute &&
    !isWeeklyReportRisingCanesRoute &&
    !isPLphotosPreviewRoute &&
    !isIrrigationAuditPreviewRoute &&
    !isSTPreviewRoute &&
    !isCompanySelectRoute &&
    !isGenetalReportPreviewRoute &&
    !safetyRatingPreview

  useEffect(() => {
    if (!token && isPreview) {
      navigate("/");
      return;
    }
    setLoggedInUser({
      userName: Cookies.get("userName"),
      userEmail: Cookies.get("userEmail"),
      userRole: Cookies.get("userRole"),
      userId: Cookies.get("userId"),
      CompanyName: Cookies.get("CompanyName"),
      CompanyId: Cookies.get("CompanyId"),
      RefreshToken: Cookies.get("RefreshToken"),
      ProviderToken:
        Cookies.get("ProviderToken") == "null"
          ? null
          : Cookies.get("ProviderToken"),
      UserEmailGoogle: Cookies.get("UserEmailGoogle"),
    });
  }, []);

  return (
    <>
      {token || !isPreview ? (
        <>
          {toggleFullscreen && isPreview && !isCompanySelectRoute && (
            <HeaderExp />
          )}
          {toggleFullscreen && isPreview && !isCompanySelectRoute && (
            <SideBar />
          )}

          <div
            className={
              toggleFullscreen && isPreview
                ? "content-body"
                : "print-body-color"
            }
            id="contentBody"
            onClick={() => {


              if (!Cookies.get("token")) {
                navigate("/");
              }
            }}
          >
            <Routes>
              <Route path="/dashBoard" element={<DashBoard />} />
              <Route path="/kpi-dashboard" element={<KpisDBoard />} />
              <Route path="/RecurringTable" element={<RecurringTable />} />
              <Route
                path="/customers/*"
                element={
                  <CustomerData>
                    <CustomerIndex />
                  </CustomerData>
                }
              >
                <Route path="" element={<CustomersTable />} />
                <Route path="update-customer" element={<UpdateCustomer />} />
                <Route path="add-customer" element={<AddCutomer />} />
               
              
                
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
                <Route path="estimate-preview" element={<EstimatePreview />} />
                <Route path={estimateRoute} element={<EstimateIDopen />} />
              </Route>

              <Route path="service-requests" element={<ServiceIndex />}>
                <Route path="" element={<SRlist />} />
                <Route path="update-sRform" element={<UpdateSRForm />} />
                <Route path="service-request-preview" element={<SRPreview />} />
                <Route
                  path="spray-tech-preview"
                  element={<SprayTechPreview />}
                />
                <Route path="add-sRform" element={<AddSRform />} />
                <Route path={SRroute} element={<ServiceRequest />} />
              </Route>
               <Route path="RecurringSR-list" element={<RecurringSR />} />

              <Route path="purchase-order/*" element={<PurchaseOrderIndex />}>
                <Route path="" element={<PurchaseOrder />}>
                  <Route
                    path="purchase-order-preview"
                    element={<POPreview />}
                  />

                  <Route path="add-po" element={<AddPO />}></Route>
                </Route>
              </Route>

              <Route path="bills/*" element={<BillIndex />}>
                <Route path="" element={<Bills />}></Route>
                <Route path="add-bill" element={<AddBill />} />
                <Route path="bill-preview" element={<BillPreview />} />
              </Route>

              <Route path="invoices/*" element={<InvoiceIndex />}>
                <Route path="" element={<Invoices />}></Route>
                <Route path="invoice-preview" element={<InvoicePreview />} />

                <Route path="add-invoices" element={<AddInvioces />}></Route>
              </Route>
              {/* <Route path="recurring-invoices/*" element={<RecurringInvoices />}>
                <Route path="/recurring-invoices/add-template" element={<AddInvioces />} />
              </Route> */}
              <Route path="recurring-invoices/*" element={<RecurringInvoices />}>
                {/* default list page */}
                <Route index element={<RecurringInvoices />} />

                {/* add-template page, RELATIVE path */}
                <Route path="add-template" element={<AddInvioces />} />
              </Route>
              <Route path="venders/list" element={<VenderList />} />
              <Route path="venders/add-vender" element={<AddVender />} />
              <Route path="accounts" element={<AccountList />} />
              <Route path="accounts/add-account" element={<AddAccount />} />
              <Route path="create-recurring-transaction" element={<CreateRecurringTransaction />} />
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
              <Route path="/aging-report" element={<AgingReportTable />} />
              <Route path="/Payment" element={<PaymentsScreen />} />


              <Route path="/Sync-log" element={<SyncLogTable />} />
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
              <Route path="safety-reports/add" element={<SafetyForm />} />
              <Route path="safety-reports/preview" element={<SafetyPreview />} />

              <Route path="job/list" element={<JobList />} />
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
              <Route path="role-and-permision" element={<RoleAndPermision />} />
              <Route path="estimate-map" element={<EstimmateMapScreen />} />
              <Route path="cost-center" element={<CostCenter />} />
              <Route path="booking-calendar" element={<GoogleCalendar />} />
            </Routes>
          </div>
        </>
      ) : (
        <div className="text-center mt-5">
          <h1>Access is denied</h1>
        </div>
      )}
      {toggleFullscreen && isPreview && <Footer />}
    </>
  );
};

export default DashboardPage;
