import React, { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../apiConfig";

const Verification = ({ setToggleVerification, resetEmail, handlePopup }) => {
  const [togglResetForm, setTogglResetForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerification = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        `${baseUrl}/api/Account/VerifyForgetPasswordCode?Email=${resetEmail}&Code=${verificationCode}`,

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("successfuly varified code", response.data);
      handlePopup(true, "success", response.data);
      setTogglResetForm(true);
    } catch (error) {
      console.log("error verifying code ", error);
      handlePopup(true, "error", error.response.data);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      handlePopup(true, "error", "Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/Account/ChangeForgetPassword`,
        {
          NewPassword: password,
          ConfirmPassword: confirmPassword,
          Email: resetEmail,
        }
      );

      setTimeout(() => {
        window.location.reload();
      }, 3000);

      console.log("Password changed successfule", response.data);
      handlePopup(true, "success", response.data.status);
    } catch (error) {
      console.log("Error resetting password:", error);
      handlePopup(true, "error", error.response.data);
    }
  };

  return (
    <>
      {!togglResetForm && (
        <form className="dz-form">
          <h3 className="form-title m-t0">Verification</h3>

          <div className="dz-separator-outer m-b5">
            <div className="dz-separator bg-primary style-liner"></div>
          </div>
          <p>Enter Verification Code</p>
          <div className="form-group mb-4">
            <input
              name="dzName"
              required
              className="form-control"
              placeholder="Verification Code"
              onChange={(e) => {
                setVerificationCode(e.target.value);
              }}
              type="text"
            />
          </div>
          <div className="form-group clearfix text-left">
            <button
              className="active btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                setToggleVerification(false);
              }}
            >
              Back
            </button>
            <button
              className="btn btn-primary float-end"
              onClick={handleVerification}
            >
              Submit
            </button>
          </div>
        </form>
      )}
      {togglResetForm && (
        <form className="dz-form">
          <h3 className="form-title m-t0">Reset Password</h3>

          <div className="dz-separator-outer m-b5">
            <div className="dz-separator bg-primary style-liner"></div>
          </div>
          <p>Password</p>
          <div className="form-group mb-4">
            <input
              name="dzName"
              required
              className="form-control"
              placeholder="Enter Password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="dz-separator-outer m-b5">
            <div className="dz-separator bg-primary style-liner"></div>
          </div>
          <p>Confirm Password</p>
          <div className="form-group mb-4">
            <input
              name="dzName"
              required
              className="form-control"
              placeholder="Enter Confirm Password"
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="form-group clearfix text-left">
            <button
              className="active btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                setTogglResetForm(false);
              }}
            >
              Back
            </button>
            <button
              className="btn btn-primary float-end"
              onClick={handleResetPassword}
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default Verification;
