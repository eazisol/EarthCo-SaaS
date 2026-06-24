import React, { useEffect, useState } from "react";
import { TextField, Button, Grid, CircularProgress } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import TitleBar from "../TitleBar";
import AddressInputs from "../Modals/AddressInputs";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import EventPopups from "../Reusable/EventPopups";
import { LoadingButton } from "@mui/lab";
import BackButton from "../Reusable/BackButton";
import PortraitIcon from '@mui/icons-material/Portrait';
import useMenuAccess from "../Hooks/useMenuAccess";
const emptyAddress = {
  Street: "",
  State: "",
  City: "",
  Country: "",
  CountryCode: "",
  ZipCode: "",
  Lat: "",
  Long: "",
  Type: "ShipAddr",
  Description: "",
};

const AddVender = () => {
  const headers = { Authorization: `Bearer ${Cookies.get("token")}` };
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const idParam = Number(query.get("id")) || 0;
  const menuAccess = useMenuAccess();
  const canSave = idParam ? menuAccess.canEdit : menuAccess.canCreate;

  const [form, setForm] = useState({
    UserId: 0,
    CompanyName: "",
    FirstName: "",
    LastName: "",
    username: "",
    Email: "",
    Password: "",
    Address: "",
    Phone: "",
    AltPhone: "",
    Fax: null,
    Notes: null,
    DisplayName: "",
    CompanyId: 1,
    tblUserAddresses: [emptyAddress],
  });

  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);

  const fetchSupplier = async () => {
    if (!idParam) return;
    try {
      setIsFetching(true);
      const res = await axios.get(`${baseUrl}/api/Supplier/GetSupplier?id=${idParam}`, { headers });
      const data = res?.data?.Data || res?.data || {};
      setForm((prev) => ({
        ...prev,
        ...data,
        UserId: data?.UserId || 0,
        tblUserAddresses: data?.tblUserAddresses?.length ? data.tblUserAddresses : [emptyAddress],
      }));
    } catch (e) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Failed to load vendor");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchSupplier(); }, [idParam]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const handleSave = async () => {
    console.log("form for add vendor", form);
    console.log("idParam for add vendor", idParam);
    try {
      setSubmitClicked(true);
      // Required fields validation
      if (!form.CompanyName || !form.Email || !form.DisplayName || !form.Address) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("Please fill all required fields");
        return;
      }
      // For update, API expects same POST with id; set UserId to existing or 0
      setIsSaving(true);
      const payload = { ...form, UserId: idParam || 0, Notes: form.Notes ?? null };
      console.log("payload for add vendor", payload);
      await axios.post(`${baseUrl}/api/Supplier/AddSupplier`, payload, {
        headers: { ...headers, "Content-Type": "application/json" },
      });
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(idParam ? "Vendor updated successfully" : "Vendor added successfully");
      setTimeout(() => navigate("/venders/list"), 800);
    } catch (e) {
      const apiMsg =
        e?.response?.data?.Message ||
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        e?.message ||
        "Failed to save vendor";
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(apiMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <TitleBar icon={<PortraitIcon />} title={idParam ? "Update Vendor" : "Add Vendor"} />
      <div className="container-fluid">
        <EventPopups open={openSnackBar} setOpen={setOpenSnackBar} color={snackBarColor} text={snackBarText} />
        <div className="card">
          <div className="itemtitleBar d-flex justify-content-between">
            <h4 className="modal-title w-50">Vendor Info</h4>
          </div>
          {isFetching ? (
            <div className="center-loader">
              <CircularProgress />
            </div>
          ) : (
          <div className="card-body">
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <label className="form-label">Company Name <span className="text-danger">*</span></label>
                <TextField placeholder="Company Name" value={form.CompanyName} onChange={(e)=>setField("CompanyName", e.target.value)} size="small" fullWidth error={submitClicked && !form.CompanyName} />
              </Grid>
              <Grid item xs={12} md={3}>
                <label className="form-label">First Name</label>
                <TextField placeholder="First Name" value={form.FirstName} onChange={(e)=>setField("FirstName", e.target.value)} size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <label className="form-label">Last Name</label>
                <TextField placeholder="Last Name" value={form.LastName} onChange={(e)=>setField("LastName", e.target.value)} size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <label className="form-label">User Name</label>
                <TextField placeholder="User Name" value={form.username} onChange={(e)=>setField("username", e.target.value)} size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <label className="form-label">Email <span className="text-danger">*</span></label>
                <TextField placeholder="Email" value={form.Email} onChange={(e)=>setField("Email", e.target.value)} size="small" fullWidth error={submitClicked && !form.Email} />
              </Grid>
              <Grid item xs={12} md={3}>
                <label className="form-label">Internal Vendor Name <span className="text-danger">*</span></label>
                <TextField
                  placeholder="Vendor Display Name"
                  value={form.DisplayName}
                  onChange={(e)=>setField("DisplayName", e.target.value)}
                  size="small"
                  fullWidth
                  error={submitClicked && !form.DisplayName}
                />
              </Grid>
             
             
           
           
              {/* Address field same experience as customer */}
              <Grid item xs={12} md={6}>
                <label className="form-label">Property Management Address <span className="text-danger">*</span></label>
                <AddressInputs
                  address={form.Address}
                  name="Address"
                  handleChange={(e)=> setField(e.target.name, e.target.value)}
                  setCompanyData={setForm}
                  emptyError={submitClicked && !form.Address}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <label className="form-label">Notes</label>
                <TextArea
                  name="Notes"
                  value={form.Notes || ""}
                  onChange={(e)=> setField(e.target.name, e.target.value)}
                  className=" form-control "
                  rows="2"
                />
              </Grid>

              <Grid item xs={12}>
                <div className="row">
                  <div className="col-md-4">
                    <BackButton onClick={() => navigate("/venders/list")}>
                      Back
                    </BackButton>
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

export default AddVender;


