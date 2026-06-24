import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { StyleContext } from "../../context/StyleData";
import { DataContext } from "../../context/AppData";
import Cookies from "js-cookie";
import TaskIcon from "@mui/icons-material/EngineeringOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import SpeedIcon from "@mui/icons-material/Speed";
import { GrDocumentPerformance } from "react-icons/gr";
import Authorization from "../Reusable/Authorization";
import { TbReportAnalytics } from "react-icons/tb";
import WorkIcon from "@mui/icons-material/Work";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { AiOutlineFileSync } from "react-icons/ai";
import useFetchDashBoardData from "../Hooks/useFetchDashBoardData";
import AutoModeIcon from '@mui/icons-material/AutoMode';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PortraitIcon from '@mui/icons-material/Portrait';
import useGetApi from "../Hooks/useGetApi";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { AiOutlineFileImage } from 'react-icons/ai';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import { getRolePermission } from "../../API/rolePermission";
import GroupsIcon from '@mui/icons-material/Groups';
import { CircularProgress } from "@mui/material";
const SideBar = () => {
  const subShowRef = useRef(null);
  const irrShowRef = useRef(null);
  const foremanQcShowRef = useRef(null);
  const foremanOperationsShowRef = useRef(null);
  const pLShowRef = useRef(null);
  const sidebarRef = useRef(null);
  const [staffData, setStaffData] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [menuAccessMap, setMenuAccessMap] = useState({});
  const [dynamicMenuData, setDynamicMenuData] = useState([]);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const location = useLocation();
  const { getData } = useGetApi();

  // Icon mapping function
  const getIconComponent = (iconName) => {
    if (!iconName) return null;
    
    const iconMap = {
      'HomeOutlinedIcon': <HomeOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'AiOutlineFileImage': <AiOutlineFileImage size={"20px"} color="#8c8b8b" />,
      'ReceiptLongIcon': <ReceiptLongIcon sx={{ fontSize: 24 }} color="#8c8b8b" />,
      'AccountCircleOutlinedIcon': <AccountCircleOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'WorkOutlineIcon': <WorkOutlineIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'GroupsOutlinedIcon': <GroupsOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'LocationOnOutlinedIcon': <LocationOnOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'BadgeOutlinedIcon': <BadgeOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'EventNoteOutlinedIcon': <EventNoteOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'PublicOutlinedIcon': <PublicOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'ArticleOutlinedIcon': <ArticleOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'FolderOpenOutlinedIcon': <FolderOpenOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'InsertChartOutlinedIcon': <InsertChartOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'ReceiptLongOutlinedIcon': <ReceiptLongOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'GridViewOutlinedIcon': <GridViewOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'EngineeringOutlinedIcon': <EngineeringOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'SpeedIcon': <SpeedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'InsightsOutlinedIcon': <InsightsOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'ChecklistIcon': <ChecklistIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'UploadFileIcon': <UploadFileIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'BarChartIcon': <BarChartIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'GroupsIcon':<GroupsIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'PortraitIcon': <PortraitIcon sx={{ color: "#888888", fontSize: 20 }} />,
      'AccountBalanceIcon': <AccountBalanceIcon sx={{ color: "#888888", fontSize: 20 }} />,
    };
    
    return iconMap[iconName] || null;
  };


  const fetchStaffList = async () => {
    getData(
      `/Staff/GetStaffList`,
      (data) => {
        
        const superAdmins = Array.isArray(data) ? data.filter(staff => staff.isSuperAdmin === true) : [];
        setStaffData(superAdmins);
      },
      (err) => {

      }
    );
  };

  // Build dynamic menu structure from API response
  const buildDynamicMenu = (menuAccessArray, accessLevels = []) => {
    // Filter only active menus - check isActive from access levels
    const activeMenus = menuAccessArray.filter(
      (item) => {
        const menuId = item.menuid || item.MenuId;
        const menu = item.menu || {};
        
        // Check isActive from the access level item itself
        const itemIsActive = item.isactive === true || item.isActive === true;
        
        // Also check from tblAccessLevels if available
        let accessLevelIsActive = null;
        if (accessLevels && accessLevels.length > 0 && menuId) {
          const accessLevel = accessLevels.find(acc => acc.MenuId === menuId);
          if (accessLevel) {
            accessLevelIsActive = accessLevel.isActive === true;
          }
        }
        
        // Menu should be active if:
        // 1. Menu itself is active (menu.isActive === true) OR menu.isActive is null/undefined
        // 2. AND access level isActive is true (if available)
        // 3. OR if no access level found, check item.isactive
        const menuIsActive = menu.isActive === true || menu.isActive === null || menu.isActive === undefined;
        const shouldShow = menuIsActive && (accessLevelIsActive !== null ? accessLevelIsActive : itemIsActive);
        
        return shouldShow;
      }
    );

    // Create a map of all menus by menuId
    const menuMap = {};
    activeMenus.forEach((item) => {
      const menuId = item.menuid || item.MenuId;
      const menu = item.menu || {};
      if (menuId) {
        const actionName = menu.ActionName || item.ActionName;
        const menuName = menu.Name || item.Name;
        const parentId = menu.ParentId;
        
        // Only "Monthly Billings" and "Monthly Goals" should be single menus (not submenus)
        // Other "Monthly" items with ParentId should be treated as children
        const isMonthlyBillings = menuName && menuName.toLowerCase() === "monthly billings";
        const isMonthlyGoals = menuName && menuName.toLowerCase() === "monthly goals";
        const shouldBeSingleMenu = (isMonthlyBillings || isMonthlyGoals) && !parentId;
        
        // Normalize path - add leading slash if missing and path exists
        let normalizedPath = actionName;
        if (normalizedPath && !normalizedPath.startsWith("/") && normalizedPath !== "#") {
          normalizedPath = `/${normalizedPath}`;
        }
        
        menuMap[menuId] = {
          menuId: menuId,
          label: menuName,
          path: normalizedPath || (menu.isParent && !shouldBeSingleMenu ? null : "#"),
          icon: getIconComponent(menu.FontAwesome),
          isParent: menu.isParent === true && !shouldBeSingleMenu && menu.ParentId === null,
          parentId: parentId,
          orderBy: menu.OrderBy || 0,
          children: [],
        };
      }
    });

    // Build hierarchical structure
    const rootMenus = [];
    Object.values(menuMap).forEach((menu) => {
      const menuName = menu.label || "";
      const isMonthlyBillings = menuName.toLowerCase() === "monthly billings";
      const isMonthlyGoals = menuName.toLowerCase() === "monthly goals";
      
      // Monthly Billings should be a single menu, not a parent
      // Items that were children of Monthly Billings (ParentId: 5) should be root menus
      if (isMonthlyBillings) {
        menu.children = []; // Clear any children to ensure it's a single menu
        rootMenus.push(menu);
      } else if (isMonthlyGoals && !menu.parentId) {
        menu.children = []; // Clear any children to ensure it's a single menu
        rootMenus.push(menu);
      } else if (menu.parentId === 5) {
        // Items that were children of Monthly Billings should be root menus
        menu.children = [];
        menu.parentId = null; // Remove parent relationship
        rootMenus.push(menu);
      } else if (menu.parentId && menuMap[menu.parentId]) {
        // This is a child menu - add it to its parent (except Monthly Billings children)
        menuMap[menu.parentId].children.push(menu);
      } else if (!menu.parentId) {
        // This is a root menu
        rootMenus.push(menu);
      }
    });

    // Sort menus by OrderBy
    rootMenus.sort((a, b) => (a.orderBy || 0) - (b.orderBy || 0));
    rootMenus.forEach((menu) => {
      menu.children.sort((a, b) => (a.orderBy || 0) - (b.orderBy || 0));
    });

    return rootMenus;
  };

  // Fetch role permissions
  const fetchRolePermissions = async () => {
    const userRole = Cookies.get("userRole");
    if (userRole) {
      setIsLoadingMenus(true);
      try {
        const response = await getRolePermission(userRole);
        console.log('response', response);
        if (response?.data) {
          const apiData = response.data;

          let menuAccessArray = [];
          let accessLevels = [];
          
          if (apiData?.SelectedMenuAccess && Array.isArray(apiData.SelectedMenuAccess)) {
            menuAccessArray = apiData.SelectedMenuAccess;
          } else if (Array.isArray(apiData)) {
            menuAccessArray = apiData;
          }
          
          // Get access levels from SelectedRole if available
          if (apiData?.SelectedRole?.tblAccessLevels && Array.isArray(apiData.SelectedRole.tblAccessLevels)) {
            accessLevels = apiData.SelectedRole.tblAccessLevels;
          }
          
          setRolePermissions(menuAccessArray);
          
          // Create a map of menuId to access permissions for quick lookup
          const accessMap = {};
          menuAccessArray.forEach((item) => {
            const menuId = item.menuid || item.MenuId;
            if (menuId) {
              // Check isActive from access levels
              const accessLevel = accessLevels.find(acc => acc.MenuId === menuId);
              const isActiveFromAccess = accessLevel ? accessLevel.isActive === true : (item.isactive === true || item.isActive === true);
              
              accessMap[menuId] = {
                isActive: isActiveFromAccess && (item.menu?.isActive === true),
                canCreate: item.accesscreate === true || item.CreateAccess === true,
                canEdit: item.accessedit === true || item.EditAccess === true,
                canDelete: item.accessdelete === true || item.DeleteAccess === true,
                menuName: item.menu?.Name || item.Name,
                menuPath: item.menu?.ActionName || item.ActionName,
              };
            }
          });
          setMenuAccessMap(accessMap);
          
          // Build dynamic menu structure with access levels
          const dynamicMenus = buildDynamicMenu(menuAccessArray, accessLevels);
          setDynamicMenuData(dynamicMenus);
        }
      } catch (error) {
        console.error("Error fetching role permissions:", error);
      } finally {
        setIsLoadingMenus(false);
      }
    } else {
      setIsLoadingMenus(false);
    }
  };

  // Toggle submenu
  const toggleSubMenu = (menuId) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  useEffect(() => {
    fetchStaffList();
    fetchRolePermissions();
  }, []);
  const {
    showSubMenu,
    setShowSM,
    mainControl,
    setMainControl,
    eliminate,
    showIrrMenu,
    setShowIrrMenu,
    showPlMenu,
    setShowPlMenu,
    recurringInvoices,
    showForemanQcMenu,
    setShowForemanQcMenu,
    foremanOperations,
    setForemanOperations
  } = useContext(StyleContext);
  const { loggedInUser, setLoggedInUser, setbillYear, setbillMonth ,setPurchaseOrderTypeId, dynamicColorAndLogo} =
    useContext(DataContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const [subClass, setSubClass] = useState(-1);
  const { dashBoardData, getDashboardData } = useFetchDashBoardData();
  const [showSubMenuHov, setSubHov] = useState(false);
  const forReadOnlyAccess = (Cookies.get("EstimateAccess") === null || Cookies.get("EstimateAccess") === "null" || Cookies.get("EstimateAccess") === false || Cookies.get("EstimateAccess") === "false")
  const sideBarData = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 7.49999L10 1.66666L17.5 7.49999V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V7.49999Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 18.3333V10H12.5V18.3333"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "KPIs",
      path: "/kpi-dashboard",
      icon: <GrDocumentPerformance size={"20px"} color="#8c8b8b" />,
    },
    {
      label: "Monthly Billings",
      path: "/RecurringTable",
      icon: <ReceiptLongIcon sx={{ fontSize: 24 }} color="#8c8b8b" />,
    },

    {
      label: "Customers",
      path: "/customers",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.986 14.0673C7.4407 14.0673 4.41309 14.6034 4.41309 16.7501C4.41309 18.8969 7.4215 19.4521 10.986 19.4521C14.5313 19.4521 17.5581 18.9152 17.5581 16.7693C17.5581 14.6234 14.5505 14.0673 10.986 14.0673Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.986 11.0054C13.3126 11.0054 15.1983 9.11881 15.1983 6.79223C15.1983 4.46564 13.3126 2.57993 10.986 2.57993C8.65944 2.57993 6.77285 4.46564 6.77285 6.79223C6.76499 9.11096 8.63849 10.9975 10.9563 11.0054H10.986Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Vendors",
      path: "/venders/list",
      icon: <PortraitIcon sx={{ color: "#888888", fontSize: 20 }} />
    },
    {
      label: "Account Details",
      path: "/accounts",
      icon:  <AccountBalanceIcon sx={{ color: "#888888", fontSize: 20 }} />
    },
    {
      label: "Job List",
      path: "/job/list",
      icon: <WorkOutlineIcon sx={{ color: "#888888", fontSize: 20 }} />, // Job List
    },

    {
      label: "Staff Management",
      path: "/staff",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3a2.5 2.5 0 1 1 2-4.5M19.5 17h.5c.6 0 1-.4 1-1a3 3 0 0 0-3-3h-1m0-3a2.5 2.5 0 1 0-2-4.5m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3c0 .6-.4 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3a2.5 2.5 0 1 1 2-4.5M19.5 17h.5c.6 0 1-.4 1-1a3 3 0 0 0-3-3h-1m0-3a2.5 2.5 0 1 0-2-4.5m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3c0 .6-.4 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Role and Permision",
      path: "/role-and-permision",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3a2.5 2.5 0 1 1 2-4.5M19.5 17h.5c.6 0 1-.4 1-1a3 3 0 0 0-3-3h-1m0-3a2.5 2.5 0 1 0-2-4.5m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3c0 .6-.4 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3a2.5 2.5 0 1 1 2-4.5M19.5 17h.5c.6 0 1-.4 1-1a3 3 0 0 0-3-3h-1m0-3a2.5 2.5 0 1 0-2-4.5m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3c0 .6-.4 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Map",
      label: "Service Requests Map",
      path: "/map",
      icon: <LocationOnOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },

    {
      label: "Service Requests",
      path: "/service-requests",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 7V6c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-1M3 18v-7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
{
  label: "Recurring SR",
  path: "RecurringSR-list",
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#888888"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18M10 14h4M9 18h6" />
    </svg>
  ),
},

    {
      label: "Estimates",
      path: "/estimates",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.8381 12.7317C16.4566 12.7317 16.9757 13.2422 16.8811 13.853C16.3263 17.4463 13.2502 20.1143 9.54009 20.1143C5.43536 20.1143 2.10834 16.7873 2.10834 12.6835C2.10834 9.30245 4.67693 6.15297 7.56878 5.44087C8.19018 5.28745 8.82702 5.72455 8.82702 6.36429C8.82702 10.6987 8.97272 11.8199 9.79579 12.4297C10.6189 13.0396 11.5867 12.7317 15.8381 12.7317Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.8848 9.1223C19.934 6.33756 16.5134 1.84879 12.345 1.92599C12.0208 1.93178 11.7612 2.20195 11.7468 2.5252C11.6416 4.81493 11.7834 7.78204 11.8626 9.12713C11.8867 9.5459 12.2157 9.87493 12.6335 9.89906C14.0162 9.97818 17.0914 10.0862 19.3483 9.74467C19.6552 9.69835 19.88 9.43204 19.8848 9.1223Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    {
      label: "Purchase Order",
      path: "/purchase-order",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.4065 14.8714H7.78821"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M14.4065 11.0338H7.78821"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M10.3137 7.2051H7.78827"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5829 2.52066C14.5829 2.52066 7.54563 2.52433 7.53463 2.52433C5.00463 2.53991 3.43805 4.20458 3.43805 6.74374V15.1734C3.43805 17.7254 5.01655 19.3965 7.56855 19.3965C7.56855 19.3965 14.6049 19.3937 14.6168 19.3937C17.1468 19.3782 18.7143 17.7126 18.7143 15.1734V6.74374C18.7143 4.19174 17.1349 2.52066 14.5829 2.52066Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      label: "Bill",
      path: "/bills",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 3v4c0 .6-.4 1-1 1H5m8-2h3m-3 3h3m-4 3v6m4-3H8M19 4v16c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V8c0-.4.1-.6.3-.8l4-4 .6-.2H18c.6 0 1 .4 1 1ZM8 12v6h8v-6H8Z"
            stroke="#888888"
          />

          <path />
        </svg>
      ),
    },
    {
      label: "Invoice",
      path: "/invoices",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 4h3c.6 0 1 .4 1 1v15c0 .6-.4 1-1 1H6a1 1 0 0 1-1-1V5c0-.6.4-1 1-1h3m0 3h6m-3 5h3m-6 0h0m3 4h3m-6 0h0m1-13v4h4V3h-4Z"
            stroke="#888888"
          />
        </svg>
      ),
    },
    {
      label: "Invoice Template",
      path: "/recurring-invoices",
      icon: <AiOutlineFileSync fontSize={22} />,
    },

    {
      label: "Items",
      path: "/items",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.1 4H5c-.5 0-.9.4-.9.9V9c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9V5c0-.5-.4-.9-.9-.9Zm10 0H15c-.5 0-.9.4-.9.9V9c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9V5c0-.5-.4-.9-.9-.9Zm-10 10H5c-.5 0-.9.4-.9.9V19c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9v-4c0-.5-.4-.9-.9-.9Zm10 0H15c-.5 0-.9.4-.9.9V19c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9v-4c0-.5-.4-.9-.9-.9Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Wages",
      path: "/wages",
      icon: <TaskIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },
    {
      label: "Monthly Goals",
      path: "/monthly-goals",
      icon: <SpeedIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },
    {
      label: "Safety Reports",
      path: `/safety-reports/list`,
      icon: <TbReportAnalytics size={"20px"} color="#8c8b8b" />,
    },
   
    
  ];

  const [sideBarDataRM, setSideBarDataRM] = useState([
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 7.49999L10 1.66666L17.5 7.49999V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V7.49999Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 18.3333V10H12.5V18.3333"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    // {
    //   label: "KPIs",
    //   path: "/kpi-dashboard",
    //   icon: <GrDocumentPerformance size={"20px"} color="#8c8b8b"/>,
    // },

    {
      label: "Customers",
      path: "/customers",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.986 14.0673C7.4407 14.0673 4.41309 14.6034 4.41309 16.7501C4.41309 18.8969 7.4215 19.4521 10.986 19.4521C14.5313 19.4521 17.5581 18.9152 17.5581 16.7693C17.5581 14.6234 14.5505 14.0673 10.986 14.0673Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.986 11.0054C13.3126 11.0054 15.1983 9.11881 15.1983 6.79223C15.1983 4.46564 13.3126 2.57993 10.986 2.57993C8.65944 2.57993 6.77285 4.46564 6.77285 6.79223C6.76499 9.11096 8.63849 10.9975 10.9563 11.0054H10.986Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    {
      label: "Map",
      path: "/map",
      icon: <LocationOnOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },
    {
      label: "Service Requests",
      path: "/service-requests",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 7V6c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-1M3 18v-7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Estimates",
      path: "/estimates",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.8381 12.7317C16.4566 12.7317 16.9757 13.2422 16.8811 13.853C16.3263 17.4463 13.2502 20.1143 9.54009 20.1143C5.43536 20.1143 2.10834 16.7873 2.10834 12.6835C2.10834 9.30245 4.67693 6.15297 7.56878 5.44087C8.19018 5.28745 8.82702 5.72455 8.82702 6.36429C8.82702 10.6987 8.97272 11.8199 9.79579 12.4297C10.6189 13.0396 11.5867 12.7317 15.8381 12.7317Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.8848 9.1223C19.934 6.33756 16.5134 1.84879 12.345 1.92599C12.0208 1.93178 11.7612 2.20195 11.7468 2.5252C11.6416 4.81493 11.7834 7.78204 11.8626 9.12713C11.8867 9.5459 12.2157 9.87493 12.6335 9.89906C14.0162 9.97818 17.0914 10.0862 19.3483 9.74467C19.6552 9.69835 19.88 9.43204 19.8848 9.1223Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Purchase Order",
      path: "/purchase-order",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.4065 14.8714H7.78821"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M14.4065 11.0338H7.78821"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M10.3137 7.2051H7.78827"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5829 2.52066C14.5829 2.52066 7.54563 2.52433 7.53463 2.52433C5.00463 2.53991 3.43805 4.20458 3.43805 6.74374V15.1734C3.43805 17.7254 5.01655 19.3965 7.56855 19.3965C7.56855 19.3965 14.6049 19.3937 14.6168 19.3937C17.1468 19.3782 18.7143 17.7126 18.7143 15.1734V6.74374C18.7143 4.19174 17.1349 2.52066 14.5829 2.52066Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      ),
    },

    {
      label: "Items",
      path: "/items",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.1 4H5c-.5 0-.9.4-.9.9V9c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9V5c0-.5-.4-.9-.9-.9Zm10 0H15c-.5 0-.9.4-.9.9V9c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9V5c0-.5-.4-.9-.9-.9Zm-10 10H5c-.5 0-.9.4-.9.9V19c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9v-4c0-.5-.4-.9-.9-.9Zm10 0H15c-.5 0-.9.4-.9.9V19c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9v-4c0-.5-.4-.9-.9-.9Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Wages",
      path: "/wages",
      icon: <TaskIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },

  ]);

  const sideBarDataIrr = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 7.49999L10 1.66666L17.5 7.49999V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V7.49999Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 18.3333V10H12.5V18.3333"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Map",
      path: "/map",
      icon: <LocationOnOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },
    {
      label: "Service Requests",
      path: "/service-requests",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 7V6c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-1M3 18v-7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    // {
    //   label: "SprayTech",
    //   path: "/spray-tech",
    //   icon: (
    //     <svg
    //       width="22"
    //       height="22"
    //       viewBox="0 0 22 22"
    //       fill="none"
    //       xmlns="http://www.w3.org/2000/svg"
    //     >
    //       <path
    //         d="M4.4 7.7c2 .5 2.4 2.8 3.2 3.8 1 1.4 2 1.3 3.2 2.7 1.8 2.3 1.3 5.7 1.3 6.7M20 15h-1a4 4 0 0 0-4 4v1M8.6 4c0 .8.1 1.9 1.5 2.6 1.4.7 3 .3 3 2.3 0 .3 0 2 1.9 2 2 0 2-1.7 2-2 0-.6.5-.9 1.2-.9H20m1 4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    //         stroke="#888888"
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //       />

    //     </svg>
    //   ),
    // },
  ];
  const sideBarDataCustomer = [
    {
      label: "Profile",
      path: `/customers/add-customer?tab=0&id=${loggedInUser.userId}`,
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.986 14.0673C7.4407 14.0673 4.41309 14.6034 4.41309 16.7501C4.41309 18.8969 7.4215 19.4521 10.986 19.4521C14.5313 19.4521 17.5581 18.9152 17.5581 16.7693C17.5581 14.6234 14.5505 14.0673 10.986 14.0673Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.986 11.0054C13.3126 11.0054 15.1983 9.11881 15.1983 6.79223C15.1983 4.46564 13.3126 2.57993 10.986 2.57993C8.65944 2.57993 6.77285 4.46564 6.77285 6.79223C6.76499 9.11096 8.63849 10.9975 10.9563 11.0054H10.986Z"
            stroke="#888888"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    {
      label: "Map",
      path: `/map?id=${loggedInUser.userId}`,
      icon: <LocationOnOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },

  ];
  const [subMenu, setSubMenu] = useState([
    {
      label: "Monthly",
      path: "/summary-report",
    },
    {
      label: "Monthly Landsacpe",
      path: "/landscape",
    },
    // {
    //   label: "Safety Reports",
    //   path: `/safety-reports/list`,

    // },
    // {
    //   label: "Proposal Summary",
    //   path: "/proposal-summary",
    // },
    {
      label: "Weekly Landsacpe",
      path: "/weekly-reports",
    },
    {
      label: "Monthly Reports - RC",
      path: "/Weekly-Reports/rising-canes",
    },
  ]);

  const irrMenu = [
    {
      label: "Irrigation Audit",
      path:
        loggedInUser.userRole == "2"
          ? `/Irrigation?CustomerId=${loggedInUser.userId}`
          : `/Irrigation`,
    },
    {
      label: "Controller Audit",
      path:
        loggedInUser.userRole == "2"
          ? `/irrigation-audit?CustomerId=${loggedInUser.userId}`
          : `/irrigation-audit`,
    },
  ];

  const pLMenu = [
    {
      label: "PunchList",
      path:
        loggedInUser.userRole == "2"
          ? `/punchlist?CustomerId=${loggedInUser.userId}`
          : `/punchlist`,
    },
    {
      label: "PunchList Photos Only",
      path:
        loggedInUser.userRole == "2"
          ? `/punchList-photos-only?CustomerId=${loggedInUser.userId}`
          : `/punchList-photos-only`,
    },
  ];
  const ForemanQcMenu = [
    {
      label: "QC Schedule",
      path: `/foreman`,
      icon: <AutoModeIcon style={{ fontSize: "17px" }} color="#8c8b8b" />,
    },
    {
      label: "QC List",
      path: `/qc-list`,
      icon: <TbReportAnalytics size={"20px"} color="#8c8b8b" />,
    }
  ]
  const ForemanOperationsMenu = [
    {
      label: "Job Calendar",
      path: `/booking-calendar`,
      icon: <CalendarMonthIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },
    {
      label: "Shift Tracker",
      path: "/estimate-map",
      icon: <LocationOnOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />,
    },  
    {
      label: "Cost Center",
      path: "/cost-center",
      icon:<ReceiptLongIcon sx={{ fontSize: 24 }} color="#8c8b8b" />,
    }, 
  ]
  useEffect(() => {
    if (Cookies.get("CompanyId") == 1) {
      setSideBarDataRM([
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 7.49999L10 1.66666L17.5 7.49999V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V7.49999Z"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 18.3333V10H12.5V18.3333"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        },
        {
          label: "KPIs",
          path: "/kpi-dashboard",
          icon: <GrDocumentPerformance size={"20px"} color="#8c8b8b" />,
        },
        {
          label: "Customers",
          path: "/customers",
          icon: (
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.986 14.0673C7.4407 14.0673 4.41309 14.6034 4.41309 16.7501C4.41309 18.8969 7.4215 19.4521 10.986 19.4521C14.5313 19.4521 17.5581 18.9152 17.5581 16.7693C17.5581 14.6234 14.5505 14.0673 10.986 14.0673Z"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.986 11.0054C13.3126 11.0054 15.1983 9.11881 15.1983 6.79223C15.1983 4.46564 13.3126 2.57993 10.986 2.57993C8.65944 2.57993 6.77285 4.46564 6.77285 6.79223C6.76499 9.11096 8.63849 10.9975 10.9563 11.0054H10.986Z"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        },

        {
          label: "Service Requests Map",
          path: "/map",
          icon: (
            <LocationOnOutlinedIcon sx={{ color: "#888888", fontSize: 20 }} />
          ),
        },
        {
          label: "Service Requests",
          path: "/service-requests",
          icon: (
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 7V6c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-1M3 18v-7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        },
        {
          label: "Estimates",
          path: "/estimates",
          icon: (
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.8381 12.7317C16.4566 12.7317 16.9757 13.2422 16.8811 13.853C16.3263 17.4463 13.2502 20.1143 9.54009 20.1143C5.43536 20.1143 2.10834 16.7873 2.10834 12.6835C2.10834 9.30245 4.67693 6.15297 7.56878 5.44087C8.19018 5.28745 8.82702 5.72455 8.82702 6.36429C8.82702 10.6987 8.97272 11.8199 9.79579 12.4297C10.6189 13.0396 11.5867 12.7317 15.8381 12.7317Z"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.8848 9.1223C19.934 6.33756 16.5134 1.84879 12.345 1.92599C12.0208 1.93178 11.7612 2.20195 11.7468 2.5252C11.6416 4.81493 11.7834 7.78204 11.8626 9.12713C11.8867 9.5459 12.2157 9.87493 12.6335 9.89906C14.0162 9.97818 17.0914 10.0862 19.3483 9.74467C19.6552 9.69835 19.88 9.43204 19.8848 9.1223Z"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        },
        {
          label: "Purchase Order",
          path: "/purchase-order",
          icon: (
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.4065 14.8714H7.78821"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M14.4065 11.0338H7.78821"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M10.3137 7.2051H7.78827"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.5829 2.52066C14.5829 2.52066 7.54563 2.52433 7.53463 2.52433C5.00463 2.53991 3.43805 4.20458 3.43805 6.74374V15.1734C3.43805 17.7254 5.01655 19.3965 7.56855 19.3965C7.56855 19.3965 14.6049 19.3937 14.6168 19.3937C17.1468 19.3782 18.7143 17.7126 18.7143 15.1734V6.74374C18.7143 4.19174 17.1349 2.52066 14.5829 2.52066Z"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          ),
        },

        {
          label: "Items",
          path: "/items",
          icon: (
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.1 4H5c-.5 0-.9.4-.9.9V9c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9V5c0-.5-.4-.9-.9-.9Zm10 0H15c-.5 0-.9.4-.9.9V9c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9V5c0-.5-.4-.9-.9-.9Zm-10 10H5c-.5 0-.9.4-.9.9V19c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9v-4c0-.5-.4-.9-.9-.9Zm10 0H15c-.5 0-.9.4-.9.9V19c0 .5.4.9.9.9h4c.5 0 .9-.4.9-.9v-4c0-.5-.4-.9-.9-.9Z"
                stroke="#888888"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        },
        {
          label: "Wages",
          path: "/wages",
          icon: <TaskIcon sx={{ color: "#888888", fontSize: 20 }} />,
        },
        {
          label: "Safety Reports",
          path: `/safety-reports/list`,
          icon: <TbReportAnalytics size={"20px"} color="#8c8b8b" />,
        },

      ]);
    }

    const handleClickOutside = (event) => {
      if (subShowRef.current && !subShowRef.current.contains(event.target)) {
        setSubHov(false);
      }
      if (irrShowRef.current && !irrShowRef.current.contains(event.target)) {
        setSubHov(false);
      }
      if (pLShowRef.current && !pLShowRef.current.contains(event.target)) {
        setSubHov(false);
      }
      if (foremanQcShowRef.current && !foremanQcShowRef.current.contains(event.target)) {
        setSubHov(false);
      }
      if (foremanOperationsShowRef.current && !foremanOperationsShowRef.current.contains(event.target)) {
        setSubHov(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    const handleSidebar = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !eliminate.current.contains(event.target) &&
        window.innerWidth < 450
      ) {
        setMainControl("mobileH");
      }
    };

    document.body.addEventListener("click", handleSidebar);

    if (Cookies.get("userRole") == 2) {
      setSubMenu([
        {
          label: "Monthly",
          path: "/summary-report",
        },
        {
          label: "Monthly Landsacpe",
          path: `/landscape?CustomerId=${loggedInUser.userId}`,
        },
      ]);
    }
    // if (Cookies.get("userRole") == 4||Cookies.get("userRole") == 8) {
    //   setSubMenu([
    //     {
    //       label: "Weekly Landsacpe",
    //       path: "/weekly-reports",
    //     },
    //     // {
    //     //   label: "Monthly Reports - RC",
    //     //   path: "/Weekly-Reports/rising-canes",
    //     // },
    //   ]);
    // }
    if (Cookies.get("userRole") == 1) {
      setSubMenu([
        {
          label: "Monthly",
          path: "/summary-report",
        },
        {
          label: "Monthly Landsacpe",
          path: "/landscape",
        },

        {
          label: "Weekly Landsacpe",
          path: "/weekly-reports",
        },
        {
          label: "Monthly Reports - RC",
          path: "/Weekly-Reports/rising-canes",
        },
        {
          label: "Aging Report",
          path: "/aging-report",
        },
      ]);
    }

    return () => {
      document.body.removeEventListener("click", handleSidebar);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handlePreventLink = (event) => {
    event.preventDefault();
    if (mainControl === "tab") {
      setSubHov(!showSubMenuHov);
      setShowSM(false);
    } else {
      // toggleShowMenu();
      setShowSM(!showSubMenu);
    }
  };

  const handleIrrLink = (event) => {
    event.preventDefault();
    if (mainControl === "tab") {
      setSubHov(!showSubMenuHov);
      setShowIrrMenu(false);
    } else {
      // toggleShowMenu();
      setShowIrrMenu(!showIrrMenu);
    }
  };

  const handlePlLink = (event) => {
    event.preventDefault();
    if (mainControl === "tab") {
      setSubHov(!showSubMenuHov);
      setShowPlMenu(false);
    } else {
      // toggleShowMenu();
      setShowPlMenu(!showPlMenu);
    }
  };
  const handleForemanQcLink = (event) => {
    event.preventDefault();
    if (mainControl === "tab") {
      setSubHov(!showSubMenuHov);
      setShowForemanQcMenu(false);
    } else {
      // toggleShowMenu();
      setShowForemanQcMenu(!showForemanQcMenu);
    }
  };
  const handleForemanOperationsLink = (event) => {
    event.preventDefault();
    if (mainControl === "tab") {
      setSubHov(!showSubMenuHov);
      setForemanOperations(false);
    } else {
      // toggleShowMenu();
      setForemanOperations(!foremanOperations);
    }
  };

  let activeClass = "";

  const renderOptions = sideBarData
    .filter((option) => {
      // Filter Vendors and Accounts based on isQBToken
      if (option.label === "Venders" || option.label === "Accounts") {
        return dashBoardData?.isQBToken === true;
      }
      // If it's "Monthly Billings", check if current user is super admin
      if (option.label === "Monthly Billings") {
        const isCurrentUserSuperAdmin = staffData.some(staff => staff.UserId === parseInt(loggedInUser.userId));
        return isCurrentUserSuperAdmin;
      }
      // For all other menu items, show them normally
      return true;
    })
    .map((option, index) => {
      const handleActiveClass = (clickIndex) => {
        setActiveIndex(clickIndex);
      };
      if (activeIndex === index) {
        activeClass = "mm-active";
      }
      if (window.location.pathname.includes(option.path.split("?")[0])) {
        activeClass = "mm-active";
      } else {
        activeClass = "";
      }
      return (
        <li
          key={index}
          className={activeClass + " linkSide"}
          onClick={() => {
            handleActiveClass(index);
            setPurchaseOrderTypeId(0)
            setbillYear("");
            setbillMonth("");
          }}
        >
          <NavLink to={option.path} end                >
            <div className="menu-icon ">{option.icon}</div>
            <span className="nav-text navLabel">{option.label}</span>
          </NavLink>
        </li>
      );
    });
  const renderOptionsRM = sideBarDataRM
    .filter((option) => {
      // If user has EstimateAccess set to "true", only show the Estimates tab
      if (Cookies.get("EstimateAccess") == "true") {
        return option.label == "Estimates";
      }
      // Otherwise, show everything
      return true;
    })
    .map((option, index) => {
      const handleActiveClass = (clickIndex) => {
        setActiveIndex(clickIndex);
      };

      let activeClass = "";
      if (
        activeIndex === index ||
        window.location.pathname.includes(option.path.split("?")[0])
      ) {
        activeClass = "mm-active";
      }

      return (
        <li
          key={index}
          className={activeClass + " linkSide"}
          onClick={() => {
            handleActiveClass(index);
          }}
        >
          <NavLink to={option.path}>
            <div className="menu-icon ">{option.icon}</div>
            <span className="nav-text navLabel">{option.label}</span>
          </NavLink>
        </li>
      );
    });

  // const renderOptionsRM = sideBarDataRM.map((option, index) => {
  //   const handleActiveClass = (clickIndex) => {
  //     setActiveIndex(clickIndex);
  //   };
  //   if (activeIndex === index) {
  //     activeClass = "mm-active";
  //   }
  //   if (window.location.pathname.includes(option.path.split("?")[0])) {
  //     activeClass = "mm-active";
  //   } else {
  //     activeClass = "";
  //   }
  //   return (
  //     <li
  //       key={index}
  //       className={activeClass + " linkSide"}
  //       onClick={() => {
  //         handleActiveClass(index);
  //       }}
  //     >
  //       <NavLink to={option.path}>
  //         <div className="menu-icon ">{option.icon}</div>
  //         <span className="nav-text navLabel">{option.label}</span>
  //       </NavLink>
  //     </li>
  //   );
  // });

  const renderOptionsIrr = sideBarDataIrr.map((option, index) => {
    const handleActiveClass = (clickIndex) => {
      setActiveIndex(clickIndex);
    };
    if (activeIndex === index) {
      activeClass = "mm-active";
    }
    if (window.location.pathname.includes(option.path.split("?")[0])) {
      activeClass = "mm-active";
    } else {
      activeClass = "";
    }
    return (
      <li
        key={index}
        className={activeClass + " linkSide"}
        onClick={() => {
          handleActiveClass(index);
        }}
      >
        <NavLink to={option.path}>
          <div className="menu-icon ">{option.icon}</div>
          <span className="nav-text navLabel">{option.label}</span>
        </NavLink>
      </li>
    );
  });
  const renderOptionsCustomer = sideBarDataCustomer.map((option, index) => {
    const handleActiveClass = (clickIndex) => {
      setActiveIndex(clickIndex);
    };
    if (activeIndex === index) {
      activeClass = "mm-active";
    }
    if (window.location.pathname.includes(option.path.split("?")[0])) {
      activeClass = "mm-active";
    } else {
      activeClass = "";
    }
    return (
      <li
        key={index}
        className={activeClass + " linkSide"}
        onClick={() => {
          handleActiveClass(index);
        }}
      >
        <NavLink to={option.path}>
          <div className="menu-icon ">{option.icon}</div>
          <span className="nav-text navLabel">{option.label}</span>
        </NavLink>
      </li>
    );
  });
  const toggleShowMenu = () => {
    setShowSM(!showSubMenu);
  };
  useEffect(() => {
    const bottomChev = document.getElementById("bottomChev");
    const irrbottomChev = document.getElementById("irrbottomChev");
    const plbottomChev = document.getElementById("plbottomChev");
    const foremanQcbottomChev = document.getElementById("foremanQcbottomChev");
    const foremanOperationsbottomChev = document.getElementById("foremanOperationsbottomChev");
    if (bottomChev) {
      if (showSubMenu === true) {
        bottomChev.classList?.add("rotatezero");
      } else {
        bottomChev.classList?.remove("rotatezero");
      }
    }

    if (irrbottomChev) {
      if (showIrrMenu === true) {
        irrbottomChev.classList?.add("rotatezero");
      } else {
        irrbottomChev.classList?.remove("rotatezero");
      }
    }

    if (plbottomChev) {
      if (showPlMenu === true) {
        plbottomChev.classList?.add("rotatezero");
      } else {
        plbottomChev.classList?.remove("rotatezero");
      }
    }
    if (foremanQcbottomChev) {
      if (showForemanQcMenu === true) {
        foremanQcbottomChev.classList?.add("rotatezero");
      } else {
        foremanQcbottomChev.classList?.remove("rotatezero");
      }
    }
    if (foremanOperationsbottomChev) {
      if (foremanOperations === true) {
        foremanOperationsbottomChev.classList?.add("rotatezero");
      } else {
        foremanOperationsbottomChev.classList?.remove("rotatezero");
      }
    }
  }, [showSubMenu, showIrrMenu, showPlMenu, showForemanQcMenu, foremanOperations]);

  // Auto-open parent menus if child is active
  useEffect(() => {
    if (dynamicMenuData.length > 0) {
      const newOpenMenus = { ...openSubMenus };
      dynamicMenuData.forEach((menuItem) => {
        if (menuItem.children && menuItem.children.length > 0) {
          const hasActiveChild = menuItem.children.some((child) => {
            const childPath = child.path || "";
            return childPath !== "#" && location.pathname.includes(childPath.split("?")[0]);
          });
          if (hasActiveChild) {
            newOpenMenus[menuItem.menuId] = true;
          }
        }
      });
      setOpenSubMenus(newOpenMenus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicMenuData, location.pathname]);

  // Render dynamic menu items
  const renderDynamicMenu = () => {
    if (dynamicMenuData.length === 0) {
      // Fallback to static menu if no dynamic data
      return loggedInUser.userRole == 1
        ? renderOptions
        : loggedInUser.userRole == 5 || loggedInUser.userRole == 6
          ? renderOptionsIrr
          : loggedInUser.userRole == 2
            ? renderOptionsCustomer
            : loggedInUser.userRole == 8
              ? renderOptionsRM
              : renderOptionsRM;
    }

    return dynamicMenuData.map((menuItem, index) => {
      const hasChildren = menuItem.children && menuItem.children.length > 0;
      const isSubMenuOpen = openSubMenus[menuItem.menuId] || false;
      const isActive = location.pathname.includes(menuItem.path?.split("?")[0] || "");

      if (hasChildren) {
        // Parent menu with children
        const isParentActive = menuItem.children.some((child) => {
          const childPath = child.path || "";
          return location.pathname.includes(childPath.split("?")[0]);
        });
        
        return (
          <li key={menuItem.menuId || index} className={isParentActive ? "mm-active" : ""}>
            <a
              href="/"
              className="expand-bottom"
              onClick={(e) => {
                e.preventDefault();
                toggleSubMenu(menuItem.menuId);
              }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div className="menu-icon">
                  {menuItem.icon || <WorkOutlineIcon sx={{ color: "#888888", fontSize: 20 }} />}
                </div>
                <span className="nav-text navLabel">
                  {menuItem.label}
                </span>
              </div>
              <span
                className="material-symbols-sharp"
                style={{ marginLeft: "auto" }}
              >
                <ExpandMoreOutlinedIcon
                  sx={{
                    color: "#888888",
                    fontSize: 20,
                    transform: isSubMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                  }}
                />
              </span>
            </a>
            {isSubMenuOpen && (
              <ul className="subMenu">
                {menuItem.children.map((child, childIndex) => {
                  const childPath = child.path || "#";
                  const isChildActive = childPath !== "#" && location.pathname.includes(childPath.split("?")[0]);
                  return (
                    <li key={child.menuId || childIndex}>
                      <NavLink
                        to={childPath}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: isChildActive
                            ? dynamicColorAndLogo?.PrimeryColor || "#77993d"
                            : "#c3c1c1",
                          padding: "0.5rem 1.5rem",
                          textDecoration: "none",
                        }}
                        onMouseEnter={() => setSubClass(childIndex)}
                        onMouseLeave={() => setSubClass(-1)}
                      >
                        <div className="blueBarBox" style={{ display: "flex", alignItems: "center", minWidth: "35px" }}>
                          <span
                            id="blueBar"
                            className={isChildActive ? "activeSub" : ""}
                          ></span>
                        </div>
                        <span style={{ flex: 1, lineHeight: "1.5" }}>{child.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      } else {
        // Single menu item without children
        const menuPath = menuItem.path && menuItem.path !== "#" ? menuItem.path : "#";
        const isMenuActive = menuPath !== "#" && location.pathname.includes(menuPath.split("?")[0]);
        
        return (
          <li
            key={menuItem.menuId || index}
            className={isMenuActive ? "mm-active linkSide" : "linkSide"}
            onClick={() => {
              setActiveIndex(index);
              setPurchaseOrderTypeId(0);
              setbillYear("");
              setbillMonth("");
            }}
          >
            <NavLink to={menuPath} end>
              <div className="menu-icon">{menuItem.icon || null}</div>
              <span className="nav-text navLabel">{menuItem.label}</span>
            </NavLink>
          </li>
        );
      }
    });
  };

  return (
    <>
      <div className="deznav" id="sideBarDez" ref={sidebarRef}>
        <div className="deznav-scroll">
          <ul className="metismenu" id="menu">
            {isLoadingMenus ? (
              <li style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
                <CircularProgress 
                  size={24}
                  style={{ color: dynamicColorAndLogo?.PrimeryColor || "#77993d" }} 
                />
              </li>
            ) : dynamicMenuData.length > 0 ? (
              renderDynamicMenu()
            ) : (
              loggedInUser.userRole == 1
                ? renderOptions
                : loggedInUser.userRole == 5 || loggedInUser.userRole == 6
                  ? renderOptionsIrr
                  : loggedInUser.userRole == 2
                    ? renderOptionsCustomer
                    : loggedInUser.userRole == 8
                      ? renderOptionsRM
                      : renderOptionsRM
            )}
                  {/* {(loggedInUser.userRole == 1 || loggedInUser.userRole == 4) && (
              <>
                <li>
                  <a
                    href="/"
                    className="expand-bottom"
                    onClick={handleForemanOperationsLink}
                    ref={foremanOperationsShowRef}
                  >
                    <div className="menu-icon" >
                      <CalendarViewDayIcon sx={{ color: "#888888", fontSize: 20 }} />
                    </div>
                    <span className="nav-text navLabel" >
                    Foreman Ops 
                      <span
                        className="material-symbols-sharp"
                        style={{ top: "6px" }}
                        id="foremanOperationsbottomChev"
                      >
                        <ExpandMoreOutlinedIcon
                          sx={{ color: "#888888", fontSize: 20 }}
                        />
                      </span>
                    </span>
                  </a>

                  { foremanOperations&& (
                    <ul className="subMenu">
                      <>
                        {ForemanOperationsMenu.map((link, index) => {
                          let activeClass = "";
                          if (
                            window.location.pathname.includes(
                              link.path.split("?")[0]
                            )
                          ) {
                            activeClass = "activeSub";
                          } else {
                            activeClass = "";
                          }

                          return (
                            <li key={index}>
                              <NavLink
                                to={link.path}
                                style={{
                                  display: "flex",
                                  color: window.location.pathname.includes(
                                    link.path.split("?")[0]
                                  )
                                    ? "#77993d"
                                    : "#c3c1c1",
                                }}
                                onMouseEnter={() => setSubClass(index)}
                                onMouseLeave={() => setSubClass(-1)}
                              >
                                <div className="blueBarBox" style={{ display: "flex", alignItems: "center" }}>
                                  <span
                                    id="blueBar"
                                    className={activeClass}
                                  ></span>
                                </div>
                                {link.label}
                              </NavLink>
                            </li>
                          );
                        })}
                      </>
                    </ul>
                 )} 
                </li>
              </>
            )} */}
          </ul>
        </div>
      </div>

    </>
  );
};

export default SideBar;
