import axios from "axios";
import React, { useState } from "react";
import { Delete, Create } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import EventPopups from "../Reusable/EventPopups";
import { baseUrl } from "../../apiConfig";
import { ConfirmationModal } from "../../custom/ConfirmationModal";

const AuditControllerTable = ({
  setAddSucces,
  fetchIrrigation,
  controllerList,
  headers,
  setShowForm,
  setFormData,
  morePhoto,
  setMorePhoto,
  canDelete = true,
}) => {
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [modalOpen, setModalOpen] = useState({ open: false, onConfirm: null });
  const deleteController = async (id) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/IrrigationAuditReport/DeleteControllerAuditReport?id=${id}`,
        { headers }
      );
      console.log("successfully deleted controller", res.data);
      fetchIrrigation();
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Irrigation controller Deleted successfully");
      setTimeout(() => {
        setAddSucces("");
      }, 3000);

      setAddSucces(res.data);
      console.log(res.data);
    } catch (error) {
      console.log("delete api error", error);
    }
  };

  return (
    <div>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <ConfirmationModal
        modalOpen={modalOpen.open}
        setModalOpen={() => setModalOpen({ open: false, onConfirm: null })}
        title="Confirmation"
        description="Are you sure you want to delete this Controller"
        onConfirm={() => {
          modalOpen.onConfirm();
          setModalOpen({ open: false, onConfirm: null });
        }}
        confirmText="Delete"
        deleteButton
      />
      <div>
        <div className="card-body pt-0">
          <div className="table-responsive active-projects style-1">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Controller Name</th>
                  <th>Controller Number</th>
                  <th>Broken Valves</th>
                  <th>Broken Laterals</th>
                  <th>Broken Heads</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {controllerList ? (
                  controllerList.map((controller, index) => {
                    if (controller.ControllerData) {
                      return (
                        <tr key={index}>
                          <td>
                            {controller.ControllerData?.ControllerAuditReportId}
                          </td>
                          <td>{controller.ControllerData?.ControllerName}</td>
                          <td>{controller.ControllerData?.ControllerNumber}</td>
                          <td>
                            {" "}
                            {controller.ControllerData?.BrokenValve
                              ? "Yes"
                              : "No"}
                          </td>
                          <td>
                            {controller.ControllerData?.BrokenLaterals
                              ? "Yes"
                              : "No"}
                          </td>
                          <td>
                            {controller.ControllerData?.BrokenHeads
                              ? "Yes"
                              : "No"}
                          </td>
                          <td>
                            <Button
                              title="Edit"
                              type="button"
                              onClick={() => {
                                // setFormData({
                                //   ...controller.ControllerData,
                                //   id: controller.ControllerData
                                //     ?.ControllerAuditReportId,
                                // });
                                setFormData(controller.ControllerData);
                                setShowForm([]);
                                setMorePhoto(controller?.FileData);
                              }}
                            >
                              {/* <i className="fa fa-trash"></i> */}
                              <Create color="success"></Create>
                            </Button>
                            {canDelete ? (
                              <Button
                                onClick={() => {
                                  setModalOpen(() => ({
                                    open: true,
                                    onConfirm: () =>
                                      deleteController(
                                        controller.ControllerData
                                          ?.ControllerAuditReportId
                                      ),
                                  }));
                                }}
                                // title="Delete"
                                // type="button"
                                // data-bs-toggle="modal"
                                // data-bs-target={`#deleteModal${controller.ControllerData.ControllerAuditReportId}`}
                              >
                                {/* <i className="fa fa-trash"></i> */}
                                <Delete color="error"></Delete>
                              </Button>
                            ) : (
                              <Tooltip title="You don't have permission to delete this controller" arrow>
                                <span>
                                  <Button
                                    disabled
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    <Delete color="error" style={{ opacity: 0.6 }}></Delete>
                                  </Button>
                                </span>
                              </Tooltip>
                            )}
                            {/* <div
                              className="modal fade"
                              id={`deleteModal${controller.ControllerData.ControllerAuditReportId}`}
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
                                      Controller Delete
                                    </h5>

                                    <button
                                      type="button"
                                      className="btn-close"
                                      data-bs-dismiss="modal"
                                    ></button>
                                  </div>
                                  <div className="modal-body text-center">
                                    <p>
                                      Are you sure you want to delete this
                                      Controller
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
                                        deleteController(
                                          controller.ControllerData
                                            ?.ControllerAuditReportId
                                        );
                                      }}
                                    >
                                      Yes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div> */}
                          </td>
                        </tr>
                      );
                    }
                  })
                ) : (
                  <></>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditControllerTable;
