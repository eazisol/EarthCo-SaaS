import axios from "axios";
import Cookies from "js-cookie";
import { createContext, useEffect, useState } from "react";
import { baseUrl } from "../apiConfig";
import { companyDetail, getCompanySubdomain, STATIC_SUBDOMAIN } from "../API/companydetail";
import { applyCompanyBranding } from "../custom/companyBranding";

const DataContext = createContext();

const DataFun = ({ children }) => {
  const [singleObj, setSingleObj] = useState();
  const [singleSR, setSingleSR] = useState();
  const [users, setUsers] = [
    {
      fullName: "Admin",
      userName: "Admin",
      email: "admin@gmail.com",
      password: "admin123",
    },
  ];

  const [estimates, setEstimates] = useState([
    {
      estimateID: 1000,
      customerName: "Crest DeVille",
      issuedDate: "7 / 10 / 2023",
      approvedTotal: 4105.0,
      SRstatus: "Open",
      serviceRequest: "Estimate (#",
      QBstatus: "Not Sent",
      status: "Sent",
      notes: "Notes...",
    },
    {
      estimateID: 1001,
      customerName: "Sea Summit",
      issuedDate: "4 / 07 / 2023",
      approvedTotal: 1175.2,
      SRstatus: "Closed",
      serviceRequest: "Estimate (#",
      QBstatus: "Not Sent",
      status: "Sent",
      notes: "Notes...",
    },
    {
      estimateID: 1002,
      customerName: "Bella Palermo",
      issuedDate: "2 / 09 / 2023",
      approvedTotal: 3104.02,
      SRstatus: "Open",
      serviceRequest: "Estimate (#",
      QBstatus: "Not Sent",
      status: "Sent",
      notes: "Notes...",
    },
    {
      estimateID: 1003,
      customerName: "Valmont",
      issuedDate: "7 / 10 / 2023",
      approvedTotal: 3904.02,
      SRstatus: "Open",
      serviceRequest: "Estimate (#",
      QBstatus: "Ready to Send",
      status: "Sent",
      notes: "Notes...",
    },
    {
      estimateID: 1004,
      customerName: "Promenade",
      issuedDate: "2 / 10 / 2023",
      approvedTotal: 2994.02,
      SRstatus: "Closed",
      serviceRequest: "Estimate (#",
      QBstatus: "Not Sent",
      status: "Sent",
      notes: "Notes...",
    },
    {
      estimateID: 1005,
      customerName: "Highland Park",
      issuedDate: "2 / 09 / 2023",
      approvedTotal: 3104.02,
      SRstatus: "Open",
      serviceRequest: "Estimate (#",
      QBstatus: "Not Sent",
      status: "Sent",
      notes: "Notes...",
    },
  ]);

  const [customers, setCustomers] = useState([
    {
      contacts: [
        {
          contactName: "Asad",
          email: "asad@cs.com",
          phone: "57664564",
          mobile: "43258025",
          id: 6236,
        },
      ],
      serviceLocations: [
        {
          adress: {
            adressLine: "Modal Town",
            room: "74",
            city: "Lahore",
            state: "Punjab",
            postalCode: "58006",
            country: "Pakostan",
          },
          name: "Modal Town",
          phone: "57664564",
          fax: "we4553fAs32",
        },
      ],
      customerName: "Asad Arif",
      companyName: "Eazisols",
      title: "Asad",
      description: "Lorem Desc asad",
      adress: {
        adressLine: "MT",
        room: "74",
        city: "Lahore",
        state: "Punjab",
        postalCode: "58006",
        country: "Pakistan",
      },
    },
    {
      contacts: [
        {
          contactName: "Rizwan",
          email: "rizwan@min.com",
          phone: "43534543",
          mobile: "32323",
          id: 7060,
        },
      ],
      serviceLocations: [
        {
          adress: {
            adressLine: "DHA",
            room: "98",
            city: "Lahore",
            state: "Punjab",
            postalCode: "54660",
            country: "Pakistan",
          },
          name: "DHA",
          phone: "7578798",
          fax: "Ri09sscs56",
        },
      ],
      customerName: "Rizwan",
      companyName: "Eazisols",
      title: "Rizz",
      description: "Lorem desc Rizz",
      adress: {
        adressLine: "DHA",
        room: "97",
        city: "Lahore",
        state: "Punjab",
        postalCode: "54660",
        country: "Pakistan",
      },
      userLogin: {
        email: "rizwan@min.com",
        password: "riz123",
      },
    },
  ]);

  const [serviceRequests, setServiceRequest] = useState([
    {
      ID: "SR-1001",
      type: "Monthly Maintainence Report",
      assign: "Vincente, Allan",
      customer: "Sunrise Lane",
      status: "Closed",
      created: "1/17/2014 4:29 PM",
      estimateTotal: 30.0,
      description: "14 IG ROSEMARY PROSTRATA",
      proposalNo: "OC-91014-02",
      workRequested:
        "This proposal is to install Jute for the protection of the bare areas on the slopes.",
    },
    {
      ID: "SR-1002",
      type: "Weekly Maintainence Report",
      assign: "Vincente, Allan",
      customer: "Hillandale Ave",
      status: "Open",
      created: "5/12/2022 4:29 PM",
      estimateTotal: 90.5,
      description: "TREE REMOVAL",
      proposalNo: "OC-910883-09",
      workRequested:
        "This proposal is to trim all the Melelueca and California Pepper trees throughout the community.",
    },
  ]);

  const [contacts, setContacts] = useState([]);

  const [wReportData, setWReportData] = useState([
    {
      id: 742246,
      assign: "Vincente, Allan",
      customer: "Wakeham",
      status: "Closed",
      created: "1/17/2014 4:29 PM",
      estTotal: "$0.00",
      workRequested: "hrthsertae",
    },
  ]);

  const [estimateItems, setEstimateItems] = useState([
    {
      id: "item1",
      name: "05GP",
      qty: 10,
      description: "5 Gallon Plant - Carissa m. Green Carpet",
      rate: 38.0,
      tax: "Non",
    },
  ]);

  const [loggedInUser, setLoggedInUser] = useState({
    userName: Cookies.get("userName"),
    userEmail: Cookies.get("userEmail"),
    userRole: Cookies.get("userRole"),
    userId: Cookies.get("userId"),
    ProviderToken:
      Cookies.get("ProviderToken") == "null"
        ? null
        : Cookies.get("ProviderToken"),
    RefreshToken:
      Cookies.get("RefreshToken") == "null"
        ? null
        : Cookies.get("RefreshToken"),
    UserEmailGoogle: Cookies.get("UserEmailGoogle"),
    CompanyId: Cookies.get("CompanyId"),
  });
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [sRData, setSRData] = useState({});
  const [POData, setPOData] = useState({});
  const [InvoiceData, setInvoiceData] = useState({});
  const [billData, setBillData] = useState({});
  const [billMonth, setbillMonth] = useState("");
  const [billYear, setbillYear] = useState("");
  const [PurchaseOrderTypeId, setPurchaseOrderTypeId] = useState(0);
  const [PunchDetailData, setPunchDetailData] = useState({});
  const [PunchListData, setPunchListData] = useState({
    ContactIds: [],
  });
  const [proposalData, setproposalData] = useState([]);
  const [sRProposalData, setsRProposalData] = useState({});

  const [sRMapData, setSRMapData] = useState([]);
  const [serviceLocationAddress, setServiceLocationAddress] = useState({});
  const [maplatLngs, setMaplatLngs] = useState({});
  const [recurringInvoices, setRecurringInnvoices] = useState(false)
  const [toggleFullscreen, setToggleFullscreen] = useState(true);

  const [customerAddress, setCustomerAddress] = useState("");

  const [sROBJ, setSROBJ] = useState({
    ContactIds: [],
    SRitems: [],
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedPdf, setselectedPdf] = useState({});

  const [statusId, setStatusId] = useState(0);

  const [dashBoardRefresh, setDashBoardRefresh] = useState(false);

  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const [scrollBottom, setScrollBottom] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({});
  const [dynamicColorAndLogo, setDynamicColorAndLogo] = useState({
    CompanyLogoPath: Cookies.get("CompanyLogoPath") || "",
    PrimeryColor: Cookies.get("PrimeryColor") || "",
    SecondaryColor: Cookies.get("SecondaryColor") || "",
  });
  useEffect(() => {
    const getCompanyDetail = async () => {
      const subdomain = getCompanySubdomain();
      const response = await companyDetail(STATIC_SUBDOMAIN);
      applyCompanyBranding(response?.data);
      const data = {
        CompanyLogoPath: response?.data?.CompanyLogoPath,
        PrimeryColor: response?.data?.PrimeryColor,
        SecondaryColor: response?.data?.SecondaryColor,
      };
      if (response?.data?.PrimeryColor) {
        setDynamicColorAndLogo(data);
      }
    }

    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `${baseUrl}/api/Staff/GetCompany?CompanyId=${loggedInUser?.CompanyId}`,
          { headers }
        );
        setCompanyInfo(data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
      }
    };
    getCompanyDetail();
    fetchUser();
  }, []);
  return (
    <DataContext.Provider
      value={{
        selectedPdf,
        setselectedPdf,
        dashBoardRefresh,
        setDashBoardRefresh,
        statusId,
        setStatusId,
        selectedImages,
        setSelectedImages,
        sROBJ,
        setSROBJ,
        loggedInUser,
        setLoggedInUser,
        customerAddress,
        setCustomerAddress,
        toggleFullscreen,
        setToggleFullscreen,
        maplatLngs,
        setMaplatLngs,
        serviceLocationAddress,
        setServiceLocationAddress,
        sRMapData,
        setSRMapData,
        sRProposalData,
        setsRProposalData,
        PunchListData,
        setPunchListData,
        PunchDetailData,
        setPunchDetailData,
        billData,
        setBillData,
        InvoiceData,
        setInvoiceData,
        POData,
        setPOData,
        setSRData,
        sRData,
        users,
        setUsers,
        recurringInvoices, setRecurringInnvoices,
        contacts,
        setContacts,
        estimates,
        setEstimates,
        customers,
        setCustomers,
        singleObj,
        setSingleObj,
        serviceRequests,
        setServiceRequest,
        singleSR,
        setSingleSR,
        estimateItems,
        setEstimateItems,
        wReportData,
        setWReportData,
        selectedInvoices,
        setSelectedInvoices,
        scrollBottom,
        setScrollBottom,
        companyInfo,
        setCompanyInfo,
        PurchaseOrderTypeId,
        setPurchaseOrderTypeId,
        billYear,
        setbillYear,
        billMonth,
        setbillMonth,
        dynamicColorAndLogo,
        setDynamicColorAndLogo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataFun;
export { DataContext };
