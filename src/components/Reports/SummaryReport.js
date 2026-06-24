import React, { useContext, useEffect, useState } from "react";
import SummaryReportPreview from "./SummaryReportPreview";
import TitleBar from "../TitleBar";
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import useFetchProposalReports from "../Hooks/useFetchProposalReports";
import { useNavigate } from "react-router";
import { DataContext } from "../../context/AppData";
import AddButton from "../Reusable/AddButton";
import PreviewButtons from "../Reusable/PreviewButtons";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import Authorization from "../Reusable/Authorization";

const SummaryReport = () => {
  const icon = (
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
        d="M13.5096 2.53165H7.41104C5.50437 2.52432 3.94146 4.04415 3.89654 5.9499V15.7701C3.85437 17.7071 5.38979 19.3121 7.32671 19.3552C7.35512 19.3552 7.38262 19.3561 7.41104 19.3552H14.7343C16.6538 19.2773 18.1663 17.6915 18.1525 15.7701V7.36798L13.5096 2.53165Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.2688 2.52084V5.18742C13.2688 6.48909 14.3211 7.54417 15.6228 7.54784H18.1482"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.0974 14.0786H8.1474"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.2229 10.6388H8.14655"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const navigate = useNavigate();

  const { sRProposalData, setsRProposalData, loggedInUser, dynamicColorAndLogo   } =
    useContext(DataContext);

  const { customerSearch, fetchCustomers } = useCustomerSearch();

  const { name, setName, fetchName } = useFetchCustomerName();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const currentYear = currentDate.getFullYear();

  const [formData, setFormData] = useState({
    CustomerId: loggedInUser.userRole == "2" ? loggedInUser.userId : 0,
    Year: currentYear, // Set the default year to the current year
    Month: currentMonth, // Set the default month to the current month
  });
  // Create an array of years from 2010 to the current year
  const years = Array.from(
    { length: currentYear - 2009 },
    (_, index) => currentYear - index
  );

  const handleCustomerAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    if (newValue) {
      setName(newValue.FirstName);
    }
    const simulatedEvent = {
      target: {
        name: "CustomerId",
        value: newValue ? newValue.UserId : "",
      },
    };
    handleInputChange(simulatedEvent);
  };

  const handleInputChange = (e, newValue) => {
    const { name, value } = e.target;

    // Convert to number if the field is CustomerId, Qty, Rate, or EstimateStatusId
    const adjustedValue = ["UserId"].includes(name) ? Number(value) : value;

    setFormData((prevData) => ({ ...prevData, [name]: adjustedValue }));
    console.log("form data is", formData);
  };

  const [submitClicked, setSubmitClicked] = useState(false);

  const getGeneralReportData = () => {
    setSubmitClicked(true);
    if (!formData.CustomerId || !formData.Year || !formData.Month) {
      return;
    }

    setsRProposalData((prevData) => ({
      ...prevData,
      formData,
    }));
    //   fetchReport(

    //     "Service Request"
    //   );
    navigate(
      `/general-report?Customer=${formData.CustomerId}&Year=${formData.Year}&Month=${formData.Month}`
    );
  };

  const getReportData = () => {
    setSubmitClicked(true);
    if (!formData.CustomerId || !formData.Year || !formData.Month) {
      return;
    }

    setsRProposalData((prevData) => ({
      ...prevData,
      formData,
    }));
    //   fetchReport(

    //     "Service Request"
    //   );
    navigate(
      `/summary-report-preview?Customer=${formData.CustomerId}&Year=${formData.Year}&Month=${formData.Month}`
    );
  };

  const getProposalReportData = () => {
    setSubmitClicked(true);
    if (!formData.CustomerId || !formData.Year || !formData.Month) {
      return;
    }
    setsRProposalData((prevData) => ({
      ...prevData,
      formData,
    }));
    navigate(
      `/proposal-summary?Customer=${formData.CustomerId}&Year=${formData.Year}&Month=${formData.Month}`
    );
  };

  const getLandscapeReportData = () => {
    setSubmitClicked(true);
    if (!formData.CustomerId || !formData.Year || !formData.Month) {
      return;
    }
    setsRProposalData((prevData) => ({
      ...prevData,
      formData,
    }));
    navigate(
      `/landscape/landscape-report?Customer=${formData.CustomerId}&Year=${formData.Year}&Month=${formData.Month}`
    );
  };

  return (
    <>
      <TitleBar icon={icon} title="Monthly Reports" />

      <div className="container-fluid mt-3">
        <div className="card">
          <div className="card-header">
            <div className="card-body ">
              <Authorization allowTo={[1, 4, 5, 6,8]} hide>
                <div className="row ">
                  <div className="col-md-3">
                    <label className="form-label">
                      Customers <span className="text-danger">*</span>
                    </label>

                    <CustomerAutocomplete
                      formData={formData}
                      setFormData={setFormData}
                      submitClicked={submitClicked}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">
                      Year<span className="text-danger">*</span>
                    </label>
                    <FormControl fullWidth>
                      <Select
                        size="small"
                        name="Year"
                        value={formData.Year}
                        error={submitClicked && !formData.Year}
                        onChange={handleInputChange}
                      >
                        {years.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">
                      Month<span className="text-danger">*</span>
                    </label>
                    <FormControl fullWidth>
                      <Select
                        size="small"
                        name="Month"
                        value={formData.Month}
                        error={submitClicked && !formData.Month}
                        onChange={handleInputChange}
                      >
                        {months.map((month, index) => (
                          <MenuItem key={index} value={index + 1}>
                            {month}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-md-3 mt-3 pt-1">
                    <AddButton 
                    backgroundColor={dynamicColorAndLogo.PrimeryColor}
                    background={false}
                      varient="outlined"
                      icon="print"
                      onClick={() => {
                        getGeneralReportData();
                      }}
                    >
                      Generate Report
                    </AddButton>
                  </div>
                </div>
              </Authorization>
              <Authorization allowTo={[2]} hide>
                <div className="row ">
                  <div className="col-md-2">
                    <label className="form-label">
                      Year<span className="text-danger">*</span>
                    </label>
                    <FormControl fullWidth>
                      <Select
                        size="small"
                        name="Year"
                        value={formData.Year}
                        error={submitClicked && !formData.Year}
                        onChange={handleInputChange}
                      >
                        {years.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">
                      Month<span className="text-danger">*</span>
                    </label>
                    <FormControl fullWidth>
                      <Select
                        size="small"
                        name="Month"
                        value={formData.Month}
                        error={submitClicked && !formData.Month}
                        onChange={handleInputChange}
                      >
                        {months.map((month, index) => (
                          <MenuItem key={index} value={index + 1}>
                            {month}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-md-3 mt-3 pt-1">
                    <AddButton
                      varient="outlined"
                      icon="print"
                      onClick={() => {
                        getGeneralReportData();
                      }}
                    >
                      Generate Report
                    </AddButton>
                  </div>
                </div>
              </Authorization>
              <div className="row mt-3">
                <div className="col-md-12">
                  {" "}
                  {loggedInUser.userRole == "1" && (
                    <AddButton
                      onClick={() => {
                        navigate("/landscape/add-landscape");
                      }}
                    >
                      Add LandScape
                    </AddButton>
                  )}
                  <PreviewButtons
                    onClick={() => {
                      getLandscapeReportData();
                    }}
                  >
                    LandScape
                  </PreviewButtons>
                  <PreviewButtons
                    onClick={() => {
                      getProposalReportData();
                    }}
                  >
                    Proposal Summary
                  </PreviewButtons>
                  <PreviewButtons
                    onClick={() => {
                      getReportData();
                    }}
                  >
                    Service Request
                  </PreviewButtons>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryReport;
