import React, { useEffect, useState, useRef, useContext } from "react";
import EventPopups from "../Reusable/EventPopups";
import useBulkActions from "../Hooks/useBulkActions";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import { Tooltip } from "@mui/material";
const DeleteAllModal = ({ selectedItems, endpoint, bindingFunction ,invoice=false,clearSelection, disabled=false, tooltipMessage="You don't have access"}) => {
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const { bulkActions } = useBulkActions();

  const handleSnackbar = (open, color, text, closeModal = false) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
    if (closeModal) {
      if(invoice){
 clearSelection([]);   
      }
      setOpenModal(false);
        
      bindingFunction();
    }
  };

  return (
    <>
      {disabled ? (
        <Tooltip title={tooltipMessage} arrow>
          <span>
            <button
              className={`btn btn-danger mx-1 ${invoice?"mt-0":"mt-2"}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled
              style={{ cursor: "not-allowed", opacity: 0.6 }}
            >
              Delete Selected
            </button>
          </span>
        </Tooltip>
      ) : (
        <button
          className={`btn btn-danger mx-1 ${invoice?"mt-0":"mt-2"}`}
          onClick={() =>setOpenModal(true)}
        >
          <EventPopups
            open={openSnackBar}
            setOpen={setOpenSnackBar}
            color={snackBarColor}
            text={snackBarText}
          />
          Delete Selected
        </button>
      )}
      <ConfirmationModal
        modalOpen={openModal}
        setModalOpen={setOpenModal}
        title="Confirmation"
        description={`Are you sure you want to delete all selected ${invoice?'invoices':'items'}?`}
        onConfirm={() => {
          bulkActions(
            endpoint,
            {
              id: selectedItems,
            },
            handleSnackbar
          );
        }}
        deleteButton
      />
      {/* <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <DialogTitle sx={{ backgroundColor: "#77993d ", color: "white" }}>
          Delete All
        </DialogTitle>
        <DialogContent sx={{ margin: "2em 5em 0em 5em" }}>
          <DialogContentText>
          <h5><ErrorOutlineIcon sx={{fontSize : 30}} color="error"/> Are you sure you want to delete all selected items?</h5>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setOpenModal(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              bulkActions(
                endpoint,
                {
                  id: selectedItems,
                },
                handleSnackbar
              );
            }}
            color="error"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default DeleteAllModal;
