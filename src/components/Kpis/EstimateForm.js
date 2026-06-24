import useGetApi from "../Hooks/useGetApi";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Autocomplete,
  TextField,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import { get } from "jquery";
import { baseUrl } from "../../apiConfig";
import LoaderButton from "../Reusable/LoaderButton";
import EventPopups from "../Reusable/EventPopups";
import formatAmount from "../../custom/FormatAmount";
export const EstimateForm = () => {
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
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const years = Array.from(
    { length: currentYear - 2009 },
    (_, index) => currentYear - index
  );
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectManager, setSelectManager] = useState("");
  const [loading, setLoading] = useState(false);
  const { getData } = useGetApi();
  const [formValues, setFormValues] = useState({});
  const [staffData, setStaffData] = useState([]);
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  // 👇 Helper to format numbers with commas
  const formatWithCommas = (val) =>
    typeof val === "number"
      ? val.toLocaleString("en-US")
      : val?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // 👇 Helper to apply formatting to only the relevant fields
  const formatFieldsWithCommas = (obj, fields) => {

    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [
        key,
        fields.includes(key) ? formatWithCommas(val) : val,
      ])
    );
  };

  // 👇 List of numeric fields to format
  const numberFields = [
    "LaborerRate",
    "MonthlySale",
    "ForemenRate",
    "IrrigatorRate",
    "SpraytechRate",
    "LaborerPayroleAmount",
    "ForemenPayroleAmount",
    "IrrigatorPayroleAmount",
    "SpraytechPayroleAmount",
    "NoOfLaborer",
    "NoOfForemen",
    "NoOfIrrigator",
    "NoOfSpraytech",
    "Monthly",
    "Extras",
  ];
  const parseRate = (value) => {
    if (typeof value === "number") return value; // already a number
    if (typeof value === "string") {
      const cleaned = value.replace(/,/g, ""); // remove commas
      return Number(cleaned) || 0;
    }
    return 0; // fallback for null, undefined, etc.
  };
  const [formData, setFormData] = useState({
    CompanyName: "",
    MonthlySale: "",
    LaborerRate: "",
    ForemenRate: "",
    IrrigatorRate: "",
    SpraytechRate: "",
    LaborerPayroleAmount: "",
    ForemenPayroleAmount: "",
    IrrigatorPayroleAmount: "",
    SpraytechPayroleAmount: "",
    NoOfLaborer: "",
    NoOfForemen: "",
    NoOfIrrigator: "",
    NoOfSpraytech: "",
    Monthly: "",
    Extras: "",
  });

  const totalLabelSale =
    (parseRate(formData.MonthlySale) || 0) + parseRate(formValues?.ExtrasValue);
  // Calcualate All getPercentage %
  const getPercentage = totalLabelSale
    ? ((parseRate(formData.LaborerRate || 0) +
        parseRate(formData.ForemenRate || 0) +
        parseRate(formData.IrrigatorRate || 0)) /
        totalLabelSale) *
      100
    : 0; // Avoid division by zero
  const irrigatorPer = formValues?.IrrigatorValue
    ? (parseRate(formData?.IrrigatorRate || 0) /
        parseRate(formValues.IrrigatorValue)) *
      100
    : 0;
  // const irrigatorPer = formValues?.IrrigatorValue
  //   ? (Number(formData?.IrrigatorRate || 0) /
  //       Number(formValues.IrrigatorValue)) *
  //     100
  //   : 0;
  const sprayTechPer = formValues?.SprayTechValue
    ? (parseRate(formData?.SpraytechRate || 0) /
        parseRate(formValues.SprayTechValue)) *
      100
    : 0; // Prevents division by zero
  const laberThired =
    parseRate(formData?.Monthly || 0) + parseRate(formData?.Extras || 0);
  // Calcualate sales
  const totalSales =
    parseRate(formData.MonthlySale) +
    parseRate(formValues?.ExtrasValue) +
    parseRate(formValues?.IrrigatorValue) +
    parseRate(formValues?.SprayTechValue);

  const totalrate =
    parseRate(formData?.LaborerRate) +
    parseRate(formData?.ForemenRate) +
    parseRate(formData?.IrrigatorRate) +
    parseRate(formData?.SpraytechRate);

  const firstAmmountCal = laberThired
    ? (((Number(formData.LaborerPayroleAmount) || 0) +
        (Number(formData.ForemenPayroleAmount) || 0) +
        (Number(formData.SpraytechPayroleAmount) || 0)) /
        laberThired) *
      100
    : 0;
  const totalper = (totalrate / totalSales) * 100;

  const SubmitHandler = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${baseUrl}/api/KPI/AddAgentLaborerReport`,
        formData,
        {
          headers,
        }
      );
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(data.Message);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getKpiFormData = (month, year, manager) => {
    getData(
      `/KPI/GetLaborerReportValues?Year=${year}&Month=${month}&AgentId=${manager}`,

      (data) => {
        setFormValues(data);
      },
      (err) => {}
    );
  };
  const getKpireportValue = (month, year, manager) => {
    getData(
      `/KPI/GetAgentLaborerReport?AgentId=${manager}&Year=${year}&Month=${month}`,

      (data) => {
        // setFormData(data);
        const formattedData = formatFieldsWithCommas(data, numberFields);
        setFormData(formattedData);
      },
      (err) => {}
    );
  };

  const fetchStaffList = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Staff/GetStaffList`, {
        headers,
      });
      setStaffData(response.data);
    } catch (error) {}
  };
  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (formValues) {
      setFormData((prevData) => ({
        AgentLaborReportId: formData.AgentLaborReportId
          ? formData.AgentLaborReportId
          : 0,
        ExtrasSale: formValues.ExtrasValue,
        IrrigatorSale: formValues.IrrigatorValue,
        SpraytechSale: formValues.SprayTechValue,
        LaborerSale: totalLabelSale, // Use previous state here
        UserId: selectManager,
        Month: selectedMonth,
        Year: selectedYear,
        IrrigatorRate: formData.IrrigatorRate,
        ForemenRate: formData.ForemenRate,
        LaborerRate: formData.LaborerRate,
        SpraytechRate: formData.SpraytechRate,
        IrrigatorPayroleAmount: formData.IrrigatorPayroleAmount,
        LaborerPayroleAmount: formData.LaborerPayroleAmount,
        ForemenPayroleAmount: formData.ForemenPayroleAmount,
        SpraytechPayroleAmount: formData.SpraytechPayroleAmount,
        NoOfLaborer: formData.NoOfLaborer,
        NoOfForemen: formData.NoOfForemen,
        NoOfIrrigator: formData.NoOfIrrigator,
        NoOfSpraytech: formData.NoOfSpraytech,
        MonthlySale: formData.MonthlySale,
        Monthly: formData.Monthly,
        Extras: formData.Extras,
        CreatedDate: formData.CreatedDate,
        EditDate: new Date().toISOString().split("T")[0],
      }));
    }
  }, [formValues]);
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
    const rawValue = value.replace(/,/g, "");
    if (!/^\d*$/.test(rawValue)) return;
    const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    setFormData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }));
  };

  useEffect(() => {
    if (selectedMonth || selectedYear || selectManager) {
      getKpiFormData(selectedMonth, selectedYear, selectManager);
      getKpireportValue(selectedMonth, selectedYear, selectManager);
    }
  }, [selectedMonth, selectedYear, selectManager]);

  return (
    <div
      className="row d-flex mt-3"
      style={{ width: "100%", marginLeft: "0px" }}
    >
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div
        className="col-sm-12 col-md-12 col-lg-3 card kpi-form p-1 "
        style={{ width: "100%", maxWidth: "25.2%" }}
      >
        <div className="row p-1 pt-3 pb-3 ">
          <div className="col-md-12">
            <label className="form-label pb-1" style={{ color: "#2c2c2c" }}>
              Regional Manager
            </label>

            <Autocomplete
              id="staff-autocomplete"
              size="small"
              options={staffData.filter(
                (staff) =>
                  staff.Role === "Regional Manager"|| staff.Role === "Account Manager"||staff?.isSuperAdmin
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
                        {" "}
                        <h6 className="pb-0 mb-0">
                          {" "}
                          {option.FirstName} {option.LastName}
                        </h6>
                      </div>
                      <div className="col-md-auto">
                        <small>
                          {"("}
                          {option.Role}
                          {")"}
                        </small>
                      </div>
                    </div>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label=""
                  // error={submitClicked && !formData.RegionalManagerId}
                  placeholder="Choose..."
                  className="bg-white"
                />
              )}
            />
          </div>
          <div className="col-md-6">
            <label
              className="form-label mt-2  pb-1"
              style={{ color: "#2c2c2c" }}
            >
              Year
            </label>
            <FormControl fullWidth>
              <Select
                size="small"
                name="Year"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                }}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col-md-6">
            <label
              className="form-label mt-2  pb-1"
              style={{ color: "#2c2c2c" }}
            >
              Month
            </label>
            <FormControl fullWidth>
              <Select
                size="small"
                name="Month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                }}
              >
                {months.map((month, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
      <div
        className="col-md-9 card kpi-form"
        style={{ width: "100%", maxWidth: "73%", marginLeft: "10px" }}
      >
        <div className="border-bottom border-black">
          <h6 className="mb-0 p-2 " style={{ color: "#2c2c2c" }}>
            Payroll Details
          </h6>
        </div>
        <div className="card-body">
          <div
            style={{
              overflowX: "auto",
              maxWidth: "100%",
              minWidth: "50%",
            }}
            className="table-responsive"
          >
            <table className="table">
              <tbody>
                <tr>
                  <th></th>

                  <td>Rates</td>
                  <td>Sales</td>
                  <td>Percent</td>
                  <td># of Guys</td>
                </tr>
                {/* <td>Monthly</td> */}
                <tr>
                  <td>Monthly</td>

                  <th></th>
                  <td>
                    <TextField
                      value={formData.MonthlySale || ""}
                      onChange={handleChange}
                      name="MonthlySale"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                  <td></td>
                  <td></td>
                </tr>
                {/* <td>Extras</td> */}
                <tr>
                  <td>Extras</td>

                  <td></td>
                  <td className="text-center">
                    <label>
                      {/* {`${Number(formValues?.ExtrasValue || 0).toFixed( 2 )}`} */}
                      {formatAmount(formValues?.ExtrasValue || 0, 2)}
                    </label>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
                {/* <td>Laborer</td> */}
                <tr>
                  <td>Laborer</td>

                  <td>
                    <TextField
                      value={formData.LaborerRate || ""}
                      onChange={handleChange}
                      name="LaborerRate"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                  <td className="text-center">
                    {" "}
                    <label>{formatAmount(totalLabelSale || 0, 2)}</label>
                  </td>
                  <td className="text-center">
                    {" "}
                    <label>
                      {isNaN(getPercentage)
                        ? "0%"
                        : `${getPercentage.toFixed(2)}%`}
                    </label>
                  </td>
                  <td>
                    <TextField
                      value={formData.NoOfLaborer || ""}
                      onChange={handleChange}
                      name="NoOfLaborer"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                </tr>
                {/* <td>Foremen</td> */}
                <tr>
                  <td>Foremen</td>

                  <td>
                    <TextField
                      value={formData.ForemenRate || ""}
                      onChange={handleChange}
                      name="ForemenRate"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                  <td></td>
                  <td></td>
                  <td>
                    <TextField
                      value={formData.NoOfForemen || ""}
                      onChange={handleChange}
                      name="NoOfForemen"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                </tr>
                {/* <td>Irrigator</td> */}
                <tr>
                  <td>Irrigator</td>

                  <td>
                    <TextField
                      value={formData.IrrigatorRate || ""}
                      onChange={handleChange}
                      name="IrrigatorRate"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                  <td className="text-center">
                    {" "}
                    <label>
                      {formatAmount(formValues?.IrrigatorValue || 0, 2)}
                    </label>
                  </td>

                  <td className="text-center">
                    {" "}
                    <label className="text-center">
                      {isNaN(irrigatorPer)
                        ? "0%"
                        : `${irrigatorPer.toFixed(2)}%`}
                    </label>
                  </td>
                  <td>
                    <TextField
                      value={formData.NoOfIrrigator || ""}
                      onChange={handleChange}
                      name="NoOfIrrigator"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                </tr>
                {/* <td>Spray tech</td> */}
                <tr>
                  <td>Spray tech</td>

                  <td>
                    <TextField
                      value={formData.SpraytechRate || ""}
                      onChange={handleChange}
                      name="SpraytechRate"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                  <td className="text-center">
                    {" "}
                    <label>
                      {formatAmount(formValues?.SprayTechValue || 0, 2)}
                    </label>
                  </td>
                  <td className="text-center">
                    {" "}
                    <label>
                      {isNaN(sprayTechPer)
                        ? "0%"
                        : `${sprayTechPer.toFixed(2)}%`}
                    </label>
                  </td>
                  <td>
                    <TextField
                      value={formData.NoOfSpraytech || ""}
                      onChange={handleChange}
                      name="NoOfSpraytech"
                      type="text" // use "text" to allow commas
                      size="small"
                      style={{ width: "60%" }}
                      InputProps={{
                        style: { height: "26px" },
                        inputProps: { inputMode: "numeric" }, // mobile keyboard stays numeric
                      }}
                    />
                  </td>
                </tr>
                {/* <td>Totals</td> */}
                <tr>
                  <td>Totals</td>

                  <td>
                    <label style={{ marginLeft: "5%" }}>
                      {isNaN(totalrate)
                        ? 0
                        : new Intl.NumberFormat().format(totalrate)}
                    </label>
                  </td>
                  <td className="text-center">
                    <label>{formatAmount(totalSales || 0, 2)}</label>
                  </td>
                  <td>
                    <label style={{ marginLeft: "5%" }}>
                      {isNaN(totalper) ? "0%" : `${totalper.toFixed(2)}%`}
                      {/* {`${
                      isNaN(totalper)
                        ? "0.00"
                        : new Intl.NumberFormat().format(totalper)
                    }%`} */}
                    </label>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className="d-flex justify-content-end">
              <LoaderButton loading={loading} handleSubmit={SubmitHandler}>
                Save
              </LoaderButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
