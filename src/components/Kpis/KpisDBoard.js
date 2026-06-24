import React, { useContext, useEffect, useState } from "react";
import TitleBar from "../TitleBar";
import { GrDocumentPerformance } from "react-icons/gr";
import formatAmount from "../../custom/FormatAmount";
import KpiCard from "./KpiCard";
import ItemCharts from "./ItemCharts";
import useGetApi from "../Hooks/useGetApi";
import EstimateData from "./EstimateData";
import {
  Autocomplete,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Monthlies from "./Monthlies";
import SrCard from "./SrCard";
import CostTracking from "./CostTracking";
import { DataContext } from "../../context/AppData";
import { EstimateForm } from "./EstimateForm";
import DataTable from "./DataTable";

const KpisDBoard = () => {
  const { getData } = useGetApi();
  const { getSprayData } = useGetApi();
  const { loggedInUser, dynamicColorAndLogo } = useContext(DataContext);
  const [cardData, setcardData] = useState({});
  const [monthReport, setMonthReport] = useState([]);
  const [PLReport, setPLReport] = useState([]);
  const [sprayTechReport, setSpraytechReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [PLloading, setPlLoading] = useState(false);
  const [selectManager, setSelectManager] = useState(0);
  const AgentId =
    loggedInUser?.userRole == 1
      ? selectManager
        ? selectManager
        : "0"
      : loggedInUser?.userId;

  const [formData, setFormData] = useState({});
  const [staffData, setStaffData] = useState([]);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const currentYear = currentDate.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const years = Array.from(
    { length: currentYear - 2009 },
    (_, index) => currentYear - index
  );
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
  const getReportData = (month, year) => {
    getData(
      `/KPI/GetAgentEstimateMonthlyReport?AgentId=${AgentId}&Month=${month}&Year=${year}`,
      (data) => {
        setcardData(data);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
      }
    );
  };
  const getmonthReportData = (year,manager) => {
    getData(
      `/KPI/GetMonthlysReport?Year=${year}&RegionalManagerId=${manager}`,
      (data) => {
        setMonthReport(data);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
      }
    );
  };
  const getPLData = (year) => {
    setPlLoading(true);
    getData(
      `/Report/GetPLReport?Year=${year}`,
      (data) => {
        setPLReport(data);
        setPlLoading(false);
      },
      (err) => {
        setPlLoading(false);
      }
    );
  };
  const fetchSprayTechList = async (month, year) => {
    getData(
      `/KPI/GetAgentEstimateConstructionCrewMonthlyReport?AgentId=${AgentId}&Month=${month}&Year=${year}`,
      (data) => {
        setSpraytechReport(data);
      },
      (err) => {
        console.log("🚀 ~ fetchSprayTechList ~ err:", err);
      }
    );
  };
  const handleApiCall = () => {
    setLoading(true);
    fetchSprayTechList(selectedMonth, selectedYear);
    getReportData(selectedMonth, selectedYear);
    getmonthReportData(selectedYear,selectManager);
    getPLData(selectedYear);
    setLoading(false);
  };
  useEffect(() => {
    getReportData(selectedMonth, selectedYear);
    getmonthReportData(selectedYear,selectManager);
    getPLData(selectedYear);
  }, []);
  const fetchStaffList = async () => {
    getData(
      `/Staff/GetStaffList`,
      (data) => {
        setStaffData(data);
      },
      (err) => {
        setPlLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchSprayTechList(selectedMonth, selectedYear);
    fetchStaffList();
  }, []);
  const handleAutocompleteChange = (
    fieldName,
    valueProperty,
    event,
    newValue
  ) => {
    const simulatedEvent = {
      target: {
        name: fieldName,
        value: newValue ? newValue[valueProperty] : "",
      },
    };
    handleInputChange(simulatedEvent);
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectManager(value);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  if (loading) {
    return (
      <div className="center-loader">
        <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
      </div>
    );
  }

  return (
    <div>
      <TitleBar
        icon={<GrDocumentPerformance size={"20px"} />}
        title={"KPIs Dashboard"}
      ></TitleBar>

      <div className="container-fluid">
        <div className="row mb-3">
          {/* Year Dropdown */}
          <div className="col-8 col-sm-6 col-md-2">
            <label className="form-label">Year</label>
            <FormControl fullWidth>
              <Select
                size="small"
                name="Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Month Dropdown */}
          <div className="col-8 col-sm-6 col-md-2">
            <label className="form-label">Month</label>
            <FormControl fullWidth>
              <Select
                size="small"
                name="Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Regional Manager Dropdown */}
          <div className="col-8 col-sm-6 col-md-2">
            <label className="form-label">Regional Manager</label>

            <Autocomplete
              id="staff-autocomplete"
              size="small"
              options={staffData.filter(
                (staff) =>
                  staff.Role === "Regional Manager" || staff.Role === "Account Manager"||staff?.isSuperAdmin
              )}
              getOptionLabel={(option) =>
                option.FirstName + " " + option.LastName || ""
              }
              value={
                staffData.find((staff) => staff.UserId === selectManager) ||
                null
              }
              onChange={(event, newValue) =>
                handleAutocompleteChange(
                  "selectManager",
                  "UserId",
                  event,
                  newValue
                )
              }
              isOptionEqualToValue={(option, value) =>
                option.UserId === value.selectManager
              }
              renderOption={(props, option) => (
                <li {...props}>
                  <div className="customer-dd-border">
                    <div className="row">
                      <div className="col-md-auto">
                        <h6 className="pb-0 mb-0">
                          {option.FirstName} {option.LastName}
                        </h6>
                      </div>
                      <div className="col-md-auto">
                        <small>({option.Role})</small>
                      </div>
                    </div>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label=""
                  placeholder="Choose..."
                  className="transparent"
                />
              )}
            />
          </div>

          {/* Generate Button */}
          <div
            className="col-8 col-sm-6 col-md-2 d-flex mt-sm-2 align-items-end"
            style={{ marginBottom: "2px" }}
          >
            <Button
              variant="contained"
              style={{ height: "35px" }}
              onClick={handleApiCall}
              fullWidth
            >
              Generate
            </Button>
          </div>
        </div>

        <EstimateData data={cardData} />
        <div className="mt-3">
          <SrCard
            data={cardData}
            loggedInUser={loggedInUser}
            cardData={cardData}
            sprayTechReport={sprayTechReport}
          />
        </div>

        <div className="row mt-3">
          <div className="col-md-5 h-100">
            <CostTracking chartData={cardData} selectedYear={selectedYear} selectedMonth={selectedMonth}/>
          </div>
          {loggedInUser?.userRole == 1 && (
            <div className="col-md-7  h-100">
              <Monthlies monthReport={monthReport} />
            </div>
          )}
        </div>
        <div className="row">
          {loggedInUser?.userRole == 1 && loggedInUser?.CompanyId == 1 && (
            <>
              <div className="col-md-12 mt-3">
                <ItemCharts PLReport={PLReport} PLloading={PLloading} dynamicColorAndLogo={dynamicColorAndLogo} />
              </div>
              <div>
                <DataTable data={PLReport} PLloading={PLloading} dynamicColorAndLogo={dynamicColorAndLogo} />
              </div>
            </>
          )}
        </div>
        <EstimateForm />
      </div>
    </div>
  );
};

export default KpisDBoard;
