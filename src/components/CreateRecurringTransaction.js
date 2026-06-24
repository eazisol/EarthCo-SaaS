import axios from "axios";
import Cookies from "js-cookie";
import { useContext, useEffect, useState } from "react";
import { baseUrl } from "../apiConfig";
import RecurringTablePdf from "./RecurringBilling/RecurringBillingPdf";
import { pdf } from "@react-pdf/renderer";
import { DataContext } from "../context/AppData";
import useQuickBook from "./Hooks/useQuickBook";
export const CreateRecurringTransaction = () => {
    const [sendMailData, setMailData] = useState([]);
    const {
        loggedInUser,
        companyInfo,
    } = useContext(DataContext);
    const companyId = companyInfo?.CompanyId;
    const { syncQB } = useQuickBook();
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [fetchedInvoiceData, setFetchedInvoiceData] = useState([]);
    const token = Cookies.get("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const uploadInvoicePdf = async (invoiceId, pdfFile,invoiceNumberFromAPI) => {
        const formData = new FormData();
        formData.append("InvoiceId", invoiceId);
        formData.append("Files", pdfFile);
        formData.append("InvoiceNumber", invoiceNumberFromAPI);
        try {
            await axios.post(
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

    // const uploadInvoicePdf = async (invoiceId, pdfFile) => {
    //     const formData = new FormData();
    //     formData.append("InvoiceId", invoiceId);
    //     formData.append("Files", pdfFile);

    //     try {
    //         await axios.post(
    //             `${baseUrl}/api/Invoice/UploadInvoicePDF`,
    //             formData,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     "Content-Type": "multipart/form-data",
    //                 },
    //             }
    //         );

    //         handleSubmit(sendMailData)
    //     } catch (error) {
    //         console.error("Upload failed:", error);
    //     }
    // };
    const handleSubmit = (emailData) => {
        const safeData = emailData.filter(e => e.isEmailSend); // Safety check
        const uniqueEmails = [...new Set(safeData.map(e => e.Email))].join(',');
        const postData = new FormData();

        let emailBody = `Dear {CustomerName},

 Please find your invoice attached. 

 If there are any questions with this invoice(s) please feel free to contact us. If not please remit payment at your earliest convenience. 

 We appreciate your immediate attention to this matter. *Please send payments to 1225 E. Wakeham, Santa Ana, CA 92705 *Please send service requests to service@earthcompany.org 

 Regards, 

 Yisel Ferreyra, 

 Accounts Receivable 

 Earthco Commercial Landscape 

 O 714.571.0455 F 

 714.571.0580 `
        const mergedEmailData = {
            Id: null,
            Email: uniqueEmails,
            Type: 'autorecurringbill',
            Number: null,
            CCEmail: '',
            Subject: 'Invoice #{InvoiceNumber} for {CustomerName}',
            ReplyTo: loggedInUser.userEmail,
            ReplyToName: loggedInUser.userName,
            Body: emailBody,
            FilePaths: [],
            CustomerData: safeData,
        };
        postData.append("EmailData", JSON.stringify(mergedEmailData));
        // submitData(postData);
    };
    const submitData = async (postData) => {
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        };
        try {
            const response = await axios.post(
                `${baseUrl}/api/Email/SendEmailWithFile`,
                postData,
                {
                    headers,
                }
            );
        } catch (error) {
        }
    };
    const generatePdfForInvoice = async (invoiceData) => {
        const formData = invoiceData;
        const blob = await pdf(
            <RecurringTablePdf
                data={{
                    ...formData,
                    companyInfo: companyInfo,
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
            return null;
        }
    };
    const processInvoices = async (invoiceData) => {
        const willBeEmailed = []; // ✅ Email bhejne ke liye sirf true records yahan push karenge

        for (const item of invoiceData) {
            const { InvoiceId, isEmailSend } = item;

            try {
                await syncQB(0);

                const invoice = await fetchInvoiceById(InvoiceId);
                if (!invoice) continue;
                const invoiceNumberFromAPI = invoice?.Data?.InvoiceNumber;
                const pdfFile = await generatePdfForInvoice(invoice);
                await uploadInvoicePdf(InvoiceId, pdfFile,invoiceNumberFromAPI);

                if (isEmailSend) {
                    willBeEmailed.push(item); // ✅ Sirf email flag true wale
                }
            } catch (err) {
                console.error(`Error processing invoice ${InvoiceId}:`, err);
            }
        }

        // ✅ Loop ke baad ek hi dafa email bhejo
        // if (willBeEmailed.length > 0) {
        //     handleSubmit(willBeEmailed);
        // }
    };

    // const processInvoices = async (invoiceData) => {


    //     for (const item of invoiceData) {
    //         const { InvoiceId, Email, CustomerId, isEmailSend } =
    //             item;

    //         try {
    //             await syncQB(0)

    //             const invoiceData = await fetchInvoiceById(InvoiceId);

    //             if (!invoiceData) continue;

    //             const pdfFile = await generatePdfForInvoice(invoiceData);
    //             await uploadInvoicePdf(InvoiceId, pdfFile);

    //         } catch (err) {
    //             console.error("Error in processing invoice:", err);
    //         }
    //     }


    // };
    useEffect(() => {
        const fetchInvoiceData = async () => {
            try {
                const { data } = await axios.get(
                    `${baseUrl}/api/RecurringTempelate/CreateInvoiceFromTemplate`,
                    { headers }
                );
                setMailData(data);

            } catch (err) {
                console.error(err);
            }
        };

        fetchInvoiceData();
    }, []);
    useEffect(() => {
        if (!companyId || !sendMailData.length) return;
        processInvoices(sendMailData);
    }, [companyId, sendMailData]);

    return (
        <di>Test</di>
    )
}