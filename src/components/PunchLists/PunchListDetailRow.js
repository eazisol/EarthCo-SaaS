import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Table,
  TableCell,
  TableRow,
  Button,
  Checkbox,
  CircularProgress,
  TableContainer,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import { DataContext } from "../../context/AppData";
import { useNavigate } from "react-router-dom";
import EventPopups from "../Reusable/EventPopups";
import Tooltip from "@mui/material/Tooltip";
import { baseUrl } from "../../apiConfig";
  import { pdf } from "@react-pdf/renderer";
import CustomPopover from "../Reusable/CustomPopover";
import BrokenImageOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import Authorization from "../Reusable/Authorization";
import SinglePunchListPdf from "./SinglePunchListPdf";
import DownloadIcon from '@mui/icons-material/Download';
import useMenuAccess from "../Hooks/useMenuAccess";
const PunchListDetailRow = ({
  headers,
  item,
  rowIndex,
  expandedRow,
  setPlDetailId,
  setPunchData,
  fetchFilterdPunchList,
  setselectedPL,
  plId,
  statusloading,
  setStatusloading,
  customerId,
}) => {
  const {
    PunchDetailData,
    setPunchDetailData,
    setPunchListData,
    PunchListData,
    dynamicColorAndLogo
  } = useContext(DataContext);
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCostItem, setSelectedCostItem] = useState([]);
  const [PLDetail,setPLDetail]=useState({})
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  // const [statusloading, setStatusloading] = useState(false);
  const [setSelectedRow, setSetSelectedRow] = useState(0);

  // Permissions for Punchlist
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const handleCheckboxChange = (items) => {
    if (selectedItems.includes(items)) {
      // If item is already in the selectedItems array, remove it
      setSelectedItems(
        selectedItems.filter((selectedItem) => selectedItem !== items)
      );
    } else {
      // If item is not in the selectedItems array, add it
      setSelectedItems([...selectedItems, items]);
    }

    // console.log("selected item is", selectedCostItem);
  };

  useEffect(() => {
    const updatedSelectedItems = selectedItems.map((items) => ({
      ...items,
      isCost: false,
    }));

    setPunchListData((prevData) => ({
      ...prevData,
      // RegionalManagerId: item.Data.AssignedTo,
      RegionalManagerId: item.Data.CreatedBy,
      ContactId: item.Data.ContactId,
      PunchlistId: item.Data.PunchlistId,
      CustomerId: item.Data.CustomerId,
      CustomerDisplayName: item.Data.CustomerDisplayName,

      // PhotoPath: item.DetailDataList.DetailData.PhotoPath,
      // AfterPhotoPath: item.DetailDataList.DetailData.AfterPhotoPath,
      ItemData: updatedSelectedItems,
    }));
    // console.log("itemitemitemitem",item)
  }, [selectedItems]);

  const deletePunchListDetail = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/PunchList/DeletePunchlistDetail?id=${id}`,
        {
          headers,
        }
      );
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Punch List detail deleted successfuly");
      fetchFilterdPunchList();
      console.log("delete pl details response", response.data);
    } catch (error) {
      console.log("There was an error deleting the punch list detail:", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Error deleting punch list detail");
    }
  };

  const changePlStatus = async (id, status) => {
    setStatusloading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/PunchList/UpdatePunchlistDetailStatus?PunchlistDetailId=${id}&StatusId=${status}`,
        {
          headers,
        }
      );
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText("Punch List Status Changed successfuly");
      fetchFilterdPunchList(
        "",
        1,
        10,
        0,
        false,
        () => {
          setStatusloading(false);
        },
        false
      );
      setSelectedItems([]);
      setShowStatus(false);
      console.log("delete pl details response", response.data);
    } catch (error) {
      console.log("There was an error deleting the punch list detail:", error);
      setShowStatus(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(
        "There was an error changing status of punch list detail:"
      );
    }
  };

  const handleDelete = (id) => {
    deletePunchListDetail(id);
  };



