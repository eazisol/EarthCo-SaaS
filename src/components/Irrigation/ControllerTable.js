import axios from "axios";
import React, { useState } from "react";
import { Delete, Create } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import EventPopups from "../Reusable/EventPopups";
import { baseUrl } from "../../apiConfig";

const ControllerTable = ({
  setAddSucces,
  fetchIrrigation,
  controllerList,
  headers,
  setShowForm,
  setFormData,
  canDelete = true,
}) => {
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const deleteController = async (id) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/Irrigation/DeleteController?id=${id}`,
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
      <div className="">
        <div className="card-body">
          <div className="table-responsive active-projects style-1">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Controller </th>
                  <th>Controller Number </th>
                  <th>Serial Number </th>
                  <th>Meter Info </th>
                  <th>Valve </th>
                  <th>Repairs / Upgrades</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {controllerList.map((controller, index) => {
                  return (
                    <tr key={index}>
                      <td>{controller.ControllerId}</td>
                      <td>{controller.MakeAndModel}</td>
                      <td>{controller.ControllerNumber}</td>
                      <td>{controller.SerialNumber}</td>
                      <td>{controller.MeterSize}</td>
                      <td>{controller.TypeofValves}</td>
                      <td>{controller.RepairsMade}</td>
                      <td>
                        <Button
                              title="Edit"
                              type="button"
                              onClick={() => {
                                // setFormData(controller.ControllerData || {});
                                setFormData({ ...controller,id: controller.ControllerId,});
                                setShowForm(true);
                              }}
                            >
                              <Create color="success"></Create>
                            </Button>
                        {canDelete ? (
                          <Button
                            title="Delete"
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target={`#deleteModal${controller.ControllerId}`}
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

                        <div
                          className="modal fade"
                          id={`deleteModal${controller.ControllerId}`}
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
                              <div className="modal-body">
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
                                  onClick={() =>
                                    deleteController(controller.ControllerId)
                                  }
                                >
                                  Yes
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerTable;
