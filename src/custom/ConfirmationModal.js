import { Box, Button, Fade, Modal, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";

export const ConfirmationModal = ({
  modalOpen,
  setModalOpen,
  title = "Confirmation",
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  disabled = false,
  deleteButton = false,
  onClose,
  onCancel
}) => {
  const handleClose = onClose || (() => setModalOpen(false));

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={modalOpen}
      onClose={handleClose}
      style={{ zIndex: 99999 }}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
          zIndex: 99999,
        },
      }}
    >
      <Fade in={modalOpen}>
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
            {title}
          </Typography>

          <Typography align="center" sx={{ py: 2, px: 3, color: "#2c2c2c" }}>
            {description}
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
            onClick={onCancel || handleClose}
            >
              {cancelText}
            </Button>
            <LoadingButton
              sx={{
                textTransform: "capitalize",
                width: "35%",
                backgroundColor: deleteButton ? "#db2739" : undefined,
                "&:hover": {
                  backgroundColor: deleteButton ? "#a91d2c" : undefined, // darker red on hover if deleteButton
                },
              }}
              variant="contained"
              onClick={onConfirm}
              disabled={disabled}
              loading={loading}
            >
              {confirmText}
            </LoadingButton>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};
