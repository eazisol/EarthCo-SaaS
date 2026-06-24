import React from "react";
import SignatureCanvas from "react-signature-canvas";
const SignInput = ({ sign, setSign,  setUrl,modalId="basicModalSignature",imageName="signature.png" }) => {
  const handleClear = () => {
    sign.clear();
    setUrl("");
  };
  const handleGenerate = () => {
    const dataUrl = sign.getTrimmedCanvas().toDataURL("image/png");

    // Convert data URL to Blob
    const blob = dataURLtoBlob(dataUrl);

    // Create a File object
    const file = new File([blob], imageName, { type: "image/png" });

    // Now you can use this `file` object similar to the uploaded file
    console.log("Generated File:", file);
    setUrl(file); // Set the file object in state if needed
  };

  // Helper function to convert data URL to Blob
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div>
      <div className="modal fade" id={modalId}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Signature</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div
              className="modal-body d-flex justify-content-center"
              style={{ width: "fit-content" }}
            >
              <div
                style={{ border: "1px dotted grey", width: 450, height: 400 }}
              >
                <SignatureCanvas
                  canvasProps={{
                    width: 450,
                    height: 400,
                    className: "sigCanvas",
                  }}
                  ref={(data) => setSign(data)}
                />
            <div className="text-end w-100 text-info text-decoration-underline mb-2" >
              <span style={{cursor : "pointer"}}  onClick={handleClear}>Clear</span>
            </div>
            <br />
            <br />
              </div>
            </div>
            <div className="modal-footer mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                onClick={() => {}}
              >
                Close
              </button>
             
              <button
                type="submit"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleGenerate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        style={{ cursor: "pointer" }}
        className="btn btn-outline-secondary border-secondary"
        data-bs-toggle="modal"
        data-bs-target={`#${modalId}`}
      >
        <>Add Signature</>
      </button>
    </div>
  );
};

export default SignInput;
