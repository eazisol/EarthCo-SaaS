import React, { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Alert from "@mui/material/Alert";
import { TextField, Button } from "@mui/material";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import { baseUrl } from "../../apiConfig";

const IrrigationControler = ({
  setAddSucces,
  idParam,
  toggleShowForm,
  fetchIrrigation,
  formData, 
  setFormData,
}) => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  // const [formData, setFormData] = useState({});
  const [addError, setAddError] = useState("");

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
      name === "NumberofBrokenMainLines"
        ? parseInt(value, 10) // Use parseInt to parse as integers
        : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
      IrrigationId: idParam,
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

  const [submitClicked, setSubmitClicked] = useState(false);
  const [emptyFieldError, setEmptyFieldError] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitClicked(true);

    if (!formData.MakeAndModel || !formData.SerialNumber|| !formData.ControllerNumber) {
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
      "IrrigationControllerData",
      JSON.stringify(IrrigationControllerData)
    );

    if (Photo) {
      postData.append("Photo", Photo);
    }

    // Append selectedAfterFile if it exists
    if (controllerPhoto) {
      postData.append("ControllerPhoto", controllerPhoto);
    }

    console.log(JSON.stringify(IrrigationControllerData));

    submitData(postData);
  };

  // const appendFilesToFormData = (formData) => {
  //   Files.forEach((fileObj) => {
  //     formData.append("Files", fileObj.actualFile);
  //   });
  // };

  const submitData = async (postData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Important for multipart/form-data requests
    };
    try {
      const response = await axios.post(
        `${baseUrl}/api/Irrigation/AddController`,
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
      console.error("API Call Error:", error.response.data);
      setDisableButton(false);
      setAddError(error.response.data);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }
  };

  return (
    <div className="mt-3">
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="itemtitleBar ">
        <h4>Controller Info</h4>
      </div>

      <div className="card-body">
        <div className="row ">
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">
                Controller Make and Model<span className="text-danger">*</span>
              </label>
            </div>
            <TextField
              type="text"
              size="small"
              className="form-control"
              name="MakeAndModel"
              onChange={handleChange}
              value={formData.MakeAndModel || ""}
              placeholder="Controller Make and Model"
              error={submitClicked && !formData.MakeAndModel}
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
              name="ControllerNumber"
               value={formData.ControllerNumber || ""}
              onChange={handleChange}
              className="form-control"
              error={submitClicked && !formData.ControllerNumber}
              placeholder="Controller Number"
            />
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
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">
                Controller Location Closest Address
              </label>
            </div>
            <input
              type="text"
              className="form-control"
              name="LoacationClosestAddress"
              value={formData.LoacationClosestAddress || ""}
              onChange={handleChange}
              placeholder="Controller Location Closest Address"
            />
          </div>

          <div className="col-sm-5 col-md-4 mb-3 ">
            
             <div className="col-md-12">
              <label className="form-label">Serial Number<span className="text-danger">*</span></label>
            </div>
            <TextField
               type="text"
              size="small"
              name="SerialNumber"
              value={formData.SerialNumber || ""}
              onChange={handleChange}
              className="form-control number-input"
              placeholder="Serial Number"
              error={submitClicked && !formData.SerialNumber}
            />
          </div>

          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Type of Water</label>
            </div>
            <div className="col-md-12 yesNoBtns">
              <button
                type="button"
                className={`btn  col-md-6 YNbtn1 ${
                  formData.TypeofWater == "Portable" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    TypeofWater: "Portable",
                  }));
                }}
              >
                Portable
              </button>
              <button
                type="button"
                className={`btn col-md-6 YNbtn1 ${
                  formData.TypeofWater == "Reclaimed" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    TypeofWater: "Reclaimed",
                  }));
                }}
              >
                Reclaimed
              </button>
            </div>
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Meter Number</label>
            </div>
            <input
              type="text"
              name="MeterNumber"
              value={formData.MeterNumber || ""}
              onChange={handleChange}
              className="form-control"
              placeholder=""
            />
          </div>

          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">
                Number of Broken Lateral Lines
              </label>
            </div>
            <input
              type="number"
              name="NumberofBrokenLateralLines"
              value={formData.NumberofBrokenLateralLines || ""}
              onChange={handleChange}
              className="form-control number-input"
              placeholder=""
            />
          </div>

          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Satellite Based</label>
            </div>
            <div className="col-md-12 yesNoBtns">
              <button
                type="button"
                className={`btn   col-md-6 YNbtn2 ${
                  formData.isSatelliteBased && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    isSatelliteBased: true,
                  }));
                }}
              >
                Yes
              </button>
              <button
                type="button"
                className={`btn   col-md-6 YNbtn2 ${
                  !formData.isSatelliteBased && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    isSatelliteBased: false,
                  }));
                }}
              >
                No
              </button>
            </div>
          </div>

          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Number of Valves</label>
            </div>
            <input
              type="number"
              name="NumberofValves"
              value={formData.NumberofValves || ""}
              onChange={handleChange}
              className="form-control number-input"
              placeholder=""
            />
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Number of Broken Main Lines</label>
            </div>
            <input
              type="number"
              name="NumberofBrokenMainLines"
              value={formData.NumberofBrokenMainLines || ""}
              onChange={handleChange}
              className="form-control number-input"
              placeholder=""
            />
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Type of Valves</label>
            </div>
            <div className="col-md-12 yesNoBtns">
              <button
                type="button"
                className={`btn  col-md-4 YNbtn1 ${
                  formData.TypeofValves == "Plastic" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    TypeofValves: "Plastic",
                  }));
                }}
              >
                Plastic
              </button>
              <button
                type="button"
                className={`btn  col-md-4  YNbtn1 ${
                  formData.TypeofValves == "Brass" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    TypeofValves: "Brass",
                  }));
                }}
              >
                Brass
              </button>
              <button
                type="button"
                className={`btn  col-md-4 YNbtn1 ${
                  formData.TypeofValves == "Mixed" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    TypeofValves: "Mixed",
                  }));
                }}
              >
                Mixed
              </button>
            </div>
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Leaking Valves</label>
            </div>
            <input
              type="text"
              name="LeakingValves"
              value={formData.LeakingValves || ""}
              onChange={handleChange}
              className="form-control"
              placeholder=""
            />
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Malfunctioning Valves</label>
            </div>
            <input
              type="text"
              name="MalfunctioningValves"
              value={formData.MalfunctioningValves || ""}
              onChange={handleChange}
              className="form-control"
              placeholder=""
            />
          </div>

          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Meter Size</label>
            </div>
            <div className="col-md-12 yesNoBtns">
              <button
                type="button"
                className={`btn  col-md-2 YNbtn1 ${
                  formData.MeterSize == "1/2" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    MeterSize: "1/2",
                  }));
                }}
              >
                1/2
              </button>
              <button
                type="button"
                className={`btn  col-md-2 YNbtn1 ${
                  formData.MeterSize == "3/4" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    MeterSize: "3/4",
                  }));
                }}
              >
                3/4
              </button>
              <button
                type="button"
                className={`btn  col-md-2 YNbtn1 ${
                  formData.MeterSize == "1" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    MeterSize: "1",
                  }));
                }}
              >
                1
              </button>
              <button
                type="button"
                className={`btn  col-md-2 YNbtn1 ${
                  formData.MeterSize == "11/2" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    MeterSize: "11/2",
                  }));
                }}
              >
                11/2
              </button>
              <button
                type="button"
                className={`btn  col-md-2 YNbtn1 ${
                  formData.MeterSize == "2" && "btn-primary"
                }`}
                onClick={() => {
                  setFormData((prevData) => ({
                    ...prevData,
                    MeterSize: "2",
                  }));
                }}
              >
                2
              </button>
            </div>
          </div>

          
          <div className="col-sm-5 col-md-4 mb-3 ">
          <div className="col-md-12">
              <label className="form-label">Number of Stations</label>
            </div>
            <input
              type="number"
              name="NumberofStation"
              value={formData.NumberofStation || ""}
              onChange={handleChange}
              className="form-control number-input"
              placeholder=""
            />
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Number of Broken Heads</label>
            </div>
            <input
              type="number"
              name="NumberofBrokenHeads"
              value={formData.NumberofBrokenHeads || ""}
              onChange={handleChange}
              className="form-control number-input"
              placeholder=""
            />
          </div>
            <div className="col-sm-5 col-md-4 mb-3 "></div>
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
          </div>
          <div className="col-sm-5 col-md-4 mb-3 "></div>
          <div className="col-sm-5 col-md-4 mb-3 "></div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Repairs Made</label>
            </div>
            <div className="col-md-12">
              <textarea
                name="RepairsMade"
                value={formData.RepairsMade || ""}
                onChange={handleChange}
                className="form-txtarea form-control"
                rows="4"
                id="comment"
              ></textarea>
            </div>
          </div>
          <div className="col-sm-5 col-md-4 mb-3 ">
            <div className="col-md-12">
              <label className="form-label">Upgrades Made</label>
            </div>
            <div className="col-md-12">
              <textarea
                name="UpgradesMade"
                value={formData.UpgradesMade || ""}
                onChange={handleChange}
                className="form-txtarea form-control"
                rows="4"
                id="comment"
              ></textarea>
            </div>
          </div>

          <div className="col-sm-5 col-md-4 mb-3 "></div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationControler;
