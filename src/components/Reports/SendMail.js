import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import EventPopups from "../Reusable/EventPopups";
import { Delete, Create } from "@mui/icons-material";
import Cookies from "js-cookie";
import LoaderButton from "../Reusable/LoaderButton";
import ReactQuill from "react-quill"; // Import the rich text editor component
import "react-quill/dist/quill.snow.css"; // Import styles for the rich text editor
import axios from "axios";
import { DataContext } from "../../context/AppData";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import BackButton from "../Reusable/BackButton";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import { BsFiletypePdf } from "react-icons/bs";
import { baseUrl } from "../../apiConfig";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "../Invoice/InvoicePDF";
import CircularProgress from "@mui/material/CircularProgress";
import RecurringTablePdf from "../RecurringBilling/RecurringBillingPdf";
const SendMail = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const title = queryParams.get("title");
  const id = queryParams.get("id");
  const mail = queryParams.get("mail");
  const customer = queryParams.get("customer");
  const contact = queryParams.get("contact");
  const number = queryParams.get("number");
  const isOpen = queryParams.get("isOpen");
  const token = Cookies.get("token");
  const invoiceIds = queryParams.get("invoiceIds");
  const invoiceData = JSON.parse(invoiceIds);
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const {
    selectedImages,
    setSelectedImages,
    loggedInUser,
    selectedPdf,
    setselectedPdf,
    selectedInvoices,
    setSelectedInvoices,
    companyInfo,
    dynamicColorAndLogo
  } = useContext(DataContext);
    console.log("🚀 ~ SendMail ~ dynamicColorAndLogo:", dynamicColorAndLogo)
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [Files, setFiles] = useState([]);
  const [CCInput, setCCInput] = useState("");
  const [CCs, setCCs] = useState([]);
  const [generatePDFLoader, setGeneratePDFLoader] = useState(false);
  const [editorContent, setEditorContent] = useState(
    `Dear  ${
      customer ? customer : ""
    } <br>Your ${title} has been created against ${title} number:${
      number ? number : ""
    }. We understand the importance of creating a beautiful and sustainable environment for your commercial space, and we are committed to delivering exceptional landscaping services that meet your unique needs.<br>Our dedicated team of experts is here to ensure that your landscaping dreams come to life, making your property not only aesthetically pleasing but also environmentally responsible.<br>Should you have any questions or require further assistance, please do not hesitate to contact our friendly customer support team. <br>Best Reguards <br>EarthCo Comercial Landscape`
  );
  const [subject, setSubject] = useState(
    `${customer} ${title} ${number ? "#" + number : " "}  ${
      isOpen ? "is " + isOpen : " "
    }`
  );

  const [disableButton, setDisableButton] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [fetchedInvoiceData, setFetchedInvoiceData] = useState([]);
  const [sendMailData, setMailData] = useState([]);
  const handleEmailInputChange = (event) => {
    setEmailInput(event.target.value.replace(" ", ""));
    setDisableButton(false);
  };
  const handleEditorChange = (value) => {
    setEditorContent(value);
    setDisableButton(false);
  };

  const handleEmailInputKeyPress = (event) => {
    if (event.key === "Enter" && emailInput.trim() !== "") {
      setEmails([...emails, emailInput.trim()]);
      setEmailInput("");
      setDisableButton(false);
    }
  };
  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleCCInputChange = (event) => {
    setCCInput(event.target.value);
    setDisableButton(false);
  };

  const handleCCInputKeyPress = (event) => {
    if (event.key === "Enter" && CCInput.trim() !== "") {
      setCCs((prevCCs) => [...prevCCs, CCInput.trim()]);
      setCCInput("");
      setDisableButton(false);
    }
  };
  const handleRemoveCC = (CCToRemove) => {
    setCCs(CCs.filter((CC) => CC !== CCToRemove));
  };

  const trackFile = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFiles((prevFiles) => [...prevFiles, uploadedFile]);
    }
  };
  const handleDeleteFile = (index) => {
    // Create a copy of the Files array without the file to be deleted
    const updatedFiles = [...Files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleSubmit = () => {
    const postData = new FormData();

    const filePathsArray = selectedImages.map((image) => image.FilePath);

    // Merge the current items with the new items for EmailData
    const mergedEmailData = {
      Id: id ? Number(id) : null,
      Email: emails.join(","),
      Type: title.replace(/\s+/g, ""),
      Number: number,
      CCEmail: CCs.join(","),
      Subject: subject,
      ReplyTo: loggedInUser.userEmail,
      ReplyToName: loggedInUser.userName,
      Body: editorContent,
      FilePaths: filePathsArray,
      CustomerData: sendMailData,

      // Pdf : selectedPdf
    };

    postData.append("EmailData", JSON.stringify(mergedEmailData));
    // Appending files to postData
    Files.forEach((fileObj) => {
      postData.append("Files", fileObj);
    });

    submitData(postData);
  };

  const submitData = async (postData) => {
    setDisableButton(true);
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Important for multipart/form-data requests
    };
    try {
      const response = await axios.post(
        `${baseUrl}/api/Email/SendEmailWithFile`,
        postData,
        {
          headers,
        }
      );

      setDisableButton(false);

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data);
    } catch (error) {
      console.error("API Call Error:", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setDisableButton(false);
      setSnackBarText(error.response.data);
    }

    // Logging FormData contents (for debugging purposes)
    for (let [key, value] of postData.entries()) {
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(indexToDelete, 1);
    setSelectedImages(updatedImages);
  };

  const [filesLoading, setFilesLoading] = useState(false);

  const handleGeneratePdf = async (formData, poAndBills,) => {
    try {
      const filteredLaborItems = formData.tblInvoiceItems?.filter((item) =>
        item.Name?.toLowerCase().includes("labor:is")
      );
      const newLaborTotalAmount = filteredLaborItems?.reduce(
        (acc, item) => acc + item.PurchasePrice * item.Qty,
        0
      );
      const filteredItems = formData.tblInvoiceItems?.filter(
        (item) => item.isCost === false
      );
      const billtotal = poAndBills.reduce(
        (acc, item) => acc + item.BillAmount,
        0
      );
      const newTotalAmount = filteredItems?.reduce(
        (acc, item) => acc + item.Rate * item.Qty,
        0
      );
      const blob = await pdf(
        <InvoicePDF
          data={{
            ...formData,
            BillTotal: billtotal,
            companyInfo: companyInfo,
            laborAmount: newLaborTotalAmount,
            dynamicColorAndLogo: dynamicColorAndLogo,
            SelectedCompany:
              loggedInUser.CompanyId == 2
                ? loggedInUser.CompanyName
                : "EarthCo Landscape",
            CustomerName: formData?.CustomerCompanyName,
            ApprovedItems: formData.tblInvoiceItems.filter(
              (item) => !item.IsMisc
            ),
            Amount: newTotalAmount,
           
            IncludePrices:true
          }}
        />
      ).toBlob();

      // Create a File object from the blob
      const pdfFile = new File(
        [blob],
        `Invoice ${formData.InvoiceNumber}.pdf`,
        {
          type: "application/pdf",
        }
      );

      // Append the new file to the existing state
      setFiles((prevFiles) => [...prevFiles, pdfFile]);
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };
  const processSingleInvoice = async (id) => {
    try {
      const fetchInvoiceData = async (idParam) => {
        if (!idParam) {
          throw new Error("Invalid invoice ID");
        }

        const res = await axios.get(
          `${baseUrl}/api/Invoice/GetInvoice?id=${idParam}`,
          { headers }
        );

        const combinedItems = [...res.data.CostItemData, ...res.data.ItemData];
        return {
          ...res.data.Data,
          tblInvoiceItems: combinedItems,
          poAndBills: res.data.EstimatePurchaseOrderData,
        };
      };

      const invoiceData = await fetchInvoiceData(id);

      await handleGeneratePdf(invoiceData, invoiceData.poAndBills);
    } catch (error) {
      console.error("Error processing single invoice:", error);
      throw error;
    }
  };
  const processInvoices = async (invoiceIds) => {
    if (invoiceIds.length == 0) {
      return;
    }
    setFilesLoading(true);
    try {
      for (const id of invoiceIds) {
        // Await each invoice processing sequentially
        await processSingleInvoice(id);
      }
      setFilesLoading(false);
    } catch (err) {
      console.error("Error processing invoices:", err);
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    processInvoices(selectedInvoices);
  }, []);

  useEffect(() => {
    setCCs((prevCCs) => [...prevCCs, loggedInUser.userEmail.trim()]);

    if (mail) {
      setEmails([...emails, mail.replace(" ", "")]);
    }

    if (title == `Recurring Bill` && mail) {
      // setEmails(mail.split(",").filter((e) => e));
      setEmails(
        mail
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e)
      );
    }
    if (!number) {
      setEditorContent(
        `Dear  ${
          customer ? customer : ""
        } <br>Please find the attached ${title}. Let me know if you have any questions.
        <br>Sincerely, <br>${loggedInUser.userName}.
        `
      );
      setSubject(`${title} ${customer ? customer : ""}`);
    }
    if (title == `Recurring Bill`) {
      setEditorContent(`<p>
      
      
      <strong>Dear  {CustomerName}</strong>,<br />
      
      Please find your invoice attached.
      <br />
      If there are any questions with this invoice(s) please feel free to contact
        us. If not please remit payment at your earliest convenience.
      <br />
      We appreciate your immediate attention to this matter.
      *Please send payments to ${companyInfo?.Address}
      *Please send service requests to service@earthcompany.org
      
        <br />
        
       Regards, <br />
       Yisel Ferreyra, <br />
       Accounts Receivable <br />
       ${loggedInUser.CompanyName} <br />
       O 714.571.0455 F <br />
       714.571.0580 <br />
    </p>`);

      setSubject(`Invoice #{InvoiceNumber} for {CustomerName}`);
    }
    if (title == `Invoice`) {
      setEditorContent(`<p>
      
      
        <strong>Dear  ${customer ? customer : ""}</strong>,<br />
      
      Please find your invoice attached.
      <br />
        If there are any questions with this invoice(s) please feel free to contact
        me. If not please remit payment at your earliest convenience.
      <br />
      We appreciate your immediate attention to this matter.
      *Please send payments to ${companyInfo?.Address}
      *Please send service requests to service@earthcompany.org
      
        <br />
      
       Regards, <br />
       Yisel Ferreyra, <br />
       Accounts Receivable <br />
       ${loggedInUser?.CompanyName} <br />
       O 714.571.0455 F <br />
       714.571.0580 <br />
    </p>`);

      setSubject(`Invoice #${number} for ${customer}`);
    }
    if (title == `Invoices`) {
      setEditorContent(`Dear  ${
        customer ? customer : ""
      } <br>Can we please get a status of payment on the attached open and past due invoices?<br>Thanks<br />
       ${loggedInUser.userName} <br />
       ${loggedInUser.CompanyName} <br />`);

      setSubject(`Invoices for ${customer}`);
    }

    if (title == `Service Request` && isOpen == "Open") {
      setEditorContent(`<p>
      <strong>Dear ${
        contact ? contact : ""
      }</strong>, <br/><br/>Thank you for submitting your Service Request. We have processed your request, and have listed some important information attached to this e-mail.
      <br/><br/>If you have any additional questions or concerns, please contact us at ${
        loggedInUser.userEmail
      }. You can also reach us by telephone at 714.571.0455.
      <br/><br/>Thank you for choosing Earthco.
      <br/><br/>Sincerely,<br/>${loggedInUser.userName},</p>`);
    }
    if (title == `Service Request` && isOpen == "Closed") {
      setEditorContent(`   <p>
      <strong>Dear ${
        contact ? contact : ""
      },</strong> <br/><br/>The following Service Request - #${number} has been Closed.  We have completed your request, and have listed some important information attached to this e-mail.
       <br/><br/>If you have any additional questions or concerns, please contact us at ${
         loggedInUser.userEmail
       }. You can also reach us by telephone at 714.571.0455.
       <br/><br/>Thank you for choosing Earthco.
       <br/><br/>Sincerely,
       <br/>${loggedInUser.userName},</p>`);
    }
    if (title == `Estimate`) {
      setEditorContent(`<p>Hello ${customer ? customer : ""},
        <br/><br/>Please see the attached proposal.  Please confirm receipt.
        <br/><br/>Contact me if you have any questions.
        <br/><br/>Thank you!<br/><br/> 
        
        <br/>${loggedInUser.userName}
        <br/>EarthCo`);

      setSubject(`Proposal ${number} for ${customer}`);
    }
    // if (title == `Invoice`) {
    //   setFiles([selectedPdf]);
    // }
    setFiles([selectedPdf]);

    return () => {
      setSelectedImages([]);
      setSelectedInvoices([]);
    };
  }, []);
  const uploadInvoicePdf = async (invoiceId, pdfFile,invoiceNumberFromAPI) => {
    const formData = new FormData();
    formData.append("InvoiceId", invoiceId);
    formData.append("Files", pdfFile);
    formData.append("InvoiceNumber", invoiceNumberFromAPI);
    try {
      const response = await axios.post(
        `${baseUrl}/api/Invoice/UploadInvoicePDF`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
  const generatePdfForInvoice = async (invoiceData) => {
    const formData = invoiceData;

    // // Prepare your props (adapt as needed)
    const blob = await pdf(
      <RecurringTablePdf
        data={{
          ...formData,
          companyInfo: companyInfo,
          dynamicColorAndLogo: dynamicColorAndLogo,
        }}
      />
    ).toBlob();

    return new File([blob], `Invoice.pdf`, {
      type: "application/pdf",
    });
  };
  const fetchInvoiceById = async (invoiceId) => {
    const exists = fetchedInvoiceData.some(
      (inv) => inv.Data?.InvoiceId === invoiceId
    );
    if (exists) {
      return fetchedInvoiceData.find(
        (inv) => inv.Data?.InvoiceId === invoiceId
      );
    }

    try {
      const res = await axios.get(
        `${baseUrl}/api/Invoice/GetInvoice?id=${invoiceId}`,
        { headers }
      );
      setFetchedInvoiceData((prev) => [...prev, res.data]);

      return res.data;
    } catch (error) {
      console.error(`Failed to fetch invoice ${invoiceId}:`, error);
      return null;
    }
  };
  useEffect(() => {
    const processInvoices = async () => {
      let arr = [];

      for (const item of invoiceData) {
        const { invoiceId, editDate, pdfgeneratorDate, email, customerId } =
          item;

        const invoiceEditDate = editDate ? new Date(editDate) : null;
        const invoicePdfDate = pdfgeneratorDate
          ? new Date(pdfgeneratorDate)
          : null;

        arr.push({
          Email: email,
          CustomerId: customerId,
          InvoiceId: invoiceId,
        });

        if (
          invoiceEditDate > invoicePdfDate ||
          (invoiceEditDate == null && invoicePdfDate == null)
        ) {
          try {
            const invoiceData = await fetchInvoiceById(invoiceId);
            if (!invoiceData) continue;

            const pdfFile = await generatePdfForInvoice(invoiceData);
            const invoiceNumberFromAPI = invoiceData?.Data?.InvoiceNumber;
            await uploadInvoicePdf(invoiceId, pdfFile,invoiceNumberFromAPI);
          } catch (err) {
            console.error("Error in processing invoice:", err);
          }
        }
      }

      setMailData(arr);
    };

    if (invoiceIds && invoiceIds.length > 0) {
      const run = async () => {
        setGeneratePDFLoader(true);
        await processInvoices(); // ✅ await async function
        setGeneratePDFLoader(false);
      };

      run();
    }
  }, [invoiceIds]);

  return (
    <div className="container-fluid">
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="card">
        <div className="card-header">
          <h4>
            {`Email ${title} #${title == `Recurring Bill` ? "" : number}`}
          </h4>
        </div>
        <div className="card-body ">
          <div className="row text-center">
            <div className="col-md-1"></div>
            <div className="col-md-1 text-start">
              {" "}
              <label className="form-label">To</label>
            </div>
            <div className="col-md-6">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  // borderBottom: "1px solid rgba(0, 0, 0, 0.42)", // match MUI underline
                  // paddingBottom: "4px",
                  // minHeight: "40px",
                }}
              >
                {emails.map((email, i) => (
                  <Chip
                    key={i}
                    label={email}
                    size="small"
                    onDelete={() => handleRemoveEmail(email)}
                    color="primary"
                  />
                ))}
              </div>
              {title == `Recurring Bill` && (
                <div className="border-bottom mt-1" />
              )}
              {title !== `Recurring Bill` && (
                <TextField
                  fullWidth
                  variant="standard"
                  label=""
                  size="small"
                  value={emailInput}
                  onChange={handleEmailInputChange}
                  onKeyPress={handleEmailInputKeyPress}
                  onBlur={() => {
                    if (emailInput) {
                      setEmails([...emails, emailInput.trim()]);
                      setEmailInput("");
                      setDisableButton(false);
                    }
                  }}
                  placeholder="Enter email and press enter"
                />
              )}
            </div>
          </div>

          <div className="row mt-2 text-center">
            <div className="col-md-1"></div>
            <div className="col-md-1 text-start">
              {" "}
              <label className="form-label">Cc</label>
            </div>
            {/* <div className="col-md-6">
              
              <TextField
                fullWidth
                variant="standard"
                label=""
                size="small"
                value={CCInput}
                onChange={handleCCInputChange}
                onKeyPress={handleCCInputKeyPress}
                onBlur={() => {
                  if (CCInput) {
                    setCCs((prevCCs) => [...prevCCs, CCInput.trim()]);
                    setCCInput("");
                    setDisableButton(false);
                  }
                }}
                InputProps={{
                  startAdornment: CCs.map((CC, i) => (
                    <Chip
                      key={i}
                      label={CC}
                      size="small"
                      onDelete={() => handleRemoveCC(CC)}
                      color="primary"
                    />
                  )),
                }}
                placeholder="Enter CC and press enter"
              />
            </div> */}
            <div className="col-md-6">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                {CCs.map((CC, i) => (
                  <Chip
                    key={i}
                    label={CC}
                    size="small"
                    onDelete={() => handleRemoveCC(CC)}
                    color="primary"
                  />
                ))}
              </div>

              <TextField
                fullWidth
                variant="standard"
                label=""
                size="small"
                value={CCInput}
                onChange={handleCCInputChange}
                onKeyPress={handleCCInputKeyPress}
                onBlur={() => {
                  if (CCInput) {
                    setCCs((prevCCs) => [...prevCCs, CCInput.trim()]);
                    setCCInput("");
                    setDisableButton(false);
                  }
                }}
                placeholder="Enter CC and press enter"
              />
            </div>
          </div>

          <div className="row mt-2 text-center">
            <div className="col-md-1"></div>

            <div className="col-md-1 text-start">
              <label className="form-label">Subject</label>
            </div>
            <div className="col-md-6">
              <TextField
                fullWidth
                variant="standard"
                size="small"
                placeholder="Proposal for"
                label=""
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                }}
              />
            </div>

            <div className="row mt-2"></div>

            <div className="row mt-2">
              <div className="col-md-2 text-start"></div>
              <div className="col-md-8">
                <ReactQuill
                  className="text-start"
                  value={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Write your message here..."
                  theme="snow"
                />
              </div>
              <div className="col-md-2 text-start"></div>
              <div className="col-md-2 text-start"></div>
              <div className="col-md-3 text-start mt-2">
                <CustomizedTooltips
                  title="Click To Attach Files"
                  placement="top"
                >
                  <AttachFileIcon
                    sx={{
                      fontSize: 23,
                      color: "black",
                      marginRight: "0.5em",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const fileInput = document.createElement("input");
                      fileInput.type = "file";
                      fileInput.multiple = true;
                      fileInput.click(); // Trigger the file input click event
                      fileInput.addEventListener("change", trackFile);
                    }}
                  />
                </CustomizedTooltips>
              </div>
              <div className="col-md-5 text-end mt-3">
                <BackButton
                  onClick={() => {
                    window.history.back();
                  }}
                >
                  Back
                </BackButton>
                <LoaderButton
                  disable={btnDisable || filesLoading || generatePDFLoader}
                  loading={disableButton || generatePDFLoader}
                  handleSubmit={() => {
                    handleSubmit();
                  }}
                >
                  Send
                </LoaderButton>
                {generatePDFLoader && (
                  <p>
                    Generating PDF and sending it to the server. Please wait...
                  </p>
                )}
              </div>
              <div className="col-md-2 text-start"></div>
              <div className="col-md-2 text-start"></div>
              {/* <div className="col-md-8 text-start mt-2 d-flex">
              
                {selectedImages?.map((file, index) => (
                  <div className="card" style={{ height: "fit-content",maxWidth:"33%" }}>
                    <div
                      className="row g-0"
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div className="col-md-4">
                        {file.FileName?.includes(".pdf") ? (
                          <div>
                            <BsFiletypePdf color="#ff0000" fontSize="50px" />
                          </div>
                        ) : (
                          <img
                            src={`${baseUrl}/${file.FilePath}`}
                            alt={file.name}
                            className="img-fluid rounded-start "
                          />
                        )}
                      </div>
                      <div
                        className="col-md-6 ps-1"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {file.FileName}
                      </div>
                      <div className="col-md-2 text-end">
                        {" "}
                        <Delete
                          color="error"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            handleDeleteImage(index);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {filesLoading ? (
                  <CircularProgress />
                ) : (
                  <>
                    {Files?.map((file, index) => (
                      <div key={index} >
                        {file.name ? (
                          <div
                            key={index}
                            className="card"
                            style={{ height: "fit-content" }}
                          >
                            <div
                              className="row g-0"
                              style={{
                                display: "flex", // Add flex display
                                alignItems: "center", // Align items vertically in the middle
                              }}
                            >
                              <div
                                className={
                                  file.name.includes(".pdf")
                                    ? "col-md-2"
                                    : "col-md-4"
                                }
                              >
                                {file?.name?.includes(".pdf") ? (
                                  <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                      // Create a File object from the blob
                                      const pdfFile = new File(
                                        [file],
                                        file?.name,
                                        {
                                          type: "application/pdf",
                                        }
                                      );

                                      const blobUrl =
                                        window.URL.createObjectURL(pdfFile);

                                      // Create a link element
                                      const link = document.createElement("a");
                                      link.href = blobUrl;
                                      link.download = file.name; // Set the file name

                                      // Append link to the body
                                      document.body.appendChild(link);

                                      // Programmatically click the link to trigger the download
                                      link.click();

                                      // Remove the link from the DOM
                                      document.body.removeChild(link);
                                      return;
                                    }}
                                  >
                                    <BsFiletypePdf
                                      color="#ff0000"
                                      fontSize="50px"
                                    />
                                  </div>
                                ) : (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="img-fluid rounded-start"
                                  />
                                )}
                              </div>
                              <div
                                className="ps-2 col"
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {" "}
                                {file.name}
                              </div>
                              <div className="col-md-2 text-end">
                                {" "}
                                <Delete
                                  color="error"
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    handleDeleteFile(index);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    ))}
                  </>
                )}
               
              </div> */}
              <div className="row col-md-8 mx-1 mt-2">
                {selectedImages?.map((file, index) => (
                  <div key={index} className="col-md-3 mb-3">
                    <div className="position-relative">
                      {file.FileName?.includes(".pdf") ? (
                        <BsFiletypePdf color="#ff0000" fontSize="80px" />
                      ) : (
                        <img
                          src={`${baseUrl}/${file.FilePath}`}
                          alt={file.name}
                          className="img-fluid rounded"
                          style={{ width: "62%", height: "110px" }}
                        />
                      )}

                      <div
                        className="position-absolute"
                        style={{ top: "5px", right: "42px", zIndex: 1 }}
                      >
                        <Delete
                          color="error"
                          style={{
                            cursor: "pointer",
                            borderRadius: "50%",
                          }}
                          onClick={() => handleDeleteImage(index)}
                        />
                      </div>
                    </div>

                    <div
                      className="ps-1 mt-1"
                      style={{
                        overflow: "hidden",
                        fontSize: "9px",
                        width: "62%",
                        marginLeft: "13%",
                      }}
                    >
                      {file.FileName}
                    </div>
                  </div>
                ))}
                {filesLoading ? (
                  <CircularProgress />
                ) : (
                  Files?.map((file, index) =>
                    file.name ? (
                      <div key={index} className="col-md-3 mb-3">
                        <div className="position-relative">
                          {/* Image or PDF icon */}
                          {file?.name?.includes(".pdf") ? (
                            <div
                              className="cursor-pointer d-flex justify-content-center"
                              onClick={() => {
                                const pdfFile = new File([file], file?.name, {
                                  type: "application/pdf",
                                });
                                const blobUrl =
                                  window.URL.createObjectURL(pdfFile);
                                const link = document.createElement("a");
                                link.href = blobUrl;
                                link.download = file.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <BsFiletypePdf color="#ff0000" fontSize="80px" />
                            </div>
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="img-fluid rounded"
                              style={{ width: "62%", height: "110px" }}
                            />
                          )}

                          {/* Delete icon on top-right */}
                          <div
                            className="position-absolute"
                            style={{ top: "5px", right: "42px", zIndex: 1 }}
                          >
                            <Delete
                              color="error"
                              style={{
                                cursor: "pointer",
                                borderRadius: "50%",
                              }}
                              onClick={() => handleDeleteFile(index)}
                            />
                          </div>
                        </div>

                        {/* File name */}
                        <div
                          className="ps-1 mt-1"
                          style={{
                            // whiteSpace: "nowrap",
                            overflow: "hidden",
                            fontSize: "9px",
                            width: "62%",
                            marginLeft: "13%",
                          }}
                        >
                          {file.name}
                        </div>
                      </div>
                    ) : null
                  )
                )}

                {/* {filesLoading ? (
                  <CircularProgress />
                ) : (
                  Files?.map((file, index) =>
                    file.name ? (
                      <div key={index} className="col-md-4 mb-3">
                          <div className="row g-0 align-items-center">
                            <div
                              // className={
                              //   file.name.includes(".pdf")
                              //     ? "col-md-2"
                              //     : "col-md-4"
                              // }
                            >
                              {file?.name?.includes(".pdf") ? (
                                <div
                                  className="cursor-pointer"
                                  onClick={() => {
                                    const pdfFile = new File(
                                      [file],
                                      file?.name,
                                      {
                                        type: "application/pdf",
                                      }
                                    );
                                    const blobUrl =
                                      window.URL.createObjectURL(pdfFile);
                                    const link = document.createElement("a");
                                    link.href = blobUrl;
                                    link.download = file.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <BsFiletypePdf
                                    color="#ff0000"
                                    fontSize="50px"
                                  />
                                </div>
                              ) : (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="img-fluid rounded-start"
                                />
                              )}
                            </div>
                            <div
                              className="ps-2 col"
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {file.name}
                            </div>
                            <div className=" text-end">
                              <Delete
                                color="error"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleDeleteFile(index)}
                              />
                            </div>
                          </div>
                        </div>
                
                    ) : null
                  )
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMail;
