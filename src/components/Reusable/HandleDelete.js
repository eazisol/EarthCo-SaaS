import React, { useEffect, useState, useRef, useContext } from "react";

import { Delete} from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import EventPopups from "../Reusable/EventPopups";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
   Box, Fade, Modal, Typography,
    Button,
  } from "@mui/material";
  import {  } from "@mui/material";
  import { LoadingButton } from "@mui/lab";
import { useNavigate, NavLink } from "react-router-dom";
import { baseUrl } from "../../apiConfig";
import { Tooltip } from "@mui/material";
  
const HandleDelete = ({id , endPoint, to, syncQB, disabled = false }) => {
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const navigate = useNavigate();

    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarColor, setSnackBarColor] = useState("");
    const [snackBarText, setSnackBarText] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const handleSnackbar = (open, color, text, closeModal = false) => {
        setOpenSnackBar(open);
        setSnackBarColor(color);
        setSnackBarText(text);
        if (closeModal) {
          setOpenModal(false);
        
        }
      };
    const deletePo = async () => {
        try {
          const res = await axios.get(
            `${baseUrl}/api/${endPoint}${id}`,
            { headers }
          );
          if (res.data.Message) {
            
            handleSnackbar(true, "error", res.data.Message, true)
          }else{
            handleSnackbar(true, "error", res.data, true)
          }
          syncQB(res.data.SyncId)
          setTimeout(() => {
            navigate(`${res?.data?.isTemplate?"/recurring-invoices":to}`);
          }, 3000);
          console.log("delete response", res.data);
        } catch (error) {
         
            handleSnackbar(true, "error", "Error deleting Item", true)
          console.log("error deleting PO", error);
        }
      };

  return (<>
  
        
      {/* <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <DialogTitle sx={{ backgroundColor: "#77993d ", color: "white" }}>
          Delete
        </DialogTitle>
        <DialogContent sx={{ margin: "2em 5em 0em 5em" }}>
          <DialogContentText>
            <h5><ErrorOutlineIcon sx={{fontSize : 30}} color="error"/> Are you sure you want to delete selected item?</h5>
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
                deletePo()
            }}
            color="error"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog> */}
  <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={openModal}
      onClose={() => setOpenModal(false)}
      style={{ zIndex: 99999 }}
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
           Delete
          </Typography>

          <Typography align="center" sx={{ py: 2, px: 3, color: "#2c2c2c" }}>
           {`Are you sure you want to delete selected ${to=='/invoices'?"invoice":'item'}?`}
          </Typography>

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
                backgroundColor:  "#db2739" ,
                "&:hover": {
                  backgroundColor:  "#a91d2c" , // darker red on hover if deleteButton
                },
              }}
              variant="contained"
              onClick={() => {
                deletePo()
            }}
             
            >
             Yes
            </LoadingButton>
          </Box>
        </Box>
      </Fade>
    </Modal>

    {disabled ? (
      <Tooltip title="You don't have permission to delete this record" arrow>
        <span>
          <LoadingButton
            variant="outlined"
            color="error"
            disabled
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            startIcon={<Delete sx={{ fontSize: 2, opacity: 0.6 }} />}
            disableElevation
            sx={{
              marginRight: "0.6em",
              color: "red",
              textTransform: "capitalize",
              opacity: 0.6,
            }}
          >
            <EventPopups
              open={openSnackBar}
              setOpen={setOpenSnackBar}
              color={snackBarColor}
              text={snackBarText}
            />
            Delete
          </LoadingButton>
        </span>
      </Tooltip>
    ) : (
      <LoadingButton
        variant="outlined"
        // loading={loading}
        color="error"
        onClick={() => setOpenModal(true)}
        startIcon={<Delete sx={{ fontSize: 2 }} />}
        // onClick={handleSubmit}
        // disabled={disable}
        disableElevation
        sx={{
          marginRight: "0.6em",
          color: "red",    
          textTransform: "capitalize",
        }}
      >
        <EventPopups
          open={openSnackBar}
          setOpen={setOpenSnackBar}
          color={snackBarColor}
          text={snackBarText}
        />
        Delete
      </LoadingButton>
    )}
  </>)
}


export default HandleDelete
