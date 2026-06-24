import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SRPdf from './SRPdf'; // Import your SRPdf component
import SprayTechPdf from './SprayTechPdf'; // Import your SprayTechPdf component
import PrintButton from './PrintButton'; // Import your PrintButton component
import { navigate } from 'gatsby'; // Import navigate from Gatsby

const YourComponent = ({ SRData, contactEmail, name, selectedContact, idParam, sRPreviewData }) => {
  const [pdfBlob, setPdfBlob] = useState(null);

  const handleMainButtonClick = () => {
    // Generate the PDF blob
    const pdfBlob = generatePdfBlob();
    // Store the PDF blob in the state
    setPdfBlob(pdfBlob);
  };

  const generatePdfBlob = () => {
    // Generate PDF content based on your logic
    const pdfContent = SRData.ServiceRequestData.SRTypeId === 8 ? (
      <SprayTechPdf sRPreviewData={{ ...sRPreviewData, name: name }} />
    ) : (
      <SRPdf data={{ ...sRPreviewData, name: name }} />
    );

    // Convert PDF content to blob
    // (You may need to adjust this part based on your PDF generation library)
    // This is just an example assuming PDF content is already in blob format
    // Replace 'application/pdf' with the correct MIME type if necessary
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return blob;
  };

  return (
    <>
      <PrintButton
        variant="mail"
        onClick={() => {
          // Handle main button click
          handleMainButtonClick();
          // Your other logic here
        }}
      />
      <PrintButton
        variant="print"
        onClick={() => {
          if (SRData.ServiceRequestData.SRTypeId === 8) {
            navigate(`/service-requests/spray-tech-preview?id=${idParam}`);
          } else {
            navigate(`/service-requests/service-request-preview?id=${idParam}`);
          }
        }}
      />
      <PDFDownloadLink
        document={pdfBlob} // Use the PDF blob from the state
        fileName="Service Request.pdf"
      >
        {({ loading }) =>
          loading ? (
            ' '
          ) : (
            <PrintButton variant="Download" />
          )
        }
      </PDFDownloadLink>
    </>
  );
};

export default YourComponent;
