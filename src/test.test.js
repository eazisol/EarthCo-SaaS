
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
  if (value<0) {
    value =0
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
  if (value<0) {
    value =0
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
    const selectedInvoicesData = invoices.filter((invoice) =>
      selectedInvoices.includes(invoice.InvoiceId)
    );
  
    // Calculate the total balance of selected rows
    const totalSelectedBalance = selectedInvoicesData.reduce(
      (sum, invoice) => sum + invoice.BalanceAmount,
      0
    );
  
    
    // Ensure the payment does not exceed the total balance of selected rows
    if (remainingPayment > totalSelectedBalance) {
      remainingPayment = totalSelectedBalance;
    }
  
    // Copy the invoices array to apply payments
    const updatedInvoices = [...invoices];
  
    // Distribute payment starting from the bottom-most selected row
    for (let i = updatedInvoices.length - 1; i >= 0 && remainingPayment > 0; i--) {
      const invoice = updatedInvoices[i];
  
      if (selectedInvoices.includes(invoice.InvoiceId)) {
        const maxPaymentForRow =
          invoice.BalanceAmount - (invoice.payment || 0); // Max allowable payment for this row
        if (maxPaymentForRow > 0) {
          const payment = Math.min(remainingPayment, maxPaymentForRow);
          remainingPayment -= payment;
  
          // Update the payment for the current row
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
  } else {
    for (
      let i = updatedInvoices.length - 1;
      i >= 0 && remainingPayment > 0;
      i--
    ) {
      const invoice = updatedInvoices[i];
      const maxPaymentForRow = invoice.BalanceAmount;
      if (maxPaymentForRow > 0) {
        const payment = Math.min(remainingPayment, maxPaymentForRow);
        remainingPayment -= payment;
        updatedInvoices[i] = {
          ...invoice,
          payment: invoice.payment + payment,
        };
      }
    }
  }

  setInvoices(updatedInvoices);
  setInputPayment(""); // Clear the input field

  // Recalculate the total payment
  const total = updatedInvoices.reduce(
    (sum, invoice) => sum + invoice.payment,
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
    setTotalPayment(res.data.TotalAmount);
    setInputPayment(res.data.TotalAmount);

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
      PaymentInvoiceId:
        invoice.PaymentInvoiceId == null ? 0 : invoice.PaymentInvoiceId,
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
      window.location.reload()
    }, 3000);
  } catch (error) {
    console.log("API call error", error);
    setOpenSnackBar(true);
    setSnackBarColor("error");
    setSnackBarText("Unknown Error Sending Payment");
    setBtnLoading(false);
  }
};

<>
<div className="text-start">
                <label htmlFor="lastName" className="form-label">
                  Amount Recieved
                </label>
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
              {item.TotalAmount.toFixed(2)}
            </TableCell>
            <TableCell style={{ padding: "0.9em 0.5em" }}>
              {item.BalanceAmount.toFixed(2)}
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
</TableContainer></>