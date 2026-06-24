import React, { useContext, useEffect, useState } from "react";
import {
  TextField,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  InputAdornment,
  IconButton,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { baseUrl } from "../../apiConfig";
import axios from "axios";
import Cookies from "js-cookie";
import formatDate from "../../custom/FormatDate";
import LoaderButton from "../Reusable/LoaderButton";
import { DataContext } from "../../context/AppData";
import TitleBar from "../TitleBar";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import EventPopups from "../Reusable/EventPopups";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import { NavLink, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import useQuickBook from "../Hooks/useQuickBook";
import formatAmount from "../../custom/FormatAmount";

const PaymentsScreen = () => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const customerId = Number(queryParams.get("CustomerId"));
  const customerName = queryParams.get("CustomerName");
  const [selectedCustomer, setSelectedCustomer] = useState({
    CustomerId: customerId,
    CustomerDisplayName: customerName,
  });
  const navigate = useNavigate();
  const { loggedInUser } = useContext(DataContext);
  const { syncQB } = useQuickBook();
  const currentDate = new Date();
  const [formData, setFormData] = useState({ Date: currentDate });
  const [submitClicked, setSubmitClicked] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [InvoiceLoading, setInvoiceLoading] = useState(false);
  const [incomeAccountList, setIncomeAccountList] = useState([]);
  const [paymentMethodList, setPaymentMethodList] = useState([]);

  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [inputPayment, setInputPayment] = useState(""); // Payment entered in the top text field
  const [totalPayment, setTotalPayment] = useState(0); // Tracks the sum of all payments in rows
  const [paymentinEditMode, setPaymentinEditMode] = useState(0);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const getIncomeAccount = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/Item/GetAccountList`, {
        headers,
      });
      console.log("selectedItem iss", res.data);
      setIncomeAccountList(res.data);
    } catch (error) {
      console.log("API call error", error);
    }
  };
  const getPaymentMethods = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/Payment/GetPaymentMethodList`,
        {
          headers,
        }
      );
      console.log("PaymentMethod iss", res.data);
      setPaymentMethodList(res.data);
    } catch (error) {
      console.log("API call error", error);
    }
  };
  const getInvoices = async () => {
    setInvoiceLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/Payment/GetInvoiceForPaymentList?CustomerId=${selectedCustomer.CustomerId}&PaymentId=${idParam}`,
        {
          headers,
        }
      );
      if (true) {
        setInvoices(
          res.data.map((inv) => {
            if (inv.PaymentInvoiceId) {
              setSelectedInvoices([...selectedInvoices, inv.InvoiceId]);
            }
            return {
              ...inv,
              payment: idParam ? inv.payment : 0,
            };
          })
        );
        let total = res.data.reduce((sum, invoice) => sum + invoice.payment, 0);
        if (!idParam) {
          total = 0;
        }
        setInputPayment(total);
        setTotalPayment(total);
      } else {
        setInvoices(res.data);
      }
      // setInvoices(res.data);
      setInvoiceLoading(false);
      res.data.forEach((element) => {
        setTotalAmount((prevAmount) => prevAmount + element.BalanceAmount);
      });
      console.log("InvoiceList iss", res.data);
    } catch (error) {
      setInvoiceLoading(false);
      console.log("API call error", error);
    }
  };

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
        type: "number",
      },
    };

    handleChange(simulatedEvent);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Parse values as numbers if the input type is "number"
    const parsedValue = type === "number" ? parseFloat(value) : value;

    // Update formData based on input type

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : parsedValue,
    }));
    console.log(formData);
  };
  const handleCheckboxChange = (event, InvoiceId, amount) => {
    if (amount === 0) return;
    if (event.target.checked) {
      setSelectedInvoices((prevSelected) => [...prevSelected, InvoiceId]);
    } else {
      setSelectedInvoices((prevSelected) =>
        prevSelected.filter((id) => id !== InvoiceId)
      );
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allInvoices = invoices
        .filter((invoice) => invoice.TotalAmount > 0) // Exclude rows with amount 0
        .map((invoice) => invoice.InvoiceId);

      setSelectedInvoices(allInvoices);
      setSelectAll(true);
    } else {
      setSelectedInvoices([]);
      setSelectAll(false);
    }
  };

  const handlePaymentChange = (e, index, amount) => {
    let value = parseFloat(e.target.value || 0);
    if (value < 0) {
      value = 0;
    }
    if (value > amount) {
      value = amount; // Cap the value to the maximum allowable amount
    }

    const updatedInvoices = [...invoices];

    // Ensure the `payment` property exists on all invoices
    updatedInvoices.forEach((invoice) => {
      if (invoice.payment === undefined) {
        invoice.payment = 0; // Default undefined payments to 0
      }
    });

    updatedInvoices[index].payment = value; // Update the specific invoice's payment
    console.log("updatedInvoices", updatedInvoices);

    setInvoices(updatedInvoices);

    // Calculate the total payment
    const total = updatedInvoices.reduce(
      (sum, invoice) => sum + (invoice.payment || 0), // Ensure undefined payments are treated as 0
      0
    );

    setInputPayment(total); // Update the inputPayment state
    setTotalPayment(total); // Update the totalPayment state
  };

  const handleInputPaymentChange = (e) => {
    let value = parseFloat(e.target.value);
    if (value < 0) {
      value = 0;
    }
    console.log("value", value);
    console.log("totalAmount", totalAmount);
    if (value > totalAmount) {
      value = totalAmount;
    }

    // Reset all invoice payments
    const updatedInvoices = invoices.map((invoice) => ({
      ...invoice,
      payment: 0,
    }));

    setInvoices(updatedInvoices);
    setInputPayment(value); // Update input payment
    setTotalPayment(0); // Reset total payment
  };

  const applyInputPayment = () => {
    let remainingPayment = parseFloat(inputPayment || 0);
    let updatedInvoices = [...invoices];

    if (selectedInvoices.length > 0) {
      // When rows are selected, distribute payment among selected rows (top to bottom)
      const selectedInvoicesData = invoices.filter((invoice) =>
        selectedInvoices.includes(invoice.InvoiceId)
      );

      const totalSelectedBalance = selectedInvoicesData.reduce(
        (sum, invoice) => sum + invoice.BalanceAmount,
        0
      );

      if (remainingPayment > totalSelectedBalance) {
        remainingPayment = totalSelectedBalance;
      }

      // Distribute payment starting from the top-most selected row
      for (let i = 0; i < updatedInvoices.length && remainingPayment > 0; i++) {
        const invoice = updatedInvoices[i];

        if (selectedInvoices.includes(invoice.InvoiceId)) {
          const maxPaymentForRow =
            invoice.BalanceAmount - (invoice.payment || 0);
          if (maxPaymentForRow > 0) {
            const payment = Math.min(remainingPayment, maxPaymentForRow);
            remainingPayment -= payment;

            updatedInvoices[i] = {
              ...invoice,
              payment: (invoice.payment || 0) + payment,
            };
          }
        }
      }
    } else {
      // When no rows are selected, distribute payment starting from the top-most row
      for (let i = 0; i < updatedInvoices.length && remainingPayment > 0; i++) {
        const invoice = updatedInvoices[i];

        const maxPaymentForRow = invoice.BalanceAmount - (invoice.payment || 0);
        if (maxPaymentForRow > 0) {
          const payment = Math.min(remainingPayment, maxPaymentForRow);
          remainingPayment -= payment;

          updatedInvoices[i] = {
            ...invoice,
            payment: (invoice.payment || 0) + payment,
          };
        }
      }
    }

    setInvoices(updatedInvoices);
    setInputPayment(""); // Clear the input field

    // Recalculate the total payment
    const total = updatedInvoices.reduce(
      (sum, invoice) => sum + (invoice.payment || 0),
      0
    );
    setTotalPayment(total);
  };

  const getPaymentData = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/Payment/GetPayment?id=${idParam}`
      );
      setFormData((prevData) => ({
        ...prevData,
        PaymentNumber: res.data.PaymentNumber,
        IncomeAccount: res.data.AccountId,
        Date: res.data.TxnDate,
        PaymentNumber: res.data.PaymentNumber,
        PaymentMethodId: res.data.PaymentMethodId,
      }));
      // setTotalPayment(res.data.TotalAmount);
      // setInputPayment(res.data.TotalAmount);
      setPaymentinEditMode(res.data.TotalAmount);
      console.log("Invoicedata iss", res.data);
    } catch (error) {
      console.log("API call error", error);
    }
  };

  const [btnLoading, setBtnLoading] = useState(false);
  const submitPayment = async () => {
    setSubmitClicked(true);
    if (!formData.IncomeAccount) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Deposited to is required");
      return;
    }
    if (!formData.PaymentMethodId) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Payment Method to is required");
      return;
    }
    if (totalPayment <= 0) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("No payments recieved");
      return;
    }
    setBtnLoading(true);
    const filteredInvoices = invoices
      .filter((invoice) => invoice.payment > 0) // Only include invoices with non-zero payments
      .map((invoice) => ({
        InvoiceId: invoice.InvoiceId, // Keep the InvoiceId
        Amount: invoice.payment, // Subtract payment from amount
        PaymentInvoiceId: !idParam ? 0 : invoice.PaymentInvoiceId,
      }));
    const mainpayload = {
      PaymentId: idParam || 0,
      PaymentNumber: formData.PaymentNumber,
      TotalAmount: totalPayment || 0,
      CustomerId: selectedCustomer.CustomerId,
      AccountId: formData.IncomeAccount,
      CompanyId: Number(loggedInUser.CompanyId),
      PaymentMethodId: formData.PaymentMethodId,
      PrivateNote: "",
      UnappliedAmt: 0.0,
      TxnDate: formData.Date,
      tblPaymentInvoices: filteredInvoices,
    };
    const postData = new FormData();
    postData.append("PaymentData", JSON.stringify(mainpayload));
    console.log("mainPayloadis", mainpayload);
    try {
      const res = await axios.post(
        `${baseUrl}/api/Payment/AddPayment`,
        postData,
        {
          headers,
        }
      );
      setBtnLoading(false);
      console.log("AddPayment success", res.data);
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText("Payment done successfully");
      syncQB(res.data.SyncId);
      navigate(
        `/Payment?id=${res.data.Id}&CustomerId=${selectedCustomer.CustomerId}&CustomerName=${selectedCustomer.CustomerDisplayName}`
      );
      setTimeout(() => {
        // window.history.back();
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.log("API call error", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Unknown Error Sending Payment");
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    getInvoices();
  }, [selectedCustomer]);

  useEffect(() => {
    getIncomeAccount();
    getPaymentMethods();

    getPaymentData();
  }, []);

  // useEffect(() => {
  //   console.log("inputPayment", inputPayment);
  //   console.log("totalPayment", totalPayment);
  // }, [inputPayment, totalPayment]);

  return (
    <>
      <TitleBar icon={<PaymentOutlinedIcon />} title={"Payment"}></TitleBar>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="card m-3">
        <h4 className="modal-title itemtitleBar" id="#gridSystemModal1">
          Payments
        </h4>
        <div className="card-body">
          <div className="row mb-2">
            <div className="col-md-3">
              <label htmlFor="lastName" className="form-label">
                Customer
              </label>
              <CustomerAutocomplete
                formData={selectedCustomer}
                setFormData={setSelectedCustomer}
                submitClicked={false}
                onChange={(customer) => {
                  console.log("customercustomer", customer);
                  navigate(
                    `/Payment?id=${0}&CustomerId=${
                      customer.UserId
                    }&CustomerName=${customer.DisplayName}`
                  );
                }}
              />
              <label htmlFor="lastName" className="form-label mt-2">
                Payment Date<span className="text-danger">*</span>
              </label>
              <TextField
                type="date"
                className="form-control"
                size="small"
                name="Date"
                value={formatDate(formData.Date)}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-md-3 ">
              <label htmlFor="lastName" className="form-label">
                Payment Methods<span className="text-danger">*</span>
              </label>
              <Autocomplete
                size="small"
                options={paymentMethodList}
                getOptionLabel={(option) => option.Name || ""}
                value={
                  paymentMethodList.find(
                    (po) => po.PaymentMethodId === formData.PaymentMethodId
                  ) || null
                }
                onChange={(event, newValue) =>
                  handleAutocompleteChange(
                    "PaymentMethodId",
                    "PaymentMethodId",
                    event,
                    newValue
                  )
                }
                isOptionEqualToValue={(option, value) =>
                  option.PaymentMethodId === value.PaymentMethodId
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label=""
                    error={submitClicked && !formData.PaymentMethodId}
                    placeholder="Select Account"
                    className="bg-white"
                  />
                )}
                aria-label="Contact select"
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="lastName" className="form-label">
                Reference Number
              </label>
              <TextField
                className="form-control"
                size="small"
                name="PaymentNumber"
                value={formData.PaymentNumber}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3 ">
              <label htmlFor="lastName" className="form-label">
                Deposit to<span className="text-danger">*</span>
              </label>
              <Autocomplete
                size="small"
                options={incomeAccountList.filter(
                  (option) =>
                    option.Type === "OtherCurrentAsset" ||
                    option.Type === "Bank"
                )}
                getOptionLabel={(option) => option.Name || ""}
                value={
                  incomeAccountList.find(
                    (po) => po.AccountId === formData.IncomeAccount
                  ) || null
                }
                onChange={(event, newValue) =>
                  handleAutocompleteChange(
                    "IncomeAccount",
                    "AccountId",
                    event,
                    newValue
                  )
                }
                isOptionEqualToValue={(option, value) =>
                  option.AccountId === value.IncomeAccount
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label=""
                    error={submitClicked && !formData.IncomeAccount}
                    placeholder="Select Account"
                    className="bg-white"
                  />
                )}
                aria-label="Contact select"
              />
            </div>
            <div className="col-md-3">
            <div className="text-start">
                <label htmlFor="lastName" className="form-label">
                  Amount Recieved
                </label>
                {paymentinEditMode == 0 ? (
                  <TextField
                    type="number"
                    className="form-control mb-2"
                    size="small"
                    value={inputPayment ? inputPayment : totalPayment}
                    onChange={handleInputPaymentChange}
                    onBlur={applyInputPayment} // Apply payment logic on blur
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {inputPayment || totalPayment ? (
                            <IconButton
                              onClick={() => {
                                const updatedInvoices = invoices.map(
                                  (invoice) => ({
                                    ...invoice,
                                    payment: 0,
                                  })
                                );

                                setInvoices(updatedInvoices);
                                setInputPayment(0);
                                setTotalPayment(0);
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          ) : (
                            <></>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <TextField
                    type="number"
                    className="form-control mb-2"
                    size="small"
                    value={paymentinEditMode?.toFixed(2) || 0}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="row justify-content-end mb-2">
            <div className="col-md-3 text-end">
             
              {/* <div className="row">
                <div className="col-9 text-start"><h5>Total Payment</h5></div>
                <div className="col-3 text-start">${totalPayment}</div>
              </div> */}
              <LoaderButton
                loading={btnLoading}
                handleSubmit={submitPayment}
                disable={idParam ? true : false}
              >
                Save
              </LoaderButton>
            </div>
          </div>
          <TableContainer>
            <Table>
              <TableHead className="table-header">
                <TableRow>
                  <TableCell>
                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Orignal Amount $</TableCell>
                  <TableCell>Balance Amount $</TableCell>
                  <TableCell sx={{ width: "15em" }}>Payment</TableCell>
                </TableRow>
              </TableHead>
              {InvoiceLoading ? (
                <TableRow>
                  <TableCell colSpan={12}>
                    <div className="text-center">
                      <CircularProgress />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center" colSpan={12}>
                        No Record Found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((item, index) => (
                      <TableRow
                        className={`bill-tbl-alignment ${
                          selectedInvoices.includes(item.InvoiceId)
                            ? "selected-row"
                            : ""
                        }`}
                        key={index}
                        style={{ cursor: "pointer" }}
                        hover
                      >
                        <TableCell style={{ padding: "0.9em 0.5em" }}>
                          <Checkbox
                            checked={selectedInvoices.includes(item.InvoiceId)}
                            onChange={(e) =>
                              handleCheckboxChange(
                                e,
                                item.InvoiceId,
                                item.TotalAmount
                              )
                            }
                          />
                        </TableCell>
                        <TableCell
                          style={{
                            padding: "0.9em 0.5em",
                            maxWidth: "23em",
                          }}
                        >
                          {item.InvoiceNumber}{" "}
                          <NavLink
                            to={`/invoices/add-invoices?id=${item.InvoiceId}`}
                            target="_blank"
                          >
                            <ArrowOutwardIcon style={{ fontSize: 14 }} />
                          </NavLink>
                        </TableCell>
                        <TableCell style={{ padding: "0.9em 0.5em" }}>
                          {formatAmount(item.TotalAmount)}
                        </TableCell>
                        <TableCell style={{ padding: "0.9em 0.5em" }}>
                          {formatAmount(item.BalanceAmount)}
                        </TableCell>
                        <TableCell
                          style={{ padding: "0.9em 0.5em", width: "15em" }}
                        >
                          <TextField
                            type="number"
                            className="form-control"
                            size="small"
                            value={item.payment}
                            onChange={(e) =>
                              handlePaymentChange(e, index, item.BalanceAmount)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
};

export default PaymentsScreen;