// const handleDownloadPDF = async (detail) => {
//   // 1⃣  create the Blob just like before
//   const blob = await pdf(
//     <SinglePunchListPdf
//       pLData={item.Data}
//       PLDetail={detail}
//     />
//   ).toBlob();

//   // 2⃣  turn it into an object‑url
//   const url = URL.createObjectURL(blob);

//   // 3⃣  open the url in a new tab / window
//   window.open(url, "_blank", "noopener,noreferrer");

//   // 4⃣  (optional) clean up when that tab is closed
//   //     — wrap in setTimeout so the browser has time to load it first
//   setTimeout(() => URL.revokeObjectURL(url), 10_000);
// };

const handleDownloadPDF = async (detail,i) => {
  const blob = await pdf(
    <SinglePunchListPdf
      pLData={item.Data}
      PLDetail={detail}
      index={i}
      dynamicColorAndLogo={dynamicColorAndLogo}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `PL_${item.Data.PunchlistId}_${detail.DetailData.PunchlistDetailId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      {item.DetailDataList.map((detail, i) => {
        return (
          <TableRow key={i} style={{ borderBottom: 0 }}>
            <TableCell
              style={{ paddingBottom: 0, paddingTop: 0, borderBottom: 0 }}
              colSpan={12}
            >
              <Collapse
                in={expandedRow === rowIndex}
                timeout="auto"
                unmountOnExit
                style={{
                  border: "none",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    border: "none",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <TableContainer sx={{ overflowX: "auto", width: "90%" }}>
                    <Table
                      size="small"
                      aria-label="purchases"
                      style={{ border: "none" }}
                    >
                      <TableRow
                        style={{
                          borderLeft: "1px solid #ccc",
                          borderRight: "1px solid #ccc",
                        }}
                      >
                        <TableCell style={{ width: "7%" }}>
                          <div className="products">
                            {detail.DetailData.PhotoPath ? (
                              <>
                                {" "}
                                <a
                                  href={`${baseUrl}/${detail.DetailData.PhotoPath}`}
                                  target="_blank" // This attribute opens the link in a new tab
                                  rel="noopener noreferrer" // Recommended for security reasons
                                >
                                  <img
                                    src={`${baseUrl}/${detail.DetailData.PhotoPath}`}
                                    className="avatar avatar-md"
                                    alt="PunchList Image"
                                  />
                                </a>
                              </>
                            ) : (
                              <div
                                style={{
                                  padding: 3,
                                  backgroundColor: "#e6e6e6",
                                  borderRadius: "4px",
                                }}
                              >
                                <BrokenImageOutlinedIcon
                                  style={{ fontSize: 40, color: "#666" }}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell style={{ width: "22%", paddingLeft: 0 }}>
                          <div className="products">
                            <div>
                              <Tooltip title={detail.DetailData.Notes} arrow>
                                <h6
                                  style={{
                                    fontSize: "11px",
                                    whiteSpace: "wrap",
                                    overflow: "hidden",
                                    lineHeight: "1em",
                                  }}
                                >
                                  {detail.DetailData.Notes}
                                </h6>
                              </Tooltip>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell style={{ width: "13%" }}>
                          <CustomPopover
                            trigger={
                              <div className="row justify-content-center">
                                <div
                                  style={{
                                    width: "85%",
                                    paddingRight: 0,
                                    paddingLeft: 0,
                                  }}
                                >
                                  <Tooltip
                                    title="Change status of Punchlist Detail"
                                    arrow
                                  >
                                    <span
                                      style={{
                                        cursor: "pointer",
                                        backgroundColor:
                                          detail.DetailData
                                            .PunchlichlistDetailColor,
                                      }}
                                      className="badge badge-pill "
                                      onClick={() => {
                                        setShowStatus(true);
                                        setSetSelectedRow(
                                          detail.DetailData.PunchlistDetailId
                                        );
                                      }}
                                    >
                                      {
                                        detail.DetailData
                                          .PunchlichlistDetailStatus
                                      }
                                    </span>
                                  </Tooltip>
                                </div>
                                <Authorization allowTo={[1,4,5,6]} hide>
                                <div
                                  style={{
                                    width: "15%",
                                    paddingRight: 0,
                                    paddingLeft: 0,
                                  }}
                                >
                                  {statusloading == true &&
                                    setSelectedRow ==
                                      detail.DetailData.PunchlistDetailId && (
                                      <CircularProgress size={20} />
                                    )}
                                </div></Authorization>
                              </div>
                            }
                          >
                            <Authorization allowTo={[1,4,5,6]} hide>
                            <div
                              style={{
                                padding: "1em",
                                width: "6em",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  cursor: "pointer",
                                  backgroundColor:
                                    detail.DetailData.StatusId == 1
                                      ? "#FFC107"
                                      : "#28A745",
                                }}
                                className="badge badge-pill "
                                onClick={() => {
                                  changePlStatus(
                                    detail.DetailData.PunchlistDetailId,
                                    detail.DetailData.StatusId == 1 ? 2 : 1
                                  );
                                }}
                              >
                                {detail.DetailData.StatusId == 1
                                  ? "Pending"
                                  : "Complete"}
                              </span>
                            </div></Authorization>
                          </CustomPopover>
                        </TableCell>
                        <TableCell style={{ width: "20%" }}>
                          {detail.ItemData.map((item, i) => {
                            return (
                              <div key={i}>
                                <Checkbox
                                  checked={selectedItems.includes(item)}
                                  onChange={() => handleCheckboxChange(item)}
                                  sx={{
                                    color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                    "&.Mui-checked": {
                                      color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                    },
                                  }}
                                />
                                <span>{item.Name}</span>
                              </div>
                            );
                          })}
                        </TableCell>
                        <Authorization allowTo={[1,4,5,6]} hide>
                        <TableCell className="Punch-Detail-Link">
                          <div className="row">
                            <Tooltip title="Copy to Estimate" arrow>
                              <div
                                style={{ borderRight: "1px solid #999" }}
                                className="Punch-Link-Button mb-1 col-6 "
                                onClick={() => {
                                  // console.log("selected pl is",item.Data)
                                  setPunchListData((prevData) => ({
                                    ...prevData,
                                    CustomerId: customerId,
                                    EstimateNotes: detail.DetailData.Notes,
                                    RegionalManagerId: item.Data.AssignedTo,
                                    PhotoPath: detail.DetailData.PhotoPath,
                                    CustomerDisplayName:
                                      item.Data.CustomerDisplayName,
                                    AfterPhotoPath:
                                      detail.DetailData.AfterPhotoPath,
                                  }));
                                  console.log("details", {
                                    ...PunchListData,
                                    CustomerId: customerId,
                                    EstimateNotes: detail.DetailData.Notes,
                                    RegionalManagerId: item.Data.AssignedTo,
                                    PhotoPath: detail.DetailData.PhotoPath,
                                    CustomerDisplayName:
                                      item.Data.CustomerDisplayName,
                                    AfterPhotoPath:
                                      detail.DetailData.AfterPhotoPath,
                                  });
                                  navigate("/estimates/add-estimate");
                                }}
                              >
                                <p className="me-1">
                                  <span className="fa fa-plus me-1"></span>{" "}
                                  <span style={{ textDecoration: "underline" }}>
                                    Estimate
                                  </span>
                                </p>
                              </div>
                            </Tooltip>
                            <Tooltip title="Copy to Service Request" arrow>
                              <div
                                className="Punch-Link-Button col-6 ms-1"
                                onClick={() => {
                                  setPunchListData((prevData) => ({
                                    ...prevData,
                                    // RegionalManagerId: item.Data.AssignedTo,
                                    RegionalManagerId: item.Data.CreatedBy,
                                    ContactId: item.Data.ContactId,
                                    PunchlistId: item.Data.PunchlistId,
                                    CustomerId: item.Data.CustomerId,
                                    CustomerDisplayName:
                                      item.Data.CustomerDisplayName,
                                    WorkRequest: detail.DetailData.Notes,
                                    PhotoPath: detail.DetailData.PhotoPath,
                                    AfterPhotoPath:
                                      detail.DetailData.AfterPhotoPath,
                                  }));
                                  navigate("/service-requests/add-sRform");
                                }}
                              >
                                <p>
                                  <span className="fa fa-plus me-1"></span>
                                  <span style={{ textDecoration: "underline" }}>
                                    Service Request
                                  </span>
                                </p>
                              </div>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell  className=" d-flex align-items-center  " style={{marginTop:"10px"}}>
                          {canEdit ? (
                            <Tooltip title="Edit Punchlist Detail" arrow>
                              <Button
                                className="delete-button"
                                data-bs-toggle="modal"
                                data-bs-target="#addPhotos"
                                onClick={() => {
                                  setPunchDetailData(detail);
                                  setselectedPL(detail.DetailData.PunchlistId);
                                  // console.log("detail", detail);
                                }}
                              >
                                <Edit />
                              </Button>
                            </Tooltip>
                          ) : (
                            <Tooltip title="You don't have permission to edit this punchlist detail" arrow>
                              <span>
                                <Button
                                  className="delete-button"
                                  disabled
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <Edit style={{ opacity: 0.6 }} />
                                </Button>
                              </span>
                            </Tooltip>
                          )}
                          <Tooltip title="Download Punchlist Detail" arrow>
                         
                        <div onClick={() => handleDownloadPDF(detail,i)} style={{cursor:'pointer'}}>  <i className="fa fa-download"></i></div>



                          </Tooltip>
                          {canDelete ? (
                            <Tooltip title="Delete Punchlist Detail" arrow>
                              <Button
                                color="error"
                                className="delete-button"
                                data-bs-toggle="modal"
                                data-bs-target={`#deletePlDetailsModal${detail.DetailData.PunchlistDetailId}`}
                              >
                                <Delete />
                              </Button>
                            </Tooltip>
                          ) : (
                            <Tooltip title="You don't have permission to delete this punchlist detail" arrow>
                              <span>
                                <Button
                                  color="error"
                                  className="delete-button"
                                  disabled
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <Delete style={{ opacity: 0.6 }} />
                                </Button>
                              </span>
                            </Tooltip>
                          )}

                          <div
                            className="modal fade"
                            id={`deletePlDetailsModal${detail.DetailData.PunchlistDetailId}`}
                            tabIndex="-1"
                            aria-labelledby="deleteModalLabel"
                            aria-hidden="true"
                          >
                            <div
                              className="modal-dialog modal-dialog-centered"
                              role="document"
                            >
                              <div className="modal-content">
                                <div className="modal-header">
                                  <h5 className="modal-title">
                                    Punch List Detail Delete
                                  </h5>

                                  <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                  ></button>
                                </div>
                                <div className="modal-body text-center">
                                  <p>
                                    Are you sure you want to delete{" "}
                                    {detail.DetailData.PunchlistDetailId}
                                  </p>
                                </div>

                                <div className="modal-footer">
                                  <button
                                    type="button"
                                    id="closer"
                                    className="btn btn-danger light "
                                    data-bs-dismiss="modal"
                                  >
                                    Close
                                  </button>
                                  <button
                                    className="btn btn-primary "
                                    data-bs-dismiss="modal"
                                    onClick={() => {
                                      handleDelete(
                                        detail.DetailData.PunchlistDetailId
                                      );
                                    }}
                                  >
                                    Yes
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell></Authorization>
                      </TableRow>
                    </Table>
                  </TableContainer>
                </div>
              </Collapse>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default PunchListDetailRow;
