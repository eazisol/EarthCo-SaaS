import React, { useEffect, useState } from "react";
import EventPopups from "../Reusable/EventPopups";
import { Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import useDeleteFile from "../Hooks/useDeleteFile";
import FileUploadButton from "../Reusable/FileUploadButton";
import { baseUrl } from "../../apiConfig";
import imageCompresser from "../../custom/ImageCompresser";
import { BsFiletypePdf } from "react-icons/bs";

const CustomerFiles = ({ getCustomerData, prevFiles,CustomerId }) => {
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const token = Cookies.get("token");

  const { deleteReportFile } = useDeleteFile();

  const [Files, setFiles] = useState([]);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const trackFile = async(e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      
      const compressedImg =  await imageCompresser(uploadedFile)
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

    postData.append("CustomerId", JSON.stringify(idParam));
    console.log(JSON.stringify(idParam));

    Files.forEach((fileObj) => {
      postData.append("Files", fileObj);
    });

    submitData(postData);
  };

  const submitData = async (postData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Important for multipart/form-data requests
    };
    try {
      const response = await axios.post(
        `${baseUrl}/api/Customer/AddFiles`,
        postData,
        {
          headers,
        }
      );

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);

      console.log("Data submitted successfully:", response.data.Message);
    } catch (error) {
      console.error("API Call Error:", error);

      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }
  };

  useEffect(() => {
    console.log("prevFiles",prevFiles)
  
   
  }, [])
  

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />

      <div className="card">
        <h4 className="modal-title itemtitleBar" id="#gridSystemModal">
          Files
        </h4>

        <div className="col-xl-12">
          <div className="card border-0">
            <div className="card-body  p-0">
              <div className="row mx-2 mt-3">
                {/* <div className="col-md-3">
                  <div className="dz-default dlab-message upload-img mb-3">
                    <form action="#" className="dropzone">
                      <svg
                        width="41"
                        height="40"
                        viewBox="0 0 41 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M27.1666 26.6667L20.4999 20L13.8333 26.6667"
                          stroke="#DADADA"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M20.5 20V35"
                          stroke="#DADADA"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M34.4833 30.6501C36.1088 29.7638 37.393 28.3615 38.1331 26.6644C38.8731 24.9673 39.027 23.0721 38.5703 21.2779C38.1136 19.4836 37.0724 17.8926 35.6111 16.7558C34.1497 15.619 32.3514 15.0013 30.4999 15.0001H28.3999C27.8955 13.0488 26.9552 11.2373 25.6498 9.70171C24.3445 8.16614 22.708 6.94647 20.8634 6.1344C19.0189 5.32233 17.0142 4.93899 15.0001 5.01319C12.9861 5.0874 11.015 5.61722 9.23523 6.56283C7.45541 7.50844 5.91312 8.84523 4.7243 10.4727C3.53549 12.1002 2.73108 13.9759 2.37157 15.959C2.01205 17.9421 2.10678 19.9809 2.64862 21.9222C3.19047 23.8634 4.16534 25.6565 5.49994 27.1667"
                          stroke="#DADADA"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M27.1666 26.6667L20.4999 20L13.8333 26.6667"
                          stroke="#DADADA"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                      <div className="fallback mb-3">
                        <input name="file" type="file" onChange={trackFile} />
                      </div>
                    </form>
                  </div>
                </div> */}
                <div style={{width : "15em"}}>
                  <FileUploadButton onClick={trackFile} imagesAndPdfOnly>
                    Upload Files
                  </FileUploadButton>
                </div>
                {Files.map((file, index) => (
                  <div
                    key={index}
                    className="col-md-2 image-container"
                    style={{
                      width: "115px", // Set the desired width
                      height: "110px", // Set the desired height
                      margin: "1em",
                      position: "relative",
                    }}
                  >
                     {file.name?.includes(".pdf") ? (
                      <div className="d-flex justify-content-center align-items-center pdf-div">
                        <BsFiletypePdf color="#ff0000" fontSize="4em" />
                      </div>
                    ) :
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{
                        width: "115px",
                        height: "110px",
                        objectFit: "cover",
                      }}
                    />}
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
                        whiteSpace: "nowrap",
                        width: "100%",
                        textOverflow: "ellipsis",
                        padding: "5px",
                      }}
                    >
                      {file.name}
                    </p>
                    <span
                      className="file-delete-button"
                      style={{
                        left: "90px",
                      }}
                      onClick={() => {
                        handleDeleteFile(index);
                      }}
                    >
                      <span>
                        <Delete color="error" />
                      </span>
                    </span>
                  </div>
                ))}

                {prevFiles.map((file, index) => {
                  return (
                    <div
                      key={index}
                      className="col-md-2   image-container"
                      style={{
                        width: "115px", // Set the desired width
                        height: "110px", // Set the desired height
                        margin: "1em",
                        position: "relative",
                      }}
                    >
                      {file.FilePath?.includes(".pdf") ? (
                      <div className="d-flex justify-content-center align-items-center pdf-div">
                        <BsFiletypePdf color="#ff0000" fontSize="4em" />
                      </div>
                    ) :
                      <a
                        href={`${baseUrl}/${file.FilePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={`${baseUrl}/${file.FilePath}`}
                          style={{
                            width: "115px",
                            height: "110px",
                            objectFit: "cover",
                          }}
                        />
                      </a>}
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
                          whiteSpace: "nowrap",
                          width: "100%",
                          textOverflow: "ellipsis",
                          padding: "5px",
                        }}
                      >{file.FileName}</p>
                      <span
                        className="file-delete-button"
                        style={{
                          left: "90px",
                        }}
                        onClick={() => {
                          deleteReportFile(
                            `Customer/DeleteCustomerFile?CustomerId=${CustomerId}&FileId=`,
                            file.CustomerFileId,
                            getCustomerData,
                            
                          );
                        }}
                      >
                        <span>
                          <Delete color="error" />
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="row mx-2">
                <div className="col-md-12 text-end">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerFiles;
