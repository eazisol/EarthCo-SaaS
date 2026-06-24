import React, { useContext, useEffect, useState } from "react";
import TitleBar from "../TitleBar";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import useGetApi from "../Hooks/useGetApi";
import { DataContext } from "../../context/AppData";
import AgingReportByQB from "./AgingReportByQB";
import AgingReportByEarthco from "./AgingReportByEarthco";
import { Tabs, Tab } from "@mui/material";
const getEndDateForTenure = (tenure) => {
  const today = new Date();
  let endDate;

  
  const getWeekEndDate = (date, offset = 0) => {
    const currentDay = date.getDay();
    return new Date(date.setDate(date.getDate() - currentDay + 6 + offset));
  };

  const getMonthEndDate = (date, offset = 0) => {
    return new Date(date.getFullYear(), date.getMonth() + 1 + offset, 0);
  };

  const getQuarterEndDate = (date, offset = 0) => {
    const quarter = Math.floor((date.getMonth() + offset * 3) / 3);
    return new Date(date.getFullYear(), (quarter + 1) * 3, 0);
  };

  const getYearEndDate = (date, offset = 0) => {
    return new Date(date.getFullYear() + offset, 11, 31);
  };

  switch (tenure) {
    case "Today":
      endDate = today;
      break;
    case "Yesterday":
      endDate = new Date(today.setDate(today.getDate() - 1));
      break;
    case "This Week":
      endDate = getWeekEndDate(today);
      break;
    case "Last Week":
      endDate = getWeekEndDate(today, -7);
      break;
    case "This Week-to-date":
      endDate = today;
      break;
    case "Last Week-to-date":
      endDate = new Date(today.setDate(today.getDate() - 7));
      break;
    case "Next Week":
      endDate = getWeekEndDate(today, 7);
      break;
    case "Next 4 Weeks":
      endDate = new Date(today.setDate(today.getDate() + 28));
      break;
    case "This Month":
      endDate = getMonthEndDate(today);
      break;
    case "Last Month":
      endDate = getMonthEndDate(today, -1);
      break;
    case "This Month-to-date":
      endDate = today;
      break;
    case "Last Month-to-date":
      endDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      );
      break;
    case "Next Month":
      endDate = getMonthEndDate(today, 1);
      break;
    case "This Fiscal Quarter":
      endDate = getQuarterEndDate(today);
      break;
    case "Last Fiscal Quarter":
      endDate = getQuarterEndDate(today, -1);
      break;
    case "This Fiscal Quarter-to-date":
      endDate = today;
      break;
    case "Last Fiscal Quarter-to-date":
      endDate = new Date(today.setMonth(today.getMonth() - 3));
      break;
    case "Next Fiscal Quarter":
      endDate = getQuarterEndDate(today, 1);
      break;
    case "This Fiscal Year":
      endDate = getYearEndDate(today);
      break;
    case "Last Fiscal Year":
      endDate = getYearEndDate(today, -1);
      break;
    case "This Fiscal Year-to-date":
      endDate = today;
      break;
    case "Last Fiscal Year-to-date":
      endDate = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      );
      break;
    case "Next Fiscal Year":
      endDate = getYearEndDate(today, 1);
      break;
    default:
      endDate = today;
  }

  return endDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

const AgingReportTable = () => {
  const [selectedReport, setSelectedReport] = useState("QB");
  const { getData } = useGetApi();
  const { loggedInUser, dynamicColorAndLogo    } = useContext(DataContext);
  const currentDate = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    search: "",
    tenure: "Today",
    reportDate: currentDate,
    sort: "default",
    agingMethod: "Report_Date",
  });
  const [reportData, setReportData] = useState({});
  const [filteredRows, setFilteredRows] = useState([]);
  const [isloading, setIsloading] = useState(true);
  const [earthCoRepoerData, setEarthCoRepoerData] = useState([]);
  const [earthCoReportLoading, setEarthCoReportLoading] = useState(false);
  const getEarthcoReportData = (
    report_date = "",
    date_macro = "Today",
    sort_order = "ascend",
    aging_method = "Report_Date",
    NoOfDays = 30,
    NoOfPeriods = 4
  ) => {
    setEarthCoReportLoading(true);
    getData(
      `/Report/GetAgingReportFromEarthCo?report_date=${report_date}&date_macro=${date_macro}&sort_order=${sort_order}&aging_method=${aging_method}&NoOfDays=${NoOfDays}&NoOfPeriods=${NoOfPeriods}`,
      (data) => {
        console.log("earthco aging report data", data);
        setEarthCoRepoerData(data);
        setEarthCoReportLoading(false);
      },
      (err) => {
        console.log("earthco aging report err", err);
        setEarthCoReportLoading(false);
      }
    );
  };
  const getReportData = () => {
    setIsloading(true);
    getData(
      `/Report/GetAgingReport?date_macro=${formData.tenure}&report_date=${formData.reportDate}&sort_order=${formData.sort}&aging_method=${formData.agingMethod}`,
      (data) => {
        setReportData(data);
        setFilteredRows(data?.Rows?.Row || []); // Initialize filtered rows
        console.log("aging report data", data);
        setIsloading(false);
      },
      (err) => {
        console.log("aging report err", err);
        setIsloading(false);
      }
    );
  };
  const handleTenureChange = (e) => {
    const selectedTenure = e.target.value;
    const updatedDate = getEndDateForTenure(selectedTenure);

    setFormData({
      ...formData,
      tenure: selectedTenure,
      reportDate: updatedDate,
    });
  };

  useEffect(() => {
    getReportData();
    getEarthcoReportData();
  }, []);

  const dateFormat = (date) => {
    if (date) {
      const parsedDate = new Date(date);
      const formattedDate = parsedDate.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      return formattedDate;
      // return TblDateFormat(date)
    }
  };
  const generateReport = () => {
    console.log("formdata", formData);
    getReportData();
  };

  // Filter rows when search input changes
  useEffect(() => {
    let filtered = reportData?.Rows?.Row || [];

    // Apply search filter
    if (formData.search) {
      const searchLower = formData.search.toLowerCase();
      filtered = filtered.filter((row) =>
        row?.ColData
          ? row.ColData[0]?.Value?.toLowerCase().includes(searchLower)
          : row.Summary.ColData[0]?.Value?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRows(filtered);
  }, [formData.search, formData.sort, reportData]);

  return (
    <>
      <TitleBar
        icon={<HiOutlineClipboardDocumentList size={"1.7em"} />}
        title="Aging Report"
      />
      <div className="container-fluid pt-3">
        <div className="card p-3">
          <div className="row">
            <Tabs
              value={selectedReport}
              onChange={(event, newValue) => {
                setSelectedReport(newValue);
              }}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab value="QB" label="Report by QB" />
              <Tab value="Earthco" label="Report by Earthco" />
            </Tabs>
          </div>
          {selectedReport == "QB" && (
            <AgingReportByQB
              setFormData={setFormData}
              filteredRows={filteredRows}
              formData={formData}
              handleTenureChange={handleTenureChange}
              reportData={reportData}
              isloading={isloading}
              dateFormat={dateFormat}
              setFilteredRows={setFilteredRows}
              loggedInUser={loggedInUser}
              generateReport={generateReport}
            />
          )}

          {selectedReport == "Earthco" && (
            <AgingReportByEarthco
              getEndDateForTenure={getEndDateForTenure}
              getEarthcoReportData={getEarthcoReportData}
              earthCoRepoerData={earthCoRepoerData}
              dateFormat={dateFormat}
              loading={earthCoReportLoading}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AgingReportTable;
