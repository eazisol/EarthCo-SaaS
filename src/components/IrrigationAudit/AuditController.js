import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Alert from "@mui/material/Alert";
import { TextField, Button } from "@mui/material";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import { Delete, Create } from "@mui/icons-material";
import FileUploadButton from "../Reusable/FileUploadButton";
import { baseUrl } from "../../apiConfig";
import imageCompresser from "../../custom/ImageCompresser";

const AuditController = ({
  setAddSucces,
  idParam,
  toggleShowForm,
  fetchIrrigation,
  formData, setFormData,
  morePhoto,
  setMorePhoto,
}) => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  // const [formData, setFormData] = useState({});
  const [addError, setAddError] = useState("");
  const [showAdditional, setShowAdditional] = useState(false);
  const [additionalFiles, setAdditionalFiles] = useState(morePhoto);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const handleChange = (e) => {
    setEmptyFieldError(false);
    setDisableButton(false);
    const { name, value } = e.target;
    const parsedValue =
      name === "NumberofBrokenHeads" ||
      name === "NumberofBrokenLateralLines" ||
      name === "NumberofStation" ||
      name === "NumberofValves" ||
      name === "HowMany"
        ? parseInt(value, 10) // Use parseInt to parse as integers
        : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
      IrrigationAuditReportId: idParam,
    }));
    console.log("main payload is", formData);
  };

  const [controllerPhoto, setControllerPhoto] = useState(null);

  // Step 2: Create an event handler function
  const handleControllerphotoInputChange = (event) => {
    // Step 3: Access the selected file
    const file = event.target.files[0];

    // Step 4: Update the state with the selected file
    setControllerPhoto(file);
  };

  const [Photo, setPhoto] = useState(null);

  // Step 2: Create an event handler function
  const handlePhotoInputChange = (event) => {
    // Step 3: Access the selected file
    const file = event.target.files[0];

    // Step 4: Update the state with the selected file
    setPhoto(file);
  };

  const handleAdditionalFile = (index) => {
    // Create a copy of the Files array without the file to be deleted
    const updatedFiles = [...additionalFiles];
    updatedFiles.splice(index, 1);
    setAdditionalFiles(updatedFiles);
  };

  const [submitClicked, setSubmitClicked] = useState(false);
  const [emptyFieldError, setEmptyFieldError] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  // Keep additionalFiles in sync when editing an existing controller
  useEffect(() => {
    setAdditionalFiles(morePhoto || []);
  }, [morePhoto]);

  // Initialize/show checkbox from existing record value
  useEffect(() => {
    if (typeof formData?.MorePhotos !== "undefined" && formData?.MorePhotos !== null) {
      setShowAdditional(Boolean(formData.MorePhotos));
    }
  }, [formData?.MorePhotos]);

  // Build absolute asset URL from server path that may contain backslashes
  const buildServerFileUrl = (relativePath) => {
    if (!relativePath) return "";
    const normalized = String(relativePath)
      .replace(/^\\\\|^\\/g, "")
      .replace(/\\\\/g, "/")
      .replace(/\\/g, "/");
    return `${baseUrl}/${normalized}`;
  };

  const getPreviewSrc = (item) => {
    if (!item) return "";
    if (item instanceof File || item instanceof Blob) {
      return URL.createObjectURL(item);
    }
    if (item.FilePath) {
      return buildServerFileUrl(item.FilePath);
    }
    if (typeof item === "string") {
      return buildServerFileUrl(item);
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitClicked(true);

    if (!formData.ControllerName || !formData.ControllerNumber) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      setEmptyFieldError(true);
      return;
    }
    setDisableButton(true);

    const postData = new FormData();

    // Merge the current items with the new items for EstimateData
    const IrrigationControllerData = {
      ...formData,
    };

    console.log("IrrigationControllerData:", IrrigationControllerData);
    // console.log("data:", data);

    postData.append(
      "IrrigationControllerAuditReportData",
      JSON.stringify(IrrigationControllerData)
    );

    if (Photo) {
      postData.append("Photo", Photo);
    }

    // Append selectedAfterFile if it exists
    if (controllerPhoto) {
      postData.append("ControllerPhoto", controllerPhoto);
    }

    additionalFiles.forEach((fileObj) => {
      postData.append("MorePhoto", fileObj);
    });

    console.log(JSON.stringify(IrrigationControllerData));

    submitData(postData);
  };

  // const appendFilesToFormData = (formData) => {
  //   Files.forEach((fileObj) => {
  //     formData.append("Files", fileObj.actualFile);
  //   });
  // };

  // const trackAdditionalFile = (e) => {
  //   const uploadedFile = e.target.files[0];
  //   if (uploadedFile) {
  //     setAdditionalFiles((prevFiles) => [...prevFiles, uploadedFile]);
  //   }
  // };
  const trackAdditionalFile = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      
      const compressedImg =  await imageCompresser(uploadedFile)
      setAdditionalFiles((prevFiles) => [...prevFiles, compressedImg]);
    }
  };

  const submitData = async (postData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Important for multipart/form-data requests
    };
    try {
      const response = await axios.post(
        `${baseUrl}/api/IrrigationAuditReport/AddControllerAuditReport`,
        postData,
        { headers }
      );
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      setDisableButton(false);

      setFormData({});
      fetchIrrigation(idParam);
      setTimeout(() => {
        setAddSucces("");
        toggleShowForm();
      }, 3000);

      setAddSucces(response.data.Message);
      document.getElementById("photo").value = "";
      document.getElementById("controllerPhoto").value = "";

      for (const entry of postData.entries()) {
        console.log(`FormData Entry - ${entry[0]}: ${entry[1]}`);
      }

      console.log("Data submitted successfully:", response.data.Message);
    } catch (error) {
      console.error("API Call Error:", error);
      setDisableButton(false);
      setAddError(error.response.data);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }
  };
  useEffect(() => {
    if (formData) {
      setFormData(formData); // Ensure formData is updated when editing
    }
  }, [formData]); // Added useEffect to update form when a new controller is selected
  
  return (
    <div>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="itemtitleBar">
        <h4>Controller Info</h4>
      </div>

      <div className="card-body">
        <div className="row ">
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">
                Controller Name<span className="text-danger">*</span>
              </label>
            </div>
            <TextField
              type="text"
              size="small"
              className="form-control"
              value={formData.ControllerName || ""} 
              name="ControllerName"
              onChange={handleChange}
              placeholder="Controller Make and Model"
              error={submitClicked && !formData.ControllerName}
            />
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">
                Controller Number<span className="text-danger">*</span>
              </label>
            </div>
            <TextField
              type="text"
              size="small"
              className="form-control"
              name="ControllerNumber"
              onChange={handleChange}
              value={formData.ControllerNumber || ""} 
              placeholder="Controller Number"
              error={submitClicked && !formData.ControllerNumber}
            />
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Broken Valves?</label>
            </div>
            <div className="col-md-12 yesNoBtns">
              <button
                type="button"
                className={`btn  col-md-4 YNbtn1 ${
                  formData.BrokenValve == true && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    BrokenValve: true,
                  }));
                }}
              >
                Yes
              </button>
              <button
                type="button"
                className={`btn  col-md-4  YNbtn1 ${
                  formData.BrokenValve == false && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    BrokenValve: false,
                  }));
                }}
              >
                No
              </button>
            </div>
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Photo of Controller</label>
            </div>
            <input
              type="file"
              id="controllerPhoto"
              className="form-control"
              placeholder="Created"
              onChange={handleControllerphotoInputChange}
            />
            {formData?.ControllerPhotoPath ? (
              <div className="mt-2">
                <a
                  href={buildServerFileUrl(formData.ControllerPhotoPath)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={buildServerFileUrl(formData.ControllerPhotoPath)}
                    alt="Controller"
                    style={{ width: "115px", height: "110px", objectFit: "cover" }}
                  />
                </a>
              </div>
            ) : null}
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Photo</label>
            </div>
            <input
              type="file"
              id="photo"
              className="form-control"
              onChange={handlePhotoInputChange}
              placeholder="Capture Photo"
            />
            {formData?.PhotoPath ? (
              <div className="mt-2">
                <a
                  href={buildServerFileUrl(formData.PhotoPath)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={buildServerFileUrl(formData.PhotoPath)}
                    alt="Photo"
                    style={{ width: "115px", height: "110px", objectFit: "cover" }}
                  />
                </a>
              </div>
            ) : null}
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Broken Latrals?</label>
            </div>
            <div className="col-md-12 yesNoBtns">
              <button
                type="button"
                className={`btn  col-md-4 YNbtn1 ${
                  formData.BrokenLaterals == true && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    BrokenLaterals: true,
                  }));
                }}
              >
                Yes
              </button>
              <button
                type="button"
                className={`btn  col-md-4  YNbtn1 ${
                  formData.BrokenLaterals == false && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    BrokenLaterals: false,
                  }));
                }}
              >
                No
              </button>
            </div>
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">How Many?</label>
            </div>
            <input
              type="number"
              name="HowMany"
              onChange={handleChange}
              value={formData.HowMany || ""}
              className="form-control number-input"
              placeholder=""
            />
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">
                Repair Made or Needed / Recommmendations
              </label>
            </div>
            <div className="col-md-12">
              <textarea
                name="RepairMadeOrNeeded"
                onChange={handleChange}
                value={formData.RepairMadeOrNeeded || ""} 
                className="form-txtarea form-control"
                rows="4"
                id="comment"
              ></textarea>
            </div>
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Broken Heads?</label>
            </div>
            <div className="col-md-12 yesNoBtns">
              <button
                type="button"
                className={`btn  col-md-4 YNbtn1 ${
                  formData.BrokenHeads == true && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    BrokenHeads: true,
                  }));
                }}
              >
                Yes
              </button>
              <button
                type="button"
                className={`btn  col-md-4  YNbtn1 ${
                  formData.BrokenHeads == false && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    BrokenHeads: false,
                  }));
                }}
              >
                No
              </button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="row my-2">
              <div className="col-md-1 pe-0 text-end mt-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="MorePhotos"
                  name="MorePhotos"
                  value={showAdditional}
                  checked={showAdditional}
                  onChange={() => {
                    const next = !showAdditional;
                    setShowAdditional(next);
                    setFormData((prev) => ({
                      ...prev,
                      MorePhotos: next,
                    }));
                    if (!next) {
                      setAdditionalFiles([]);
                    }
                  }}
                />
              </div>{" "}
              <div className="col-md-11  mt-2">
                <label htmlFor="MorePhotos" style={{ cursor: "pointer" }}>
                  <h5 className="mb-0">More Photos</h5>
                </label>
              </div>
              {showAdditional ? (
                <div className="row mt-3 ">
                  <div className="col-md-12">
                    <FileUploadButton onClick={trackAdditionalFile}>
                      Upload More Photos
                    </FileUploadButton>
                
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          {additionalFiles.map((file, index) => {
            const imgSrc = getPreviewSrc(file);
            const displayName = file?.FileName || file?.name || "";
            return (
            <div
              key={index}
              className="col-md-2  mt-5  image-container"
              style={{
                width: "115px", // Set the desired width
                height: "110px", // Set the desired height
                margin: "1em",
                position: "relative",
              }}
            >
              <a href={imgSrc} target="_blank" rel="noopener noreferrer">
                <img
                  src={imgSrc}
                  alt={displayName}
                  style={{
                    width: "115px",
                    height: "110px",
                    objectFit: "cover",
                  }}
                />
              </a>
              <p
                className="file-name-overlay"
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0px",
                  right: "0",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  textAlign: "center",
                  overflow: "hidden",
                 
                  textOverflow: "ellipsis",
                  padding: "5px",
                }}
              >
                {displayName}
              </p>
              {/* <span
                className="file-delete-button"
                style={{
                  left: "90px",
                }}
                onClick={() => {
                  handleAdditionalFile(index);
                }}
              >
                <span>
                  <Delete color="error" />
                </span>
              </span> */}
            </div>
          );
          })}{" "}
        </div>
        <div className="row ">
          <div className="col-md-8">
            {/* {addError && <Alert severity="error">{addError}</Alert>}
              {emptyFieldError && (
                <Alert severity="error">Please fill all required fields</Alert>
              )} */}
          </div>
          <div className=" col-md-4 mb-3 text-right">
            <Button
              variant="outlined"
              sx={{
                color: "black",
                border: "1px solid black",
                marginRight: "0.5em",

                textTransform: "capitalize",
                "&:hover": {
                  backgroundColor: "black",
                  color: "white",
                  border: "1px solid black",
                  outlineColor: "black",
                },
              }}
              onClick={toggleShowForm}
              color="primary"
            >
              Clear
            </Button>
            <LoaderButton loading={disableButton} handleSubmit={handleSubmit}>
              Add
            </LoaderButton>{" "}
            {/* <button
                type="button"
                className="btn btn-primary me-1"
                onClick={handleSubmit}
              >
                Add
              </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditController;
