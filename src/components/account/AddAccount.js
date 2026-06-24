import React, { useEffect, useState, useContext } from "react";
import { Grid, TextField, Checkbox, CircularProgress, FormControlLabel } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { baseUrl } from "../../apiConfig";
import TitleBar from "../TitleBar";
import EventPopups from "../Reusable/EventPopups";
import BackButton from "../Reusable/BackButton";
import { DataContext } from "../../context/AppData";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import useMenuAccess from "../Hooks/useMenuAccess";
const AddAccount = () => {
  const headers = { Authorization: `Bearer ${Cookies.get("token")}` };
  const navigate = useNavigate();
  const { dynamicColorAndLogo } = useContext(DataContext);
  const query = new URLSearchParams(useLocation().search);
  const idParam = Number(query.get("id")) || 0;
  const menuAccess = useMenuAccess();
  const canSave = idParam ? menuAccess.canEdit : menuAccess.canCreate;

  const [form, setForm] = useState({
    AccountId: 0,
    Name: "",
    Code: "",
    Type: "",
    isActive: true,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const fetchAccount = async () => {
    if (!idParam) return;
    try {
      setIsFetching(true);
      const res = await axios.get(`${baseUrl}/api/Item/GetAccount?id=${idParam}`, { headers });
      const data = res?.data?.Data || res?.data || {};
      setForm({
        AccountId: data?.AccountId || idParam,
        Name: data?.Name || "",
        Code: data?.Code || "",
        Type: data?.Type || "",
        isActive: data?.isActive !== undefined ? data.isActive : true,
      });
    } catch (e) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Failed to load account");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchAccount(); }, [idParam]);

  const handleSave = async () => {
    try {
      setSubmitClicked(true);
      if (!form.Name || !form.Code || !form.Type) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("Please fill all required fields");
        return;
      }
      setIsSaving(true);
      const payload = { ...form, AccountId: idParam || 0 };
      await axios.post(`${baseUrl}/api/Item/AddAccount`, payload, {
        headers: { ...headers, "Content-Type": "application/json" },
      });
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(idParam ? "Account updated successfully" : "Account added successfully");
      setTimeout(() => navigate("/accounts"), 800);
    } catch (e) {
      const apiMsg =
        e?.response?.data?.Message ||
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e?.message ||
        "Failed to save account";
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(apiMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <TitleBar icon={<AccountBalanceIcon />} title={idParam ? "Update Account Details" : "Add Account Details"} />
      <div className="container-fluid">
        <EventPopups open={openSnackBar} setOpen={setOpenSnackBar} color={snackBarColor} text={snackBarText} />
        <div className="card">
        <div className="itemtitleBar d-flex justify-content-between">
            <h4 className="modal-title w-50">Account Info</h4>
          </div>    
          {isFetching ? (
            <div className="center-loader">
              <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
            </div>
          ) : (
            <div className="card-body">
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <label className="form-label">Account Name <span className="text-danger">*</span></label>
                  <TextField placeholder="Account Name" value={form.Name} onChange={(e) => setField("Name", e.target.value)} size="small" fullWidth error={submitClicked && !form.Name} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <label className="form-label">Code <span className="text-danger">*</span></label>
                  <TextField placeholder="Code" value={form.Code} onChange={(e) => setField("Code", e.target.value)} size="small" fullWidth error={submitClicked && !form.Code} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <label className="form-label">Type <span className="text-danger">*</span></label>
                  <TextField placeholder="Type" value={form.Type} onChange={(e) => setField("Type", e.target.value)} size="small" fullWidth error={submitClicked && !form.Type} />
                </Grid>
                <Grid item xs={12} md={3} style={{ display: "flex", alignItems: "end" }}>
                  <FormControlLabel
                    control={<Checkbox checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} />}
                    label="Active"
                    sx={{ columnGap: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <div className="row">
                    <div className="col-md-4">
                      <BackButton onClick={() => navigate("/accounts")}>Back</BackButton>
                    </div>
                    <div className="col-md-8 text-end">
                      <LoadingButton 
                        variant="contained" 
                        onClick={handleSave} 
                        loading={isSaving} 
                        disabled={isSaving || !canSave || menuAccess.isLoading} 
                        sx={{textTransform: "capitalize"}}
                      >
                        Save
                      </LoadingButton>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddAccount;


