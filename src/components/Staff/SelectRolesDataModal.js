import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";

const token = Cookies.get("token");
const headers = {
  Authorization: `Bearer ${token}`,
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 440,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
};

const initialCommissionState = {
  RoleId: 4,
  SaleCommissionPercentage: "",
  SaleCommissionAmount: "",
  SprayTechPercentage: "",
  MulchBonusAmount: "",
  MulchBonusYards: "",
  QuarterlyPerMonthBonus: "",
  StaffSaleCommissionId: 0,
};

const SelectRolesDataModal = ({
  open,
  handleClose,
  onSave,
}) => {
  const [customerInfo, setCustomerInfo] = useState({ ...initialCommissionState });
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const prevRoleId = useRef(initialCommissionState.RoleId);

  // Fetch roles
  const getRoles = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/UserManagement/Roles`,
        {
          headers,
        }
      );
      setUserRoles(response.data);
    } catch (error) {
      console.log("error ", error);
      setUserRoles([]);
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  const filteredRoles = Array.isArray(userRoles)
    ? userRoles.filter(
      (role) =>
        role.RoleId === 4 || role.RoleId === 5 || role.RoleId === 8
    )
    : [];

  const getCommissionData = async (roleId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/Dashboard/GetStaffCommission?RoleId=${roleId}`,
        {
          headers,
        }
      );

      if (response.status === 200 && response.data) {
        setCustomerInfo((prev) => ({
          ...prev,
          RoleId: roleId,
          SaleCommissionPercentage: response.data.SaleCommissionPercentage ?? "",
          SaleCommissionAmount: response.data.SaleCommissionAmount ?? "",
          SprayTechPercentage: response.data.SprayTechPercentage ?? "",
          MulchBonusAmount: response.data.MulchBonusAmount ?? "",
          MulchBonusYards: response.data.MulchBonusYards ?? "",
          QuarterlyPerMonthBonus: response.data.QuarterlyPerMonthBonus ?? "",
          StaffSaleCommissionId: response.data.StaffSaleCommissionId && response.data.StaffSaleCommissionId !== 0
            ? response.data.StaffSaleCommissionId
            : 0,
        }));
      } else {
        setCustomerInfo({
          ...initialCommissionState,
          RoleId: roleId,
        });
      }
    } catch (error) {
      setCustomerInfo({
        ...initialCommissionState,
        RoleId: roleId,
      });
      console.log("error getting commission data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      getCommissionData(4);
      prevRoleId.current = 4;
    }
  }, [open]);

  const handleRoleChange = (e) => {
    const selectedRoleId = e.target.value;
    setCustomerInfo({
      ...initialCommissionState,
      RoleId: selectedRoleId,
    });
    getCommissionData(selectedRoleId);
    prevRoleId.current = selectedRoleId;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save handler
  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/Dashboard/AddStaffCommission`,
        customerInfo,
        {
          headers,
        }
      );
      if (response.status === 200 && response.data) {
        setCustomerInfo((prev) => ({
          ...prev,
          SaleCommissionPercentage: response.data.SaleCommissionPercentage ?? "",
          SaleCommissionAmount: response.data.SaleCommissionAmount ?? "",
          SprayTechPercentage: response.data.SprayTechPercentage ?? "",
          MulchBonusAmount: response.data.MulchBonusAmount ?? "",
          MulchBonusYards: response.data.MulchBonusYards ?? "",
          QuarterlyPerMonthBonus: response.data.QuarterlyPerMonthBonus ?? "",
          StaffSaleCommissionId: response.data.StaffSaleCommissionId && response.data.StaffSaleCommissionId !== 0
            ? response.data.StaffSaleCommissionId
            : 0,
        }));
        setOpenSnackBar(true);
        setSnackBarColor("success");
        setSnackBarText(response?.data?.Message);
        handleClose();
      } else {
        setCustomerInfo((prev) => ({
          ...prev,
          SaleCommissionPercentage: "",
          SaleCommissionAmount: "",
          SprayTechPercentage: "",
          MulchBonusAmount: "",
          MulchBonusYards: "",
          QuarterlyPerMonthBonus: "",
          StaffSaleCommissionId: 0,
        }));
      }
    } catch (error) {
      setCustomerInfo((prev) => ({
        ...prev,
        SaleCommissionPercentage: "",
        SaleCommissionAmount: "",
        SprayTechPercentage: "",
        MulchBonusAmount: "",
        MulchBonusYards: "",
        QuarterlyPerMonthBonus: "",
        StaffSaleCommissionId: 0,
      }));

      console.log("error saving staff sale commission", error);
    } finally {
      setLoading(false);
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
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>
            Commission by Role
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              size="small"
              labelId="role-label"
              name="RoleId"
              value={customerInfo.RoleId}
              label="Role"
              fullWidth
              onChange={handleRoleChange}
            >
              {filteredRoles.map((role) => (
                <MenuItem key={role.RoleId} value={role.RoleId}>
                  {role.Role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {customerInfo.RoleId === 4 && (
            <>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", marginTop: "20px" }}>
                  <CircularProgress />
                </div>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      margin="normal"
                      size="small"
                      fullWidth
                      label="Sales Commission %"
                      name="SaleCommissionPercentage"
                      value={customerInfo.SaleCommissionPercentage}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      margin="normal"
                      size="small"
                      fullWidth
                      label="Spray Tech Commission %"
                      name="SprayTechPercentage"
                      value={customerInfo.SprayTechPercentage}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      margin="normal"
                      size="small"
                      fullWidth
                      label="Yard Threshold for Mulch Bonus"
                      name="MulchBonusYards"
                      value={customerInfo.MulchBonusYards}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      margin="normal"
                      size="small"
                      fullWidth
                      label="Mulch Bonus Amount"
                      name="MulchBonusAmount"
                      value={customerInfo.MulchBonusAmount}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      margin="normal"
                      size="small"
                      fullWidth
                      label="Quarterly Per Month Bonus"
                      name="QuarterlyPerMonthBonus"
                      value={customerInfo.QuarterlyPerMonthBonus}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                </Grid>
              )}
            </>
          )}

          {customerInfo.RoleId === 8 && (
            <>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", marginTop: "20px" }}>
                  <CircularProgress />
                </div>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      margin="normal"
                      size="small"
                      fullWidth
                      label="Sales Commission %"
                      name="SaleCommissionPercentage"
                      value={customerInfo.SaleCommissionPercentage}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                </Grid>
              )}
            </>
          )}

          {customerInfo.RoleId === 5 && (
            <>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", marginTop: "20px" }}>
                  <CircularProgress />
                </div>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      margin="normal"
                      size="small"
                      fullWidth
                      label="Sales Commission %"
                      name="SaleCommissionPercentage"
                      value={customerInfo.SaleCommissionPercentage}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      margin="normal"
                      size="small"
                      fullWidth
                      label="Sales Threshold Amount"
                      name="SaleCommissionAmount"
                      value={customerInfo.SaleCommissionAmount}
                      onChange={handleChange}
                      type="number"
                    />
                  </Grid>
                </Grid>
              )}
            </>
          )}

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button size="small" variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>

              Cancel
            </Button>
            <LoaderButton
              disable={loading}
              loading={loading}
              handleSubmit={() => {
                handleSave()
              }}
            >
              Save
            </LoaderButton>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default SelectRolesDataModal;
