import React, { useState } from "react";
import { Create, Delete } from "@mui/icons-material";
import { baseUrl } from "../../apiConfig";
import axios from "axios";
import Cookies from "js-cookie";
import EventPopups from "../Reusable/EventPopups";
import { ConfirmationModal } from "../../custom/ConfirmationModal";

const DeleteModal = ({ endPoint, successFun = () => {}, deleteId, disabled = false }) => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const deleteitem = async () => {
    console.log("object", endPoint);
    console.log("object2", deleteId);

    try {
      const response = await axios.get(
        `${baseUrl}/api/${endPoint}?id=${deleteId}`,
        {
          headers,
        }
      );
      console.log("delete res", response.data);
      successFun();
      setModalOpen(false)
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Report Deleted Successfully");
    } catch (error) {
      console.log("api call error", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Error Deleting Report");
    }
  };
  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <span
        // className="btn btn-danger btn-icon-xxs "
        // data-bs-toggle="modal"
        // data-bs-target={`#deleteModal${deleteId}`}
        onClick={() => {
          if (disabled) return;
          setModalOpen(true);
        }}
        style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}
      >
        <Delete color="error" />
        {/* <i className="fas fa-trash-alt"></i> */}
      </span>
      <ConfirmationModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        title="Confirmation"
        description={<>Are you sure you want to delete</>}
        onConfirm={deleteitem}
        deleteButton
      />
      {/* <div
        className="modal fade"
        id={`deleteModal${deleteId}`}
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Are you sure you want to delete</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="basic-form text-center">
                <button
                  type="button"
                  id="closer"
                  className="btn btn-danger light m-3"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  className="btn btn-primary m-3"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    deleteitem();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default DeleteModal;
