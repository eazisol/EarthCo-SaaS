import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/images/logo/earthco_logo_small.png";
import qb from "../../assets/images/QuickBooks.png";
import qbsm from "../../assets/images/qb.png";
import avatar1 from "../../assets/images/avatar/1.jpg";
import profilePic from "../../assets/images/profile/profile.png";
import { DataContext } from "../../context/AppData";
import $ from "jquery";
import { StyleContext } from "../../context/StyleData";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import DoneIcon from "@mui/icons-material/Sync";
import Tick from "@mui/icons-material/CheckCircleOutline";
import useFetchDashBoardData from "../Hooks/useFetchDashBoardData";
import Avatar from "@mui/material/Avatar";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { Button, CircularProgress } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import BusinessIcon from "@mui/icons-material/Business";
import useQuickBook from "../Hooks/useQuickBook";
import EventPopups from "../Reusable/EventPopups";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import { baseUrl ,logoUrl} from "../../apiConfig";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import Notifications from "./Notifications";
import Authorization from "../Reusable/Authorization";
import { getCompanySubdomain, STATIC_SUBDOMAIN } from "../../API/companydetail";

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  if (!name || !name.includes(" ")) {
    // Handle the case where name is undefined or does not contain a space
    if (name) {
      return {
        sx: {
          bgcolor: stringToColor(name),
        },
        children: name.slice(0, 2), // Display the first two characters of the name
      };
    } else {
      // Handle the case where name is undefined or empty
      return {
        sx: {
          bgcolor: "#000000", // Provide a default background color
        },
        children: "U", // Provide a default character
      };
    }
  }

  // Split the name into words
  const words = name.split(" ");
  let initials = "";

  // Extract the first character of each word
  for (const word of words) {
    if (word.length > 0) {
      initials += word[0]; // Include the first character
    }
  }

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials,
  };
}

