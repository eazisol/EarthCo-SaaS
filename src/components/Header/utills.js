import React, { useEffect, useContext } from "react";
import { DataContext } from "../../context/AppData";
import { useLocation, useNavigate } from "react-router-dom";

const TblDateFormat = (dateString) => {
  if (!dateString) return ""; // Handle empty or undefined input

  const date = new Date(dateString);
  const today = new Date();

  // Get time difference in milliseconds
  const diffTime = today - date;

  // Calculate the difference in days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else {
    const year = date.getFullYear();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed

    return `${month}-${day}-${year}`;
  }
};

const useIsAuthorized = () => {
  const navigate = useNavigate();
  const { loggedInUser } = useContext(DataContext);
  const location = useLocation();
  const restrictedPaths = [
    "/dashboard",
    "/staff",
    "/staff/add-staff",
    "/service-requests",
    "/service-requests/add-sRform",
    "/estimates",
    "/estimates/add-estimate",
    "/purchase-order",
    "purchase-order/add-po",
    "/bills",
    "/bills/add-bill",
    "/invoices",
    "/invoices/add-invoices",
    "/items",
    "/items/add-item",
    "/wages",
    "/monthly-goals"

  ];
  useEffect(() => {
    if (restrictedPaths.includes(location.pathname)) {
      if (loggedInUser.userRole == 2) {
        navigate(`/customers/add-customer?id=${loggedInUser.userId}`);
      }
    }
  }, []);
};
export { TblDateFormat, useIsAuthorized };
