import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
const Privacypolicy = ({ setShowPrivacyPolicy }) => {
  return (
    <div>
      <div>
        <div>
          <div>
            <div className="row">
              <div
                className="col-md-1 col-sm-1 mt-2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShowPrivacyPolicy(false);
                }}
              >
                <ArrowBackIcon />
              </div>
              <div className="col-md-11 col-sm-11">
                <h2>Privacy Policy</h2>
              </div>
            </div>
          </div>
          <div>
            <h4>Introduction</h4>
            <li>
              Earthco Landscape ("we," "us," or "our") operates Earthco Web
              Application ("Application"). This Privacy Policy outlines the
              types of information collected from users of the Application and
              how we use, disclose, and protect that information.
            </li>
            <h5>Information We Collect</h5>
<div className="row">
  <div className="col-md-1 text-end">&#9679;</div>
  <div className="col-md-11">
    <strong>Personal Information:</strong> When you use the Application, we may collect personally identifiable information, such as names, email addresses, phone numbers (optional), and any other information you voluntarily provide.
  </div>
</div>
<div className="row">
  <div className="col-md-1 text-end">&#9679;</div>
  <div className="col-md-11">
    <strong>Usage Data: </strong> We collect information on how you access and use the Application ("Usage Data"). This Usage Data may include your device's Internet Protocol address (IP address), browser type, browser version, pages visited within the Application, time and date of your visit, duration of use, and other diagnostic data. We may also use cookies and similar tracking technologies to collect additional Usage Data.
  </div>
</div>

<h5>Use of Information</h5>
<div className="row">
  <div className="col-md-1 text-end">&#9679;</div>
  <div className="col-md-11">
    We may use the collected information for various purposes, including:
    <ul>
      <li>Providing and maintaining the Application</li>
      <li>Improving user experience and functionalities</li>
      <li>Sending updates or notifications (with your consent)</li>
      <li>Analyzing usage trends to improve the Application</li>
      <li>Personalizing your experience within the Application (if applicable)</li>
    </ul>
    We may share some Usage Data with third-party service providers (names of providers, if possible) to help us operate the Application and analyze trends. These service providers are obligated to protect your information.
  </div>
</div>
            <div className="row">
              <div className="col-md-1 text-end">&#9679;</div>
              <div className="col-md-11">
                <strong>Usage Data: </strong>: We may collect information on how
                the Application is accessed and used ("Usage Data"). This Usage
                Data may include information such as your computer's Internet
                Protocol address, browser type, browser version, pages visited,
                time and date of your visit, and other diagnostic data.
              </div>
            </div>

            <h5 className="mb-0">Use of Information</h5>
            <div className="row">
              <div className="col-md-1 text-end">&#9679;</div>
              <div className="col-md-11">
                We may use the collected information for various purposes,
                including but not limited to providing and maintaining the
                Application, improving user experience, sending updates or
                notifications, and analyzing usage trends.
              </div>
            </div>
            <h5 className="mb-0">Data Security</h5>
            <div className="row">
              <div className="col-md-1 text-end">&#9679;</div>
              <div className="col-md-11">
                EarthCo takes reasonable measures to secure and protect the
                information collected. However, no method of transmission over
                the internet or electronic storage is completely secure. We
                cannot guarantee absolute security of your data.
              </div>
            </div>

            <h5 className="mb-0">Disclosure of Information</h5>
            <div className="row">
              <div className="col-md-1 text-end">&#9679;</div>
              <div className="col-md-11">
                We do not disclose or share personal information except in cases
                required by law or to protect our rights or property.
              </div>
            </div>
            <h5>Your Rights</h5>
<div className="row">
  <div className="col-md-1 text-end">&#9679;</div>
  <div className="col-md-11">
    You have the right to access, update, or delete your personal information collected through the Application. You can also opt out of certain data collection practices (explain how, if applicable).  Please contact us at [Contact Information] for any inquiries related to your information.
  </div>
</div>

            <h5 className="mb-0">Changes to This Privacy Policy</h5>
            <div className="row">
              <div className="col-md-1 text-end">&#9679;</div>
              <div className="col-md-11">
                We reserve the right to update or change our Privacy Policy at
                any time. Your continued use of the Application after we post
                any modifications to the Privacy Policy on this page will
                constitute your acknowledgment of the modifications and your
                consent to abide and be bound by the updated Privacy Policy.
              </div>
            </div>

            <h5 className="mb-0">Contact Us</h5>
            <div className="row">
              <div className="col-md-1 text-end">&#9679;</div>
              <div className="col-md-11">
                If you have any questions about this Privacy Policy, please
                contact us at [Contact Information]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacypolicy;