const HeaderExp = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const subdomain = getCompanySubdomain();
    
  
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const realmId = urlParams.get("realmId");
  const isCompanySelectRoute =
    window.location.pathname.includes("company-select");

  const navigate = useNavigate();
  const {
    mainControl,
    setMainControl,
    setShowSM,
    eliminate,
    showIrrMenu,
    setShowIrrMenu,
    showPlMenu, 
    setShowPlMenu,
  } = useContext(StyleContext);

  const { loggedInUser, setLoggedInUser,dynamicColorAndLogo } = useContext(DataContext);
  const { dashBoardData, getDashboardData } = useFetchDashBoardData();

  const { syncQB, loading, showTick } = useQuickBook();

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const handlepopup = (open, color, text) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
  };
  const handleResize = () => {
    setScreenWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    getDashboardData();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (screenWidth <= 1024 && screenWidth >= 450) {
      setMainControl("tab");
    } else if (screenWidth <= 450) {
      setMainControl("mobileH");
    } else {
      setMainControl("desktop");
    }
  }, [screenWidth]);

  const toggleSideBar = () => {
    if (screenWidth > 450) {
      if (mainControl === "desktop") {
        setMainControl("tab");
      } else {
        setMainControl("desktop");
      }
    } else {
      if (
        mainControl === "desktop" ||
        mainControl === "tab" ||
        mainControl === "mobileH"
      ) {
        setMainControl("mobileS");
      } else {
        setMainControl("mobileH");
      }
    }
  };

  const clearAllCookies = () => {
    

    Cookies.set("userRole", "");
    Cookies.set("userId", "");
    Cookies.set("CompanyName", "");
    Cookies.set("CompanyId", "");
    Cookies.set("ProviderToken", "");
    Cookies.set("RefreshToken", "");
    Cookies.set("AccessToken", "");
    Cookies.set("UserEmailGoogle", "");
    Cookies.set("userEmail", "");
    Cookies.set("userName", "");
    Cookies.set("EstimateAccess", "");

    Cookies.set("token", "");
    setLoggedInUser({});
    // navigate("/");

    setTimeout(() => {
      
      navigate("/");
    }, 10);
  };

  const collapseSideBar = () => {
    $(".navLabel").addClass("dispNone");
    $("#sideBarDez").addClass("toShort");
    $("#contentBody").addClass("bodyChanges");
    $(".header-left").addClass("bodyChanges");
    $(".nav-header").addClass("toShort");
    setShowSM(false);
    setShowIrrMenu(false);
    setShowPlMenu(false);
  };

  const hideSideBar = () => {
    $(".navLabel").removeClass("dispNone");
    $("#sideBarDez").removeClass("toShort");
    $("#sideBarDez").removeClass("transRight");
    $("#contentBody").removeClass("bodyChanges");
    $(".nav-header").addClass("toShort");
  };

  const showSideBar = () => {
    $("#sideBarDez").addClass("transRight");
  };

  const expandSideBar = () => {
    $(".navLabel").removeClass("dispNone");
    $("#sideBarDez").removeClass("toShort");
    $("#contentBody").removeClass("bodyChanges");
    $(".header-left").removeClass("bodyChanges");
    $(".nav-header").removeClass("toShort");
    setShowSM(false);
    setShowIrrMenu(false);
    setShowPlMenu(false);
  };

  useEffect(() => {
    if (mainControl === "desktop") {
      expandSideBar();
    } else if (mainControl === "tab") {
      collapseSideBar();
    } else if (mainControl === "mobileH") {
      hideSideBar();
    } else {
      showSideBar();
    }
  }, [mainControl]);

  useEffect(() => {
    setLoggedInUser({
      userName: Cookies.get("userName"),
      userEmail: Cookies.get("userEmail"),
      userRole: Cookies.get("userRole"),
      userId: Cookies.get("userId"),
      CompanyName: Cookies.get("CompanyName"),
      CompanyId: Cookies.get("CompanyId"),
      EstimateAccess: Cookies.get("EstimateAccess"),
      RefreshToken:
        Cookies.get("RefreshToken") == "null"
          ? null
          : Cookies.get("RefreshToken") || null,
      AccessToken:
        Cookies.get("AccessToken") == "null"
          ? null
          : Cookies.get("AccessToken") || null,
      ProviderToken:
        Cookies.get("ProviderToken") == "null"
          ? null
          : Cookies.get("ProviderToken"),
      UserEmailGoogle: Cookies.get("UserEmailGoogle"),
    });
  }, []);

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="nav-header hide-on-mobile">
        <NavLink className="brand-logo " style={{ background: "#181818" }}>
          {/* <img style={{ width: "70%", marginLeft: "20%" }} src={dynamicColorAndLogo?.CompanyLogoPath?`${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`:logo} alt="" /> */}
            <img
              style={{
                width:
                  mainControl !== "tab" && dynamicColorAndLogo?.CompanyLogoPath ? "23%" :
                  mainControl === "tab" ? "100%" : "70%",
                marginLeft: mainControl === "tab" ? "63%" : "20%",
              }}
              src={
                dynamicColorAndLogo?.CompanyLogoPath === 'app'
                  ? logo
                  : dynamicColorAndLogo?.CompanyLogoPath
                    ? `${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`
                    : logo
              }
              alt=""
            />
          </NavLink>
        {!isCompanySelectRoute && (
          <div className="nav-control" onClick={toggleSideBar} ref={eliminate}>
            <div className="hamburger">
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </div>
          </div>
        )}
      </div>
      <div className="nav-header hide-on-large">
        {!isCompanySelectRoute && (
          <div
            className="nav-control"
            style={{ right: "1em" }}
            onClick={toggleSideBar}
            ref={eliminate}
          >
            <div className="hamburger">
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="header">
          <div className="header-content" style={{ background: "#000" }}>
            <nav className="navbar navbar-expand">
              <div className="collapse navbar-collapse justify-content-between">
                <div className="header-left">
                  {!isCompanySelectRoute && (
                    <>
                      {dashBoardData.isQBToken ? (
                        <div
                          className="d-flex flex-nowrap"
                          style={{ alignItems: "center" }}
                        >
                          <Authorization allowTo={[1, 4, 5, 6]} hide>
                            <CustomizedTooltips title="Go to Quickbooks SyncLogs">
                              <span>
                                <img
                                  className="img-fluid hide-on-mobile"
                                  style={{
                                    width: "150px",
                                    cursor: "pointer",
                                  }}
                                  src={qb}
                                  alt=""
                                  onClick={() => {
                                    if (loggedInUser.userRole == 1) {
                                      navigate(`/Sync-log`);
                                    }
                                  }}
                                />
                                <img
                                  className=" hide-on-large"
                                  style={{
                                    width: "24px",
                                    cursor: "pointer",
                                  }}
                                  src={qbsm}
                                  alt=""
                                  onClick={() => {
                                    if (loggedInUser.userRole == 1) {
                                      navigate(`/Sync-log`);
                                    }
                                  }}
                                />
                              </span>
                            </CustomizedTooltips>
                          </Authorization>

                          <Authorization allowTo={[1]} hide>
                            {loading ? (
                              <div className="text-center">
                                <CircularProgress
                                  sx={{
                                    color: "#2C9F1C",
                                  }}
                                  size={20}
                                />
                              </div>
                            ) : (
                              <>
                                {showTick ? (
                                  <div className="text-center">
                                    <Tick
                                      sx={{
                                        fontSize: 25,
                                        color: "#2C9F1C",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <CustomizedTooltips
                                    title="Click Sync with QuickBooks"
                                    className="d-inline-block"
                                  >
                                    <span>
                                      <DoneIcon
                                        onClick={() => {
                                          syncQB(0);
                                        }}
                                        sx={{
                                          fontSize: 20,
                                          color: "#2C9F1C",
                                          cursor: "pointer",
                                        }}
                                      />
                                    </span>
                                  </CustomizedTooltips>
                                )}
                              </>
                            )}
                          </Authorization>
                        </div>
                      ) : (
                        <iframe
                          src={`${baseUrl}/?Value=${STATIC_SUBDOMAIN}&Color=${encodeURIComponent(dynamicColorAndLogo?.PrimeryColor || "#7c9c3d")}`}
                          scrolling="no"
                          style={{
                            height: "100%",
                            width: "34%",
                            overflowY: "hidden",
                            marginTop: "-1.5%",
                          }}
                        ></iframe>
                      )}
                    </>
                  )}
                  {!isCompanySelectRoute && (
                    <div
                      className=""
                      style={{
                        borderLeft: "solid 1px white",
                        marginLeft: "1em",
                      }}
                    ><Authorization allowTo={[1, 4, 5, 6]} hide>
                      <CustomizedTooltips title="Click to Change Company">
                        <span>
                          <div
                            className="d-flex flex-nowrap align-items-center"
                            style={{ minWidth: "19em" }}
                          >
                            <div className="col-1 col-sm-1 col-md-1 ms-3">
                              {" "}
                              <BusinessIcon
                                sx={{
                                  fontSize: 23,
                                  color: "white",
                                }}
                              />
                            </div>
                            <div className="col-md-11 col-11 col-sm-11">
                              <span
                                className="ms-2 "
                                style={{ color: "white", cursor: "pointer" }}
                                onClick={() => {
                                  navigate("/company-select");
                                }}
                              >
                                {/* <abbr title="World Health Organization"> */}
                                {loggedInUser.CompanyName
                                  ? loggedInUser.CompanyName
                                  : ""}
                                {/* </abbr> */}
                              </span>
                            </div>
                          </div>
                        </span>
                      </CustomizedTooltips></Authorization>
                    </div>
                  )}
                </div>
                <ul className="navbar-nav header-right">
                  <Authorization allowTo={[1, 4, 5, 6]} hide>
                    <div className="mt-3">
                    <Notifications /></div>
                  </Authorization>
                  {/* <li className="nav-item align-items-center header-border">
                    <CustomizedTooltips title="logout">
                      <span>
                        <PowerSettingsNewIcon
                          sx={{ color: "white", cursor: "pointer" }}
                          onClick={clearAllCookies}
                        />
                      </span>
                    </CustomizedTooltips>
                  </li> */}

                  <li className="nav-item ps-3 hide-on-mobile">
                    <NavLink
                      className="nav-link"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <div className="header-info2 d-flex align-items-center">
                        <div className="header-media">
                          <Avatar
                            style={{ width: "30px", height: "30px" }}
                            {...stringAvatar(loggedInUser.userName)}
                          />
                        </div>
                        <div className="header-info">
                          <h6 className="admin-header">
                            {loggedInUser.userName}
                          </h6>
                          <p className="admin-header">
                            {" "}
                            {loggedInUser.userEmail}
                          </p>
                        </div>
                      </div>
                    </NavLink>
                    <div
                      style={{ zIndex: 11999 }}
                      className="dropdown header-profile2"
                    >
                      <div className="dropdown-menu dropdown-menu-end">
                        <div className="card border-0 mb-0">
                          <div className="card-header py-2">
                            <div className="products">
                              <Avatar
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  marginRight: "7px",
                                }}
                                {...stringAvatar(loggedInUser.userName)}
                              />
                              <div>
                                <h6> {loggedInUser.userName}</h6>
                                <span>
                                  {loggedInUser.userRole == 1
                                    ? " Admin"
                                    : loggedInUser.userRole == 2
                                    ? "Customer"
                                    : "Staff"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="card-body px-0 py-0">
                            {loggedInUser.userRole != 2 && (
                              <ul>
                                <li
                                  style={{ cursor: "pointer" }}
                                  className=" header-right-DD"
                                  onClick={() => {
                                    navigate(
                                      `/staff/add-staff?id=${loggedInUser.userId}`
                                    );
                                  }}
                                >
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M20.8066 7.62355L20.1842 6.54346C19.6576 5.62954 18.4907 5.31426 17.5755 5.83866V5.83866C17.1399 6.09528 16.6201 6.16809 16.1307 6.04103C15.6413 5.91396 15.2226 5.59746 14.9668 5.16131C14.8023 4.88409 14.7139 4.56833 14.7105 4.24598V4.24598C14.7254 3.72916 14.5304 3.22834 14.17 2.85761C13.8096 2.48688 13.3145 2.2778 12.7975 2.27802H11.5435C11.0369 2.27801 10.5513 2.47985 10.194 2.83888C9.83666 3.19791 9.63714 3.68453 9.63958 4.19106V4.19106C9.62457 5.23686 8.77245 6.07675 7.72654 6.07664C7.40418 6.07329 7.08843 5.98488 6.8112 5.82035V5.82035C5.89603 5.29595 4.72908 5.61123 4.20251 6.52516L3.53432 7.62355C3.00838 8.53633 3.31937 9.70255 4.22997 10.2322V10.2322C4.82187 10.574 5.1865 11.2055 5.1865 11.889C5.1865 12.5725 4.82187 13.204 4.22997 13.5457V13.5457C3.32053 14.0719 3.0092 15.2353 3.53432 16.1453V16.1453L4.16589 17.2345C4.41262 17.6797 4.82657 18.0082 5.31616 18.1474C5.80575 18.2865 6.33061 18.2248 6.77459 17.976V17.976C7.21105 17.7213 7.73116 17.6515 8.21931 17.7821C8.70746 17.9128 9.12321 18.233 9.37413 18.6716C9.53867 18.9488 9.62708 19.2646 9.63043 19.5869V19.5869C9.63043 20.6435 10.4869 21.5 11.5435 21.5H12.7975C13.8505 21.5 14.7055 20.6491 14.7105 19.5961V19.5961C14.7081 19.088 14.9088 18.6 15.2681 18.2407C15.6274 17.8814 16.1154 17.6806 16.6236 17.6831C16.9451 17.6917 17.2596 17.7797 17.5389 17.9393V17.9393C18.4517 18.4653 19.6179 18.1543 20.1476 17.2437V17.2437L20.8066 16.1453C21.0617 15.7074 21.1317 15.1859 21.0012 14.6963C20.8706 14.2067 20.5502 13.7893 20.111 13.5366V13.5366C19.6717 13.2839 19.3514 12.8665 19.2208 12.3769C19.0902 11.8872 19.1602 11.3658 19.4153 10.9279C19.5812 10.6383 19.8213 10.3981 20.111 10.2322V10.2322C21.0161 9.70283 21.3264 8.54343 20.8066 7.63271V7.63271V7.62355Z"
                                      stroke="var(--primary)"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <circle
                                      cx="12.175"
                                      cy="11.889"
                                      r="2.63616"
                                      stroke="var(--primary)"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <span className="ms-2 ">Settings </span>
                                </li>
                              </ul>
                            )}

                            <ul>
                              <li
                                style={{ cursor: "pointer" }}
                                className=" header-right-DD"
                                onClick={clearAllCookies}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="var(--primary)"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                  <polyline points="16 17 21 12 16 7"></polyline>
                                  <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span className="ms-2">Logout</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default HeaderExp;