import React, { useState, useEffect } from "react";
import logo1 from "../assets/images/background/earthco_logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { baseUrl } from "../apiConfig";


const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(window.location.search);
  const emailParam = queryParams.get("Email");

  useEffect(() => {
    if (emailParam) {
      axios
        .post(`${baseUrl}/api/Account/DecrypteEmail`, {
          Email: emailParam,
        })
        .then((response) => {
          // Set the 'email' state with the decrypted email
          setEmail(response.data);
         

        })
        .catch((error) => {
          console.log("Error decrypting email:", error);
        });
    }
  }, []);

  const [successRes, setSuccessRes] = useState("")

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        `${baseUrl}/api/Account/ChangeForgetPassword`,
        {
          NewPassword: password,
          ConfirmPassword: confirmPassword,
          Email: emailParam,
        }
      );
      setSuccessRes(response.data.status)
      // console.log(response.data);

      setTimeout(() => {
        navigate("/");
        
      }, 4000);

      if (response.data) {
        console.log("Password changed successfule", response.data);
        // navigate("/");
      } else {
        setError("Password reset failed. Please try again.");
      }
    } catch (error) {
      console.log("Error resetting password:", error);
      setError("An error occurred while resetting your password.");
    }
  };

  useEffect(() => { 
    
  setError("")   
  }, [confirmPassword, password])
  

  return (
    <div className="page-wraper">
      <div className="browse-job login-style3">
        <div
          className="bg-white row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <div className="login-form style-2" style={{ maxWidth: "500px" }}>
            <div className="card-body">
              <div className="logo-header">
                <img
                  src={logo1}
                  alt=""
                  className="width-230 light-logo"
                  style={{ width: "35%", marginLeft: "30%" }}
                />
                <img
                  src={logo1}
                  alt=""
                  className="width-230 dark-logo"
                  style={{ width: "35%", marginLeft: "30%" }}
                />
              </div>

              <nav>
                <div
                  className="nav nav-tabs border-bottom-0"
                  id="nav-tab"
                  role="tablist"
                >
                  <div className="tab-content w-100" id="nav-tabContent">
                    <div
                      className="tab-pane fade show active"
                      id="nav-personal"
                      role="tabpanel"
                      aria-labelledby="nav-personal-tab"
                    >
                      {error && (
                      <Alert severity="error">
                        {error ? error : "Error Adding Estimates"}
                      </Alert>
                    )}
                    {successRes && (
                      <Alert severity="success">
                        {successRes ? successRes : "password resetted succesfuly"}
                      </Alert>
                    )}
                      <form
                        onSubmit={handleResetPassword}
                        className="dz-form pb-3"
                      >
                        <h3 className="form-title m-t0">Reset Password</h3>
                        <div className="dz-separator-outer m-b5">
                          <div className="dz-separator bg-primary style-liner"></div>
                        </div>
                        <p>Email: {email}</p>
                        <div className="form-group mb-3">
                          <input
                            type="password"
                            placeholder="Password..."
                            className="form-control"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>

                        <div className="form-group mb-3">
                          <input
                            type="password"
                            placeholder="Confirm Password..."
                            className="form-control"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                        {/* Display the error message if passwords don't match */}
                        {error && <h5 className="authError mb-2">{error}</h5>}
                        
                        

                        <div className=" text-end bottom">
                        <button
                            className="btn btn-dark me-2 "
                            type="submit"
                            onClick={(e) => {e.preventDefault();  navigate("/");}}
                          >
                            Back to login
                          </button>
                          <button
                            className="btn btn-primary "
                            type="submit"
                          >
                            Reset Password
                          </button>
                        </div>
                      </form>
                    </div>
                    
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
