import React, { useEffect, useState } from "react";
import EventPopups from "../Reusable/EventPopups";
import useBulkActions from "../Hooks/useBulkActions";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Select,
  MenuItem,
  Box,
  Fade,
  Modal,
  Typography,
  Grid
} from "@mui/material";
import { LoadingButton } from "@mui/lab"

const UpdateAllSR = ({ selectedItems, endpoint, bindingFunction }) => {
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [openModal, setOpenModal] = useState(false);

  const { bulkActions } = useBulkActions();

  const handleSnackbar = (open, color, text, closeModal = false) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
    if (closeModal) {
      setOpenModal(false);
      bindingFunction();
    }
  };

  return (
    <>
      <button
        className="btn btn-warning mx-1 mt-2"
        onClick={() => setOpenModal(true)}
      >
        <EventPopups
          open={openSnackBar}
          setOpen={setOpenSnackBar}
          color={snackBarColor}
          text={snackBarText}
        />
        Change Status
      </button>
 <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openModal}
        onClose={() => setOpenModal(false)}
        // style={{ zIndex: 99999 }}
        closeAfterTransition
        slotProps={{
          backdrop: {
            timeout: 500,
            zIndex: 99999,
          },
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              width: { xs: "90%", md: "30%" },
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "10px",
              backgroundColor: "white",
              padding: "20px 12px",
            }}
          >
            <Typography
              fontWeight="600"
              fontSize="16px"
              color="#2c2c2c"
              align="center"
            >
              Update Selected
            </Typography>

       <Grid container spacing={2} alignItems="center" justifyContent="center" mb={3} >
         
       
        <Grid item xs={8}>
           <Typography variant="body1" >
            Status
          </Typography>
          <Select
                aria-label="Select Status"
                variant="outlined"
                size="small"
                value={selectedStatus}
                sx={{ width: "15em" }}
                onChange={(e) => {
                  setSelectedStatus(parseInt(e.target.value, 10));
                }}
                fullWidth
              >
                <MenuItem value={1}>Open</MenuItem>
                <MenuItem value={2}>Closed</MenuItem>
              </Select>
        </Grid>
      </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Button
                sx={{ textTransform: "capitalize", width: "35%" }}
                variant="outlined"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
              <LoadingButton
                sx={{
                  textTransform: "capitalize",
                  width: "35%",
                 
                }}
                variant="contained"
                onClick={() => {
              bulkActions(
                endpoint,
                {
                  id: selectedItems,
                  StatusId: selectedStatus,
                },
                handleSnackbar
              );
            }}
              >
                Yes
              </LoadingButton>
            </Box>
          </Box>
        </Fade>
      </Modal>
      {/* <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="update-modal-title"
        aria-describedby="update-modal-description"
      >
        <DialogTitle sx={{ backgroundColor: "#77993d ", color: "white" }}>
          Update Selected
        </DialogTitle>
        <DialogContent sx={{ margin: "2em 5em 0em 5em" }}>
          <div className="row">
            <div className="col-md-2 mt-2 text-end">
              <h5>Status</h5>
            </div>
            <div className="col-md-6 text-start">
              <Select
                aria-label="Select Status"
                variant="outlined"
                size="small"
                value={selectedStatus}
                sx={{ width: "15em" }}
                onChange={(e) => {
                  setSelectedStatus(parseInt(e.target.value, 10));
                }}
                fullWidth
              >
                <MenuItem value={1}>Open</MenuItem>
                <MenuItem value={2}>Closed</MenuItem>
              </Select>
            </div>
          </div>
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
                  StatusId: selectedStatus,
                },
                handleSnackbar
              );
            }}
            color="warning"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default UpdateAllSR;
