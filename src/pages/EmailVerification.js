import axios from "axios";
import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { baseUrl } from "../apiConfig";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { useNavigate } from "react-router-dom";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
const EmailVerification = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const emailParam = queryParams.get("UserId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (emailParam) {
      axios
        .get(`${baseUrl}/api/Account/VerifyEmail?UserId=${emailParam}`)
        .then((response) => {
          setLoading(false);
          setSuccess(true);
          setTimeout(() => {
            navigate(`/`);
          }, 4000);
        })
        .catch((error) => {
          console.log("Error decrypting email:", error);
          setLoading(false);
          setError(true);
        });
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading && (
        <h1>
          <CircularProgress /> Loading
        </h1>
      )}
      {error && (
        <h1>
          <CancelOutlinedIcon sx={{ fontSize: "50px" }} />
          Verification UnSuccessfull
        </h1>
      )}
      {success && (
        <h1>
          <TaskAltIcon sx={{ fontSize: "50px" }} /> Verification Successfull
        </h1>
      )}
    </div>
  );
};

export default EmailVerification;
