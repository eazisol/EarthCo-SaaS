import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    TablePagination,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Autocomplete,
    CircularProgress,
    IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import AddButton from "../Reusable/AddButton";
import TitleBar from "../TitleBar";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import AutoModeIcon from '@mui/icons-material/AutoMode';
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";
import Alert from "@mui/material/Alert";

export const ForemanTable = () => {
    const daysOfWeek = [
        { id: 1, name: "Monday" },
        { id: 2, name: "Tuesday" },
        { id: 3, name: "Wednesday" },
        { id: 4, name: "Thursday" },
        { id: 5, name: "Friday" },
        { id: 6, name: "Saturday" },
        { id: 7, name: "Sunday" },
    ];
    const monthDates = Array.from({ length: 31 }, (_, i) => ({
        id: i + 1,
        label: `${i + 1}`,
    }));
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        CustomerId: null,
        ForemanId: "",
        TemplateName: "",
        StartDate: "",
        EndDate: "",
        RepeatIntervalId: "",
        Day: "",
        RepeatEvery: 1,
    });
    const [editId, setEditId] = useState(null);
    const [submitClicked, setSubmitClicked] = useState(false);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarColor, setSnackBarColor] = useState("");
    const [snackBarText, setSnackBarText] = useState("");
    const token = Cookies.get("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1); // 1-based for TablePagination
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [staffData, setStaffData] = useState([]);
    const [RepeatIntervalList, setRepeatIntervalList] = useState([]);
    const [foremanData, setForemanData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [modalOpen, setModalOpen] = useState({ open: false, onConfirm: null });

    // Permissions for QC Schedule
    const menuAccess = useMenuAccess();
    const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
    const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
    const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
    
    // Determine if this is edit mode (has editId)
    const isEditMode = !!editId;

    // Debounce search
    const searchTimeout = useRef();

    // Fetch all foreman templates
    const fetchForemanData = async (params = {}) => {
        setIsLoading(true);
        try {
            // Calculate DisplayStart for server-side paging (1-based index for page)
            const displayPage = params.page !== undefined ? params.page : page;
            const displayLength = params.rowsPerPage !== undefined ? params.rowsPerPage : rowsPerPage;
            // Always send "" for search as per instruction
            const searchValue = params.search !== undefined ? params.search : "";

            const response = await axios.get(
                `${baseUrl}/api/ForemanQCChecklist/GetForemanQCChecklistFormServerSideList?DisplayStart=${displayPage}&DisplayLength=${displayLength}&isTemplate=true&Search="${searchValue}"`,
                { headers }
            );
            setForemanData(response?.data.Data || []);
            setTotalCount(response?.data.totalRecords || 0);

            // If the current page is now out of range due to deletion or filter, go to last available page
            if (
                response?.data.totalRecords &&
                (displayPage - 1) * displayLength >= response?.data.totalRecords &&
                response?.data.totalRecords > 0
            ) {
                const lastPage = Math.ceil(response?.data.totalRecords / displayLength);
                setPage(lastPage);
            }

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    };

    const getRepeatIntervalList = async () => {
        axios
            .get(`${baseUrl}/api/RecurringTempelate/GetRepeatIntervalList`, {
                headers,
            })
            .then((res) => {
                setRepeatIntervalList(res.data);
            })
            .catch((error) => {
                setRepeatIntervalList([]);
                console.log("contacts data fetch error", error);
            });
    };

    const fetchStaffList = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/Staff/GetStaffList`, {
                headers,
            });
            setStaffData(response.data);
        } catch (error) {
            console.log("error getting staff list", error);
        }
    };

    // Initial load
    useEffect(() => {
        // Always start from page 1 and search ""
        setPage(1);
        fetchForemanData({ page: 1, rowsPerPage, search: search });
        fetchStaffList();
        getRepeatIntervalList();
        // eslint-disable-next-line
    }, []);

    // Fetch data when page, rowsPerPage changes
    useEffect(() => {
        fetchForemanData({ page, rowsPerPage, search: search });
        // eslint-disable-next-line
    }, [page, rowsPerPage]);

    // Debounced search effect
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            // Always reset to page 1 and send search as ""
            setPage(1);
            fetchForemanData({ page: 1, rowsPerPage, search: search });
        }, 400);
        return () => clearTimeout(searchTimeout.current);
        // eslint-disable-next-line
    }, [search]);

    // Fetch a single foreman template by id and populate formData
    const fetchForemanById = async (id) => {
        try {
            const response = await axios.get(
                `${baseUrl}/api/ForemanQCChecklist/GetForemanQCChecklistForm?id=${id}`,
                { headers }
            );
            const data = response?.data;
            if (data) {
                // Always set Day, never RepeatDate
                let dayValue = "";
                const selectedRepeat = RepeatIntervalList.find(
                    (r) => r.RepeatIntervalId === data?.RecurringTemplateData?.RepeatIntervalId
                );
                const repeatType = selectedRepeat ? selectedRepeat.Repeat : "";
                if (repeatType === "Weekly") {
                    dayValue = data?.RecurringTemplateData?.Day || "";
                } else if (repeatType === "Monthly") {
                    // For monthly, use Day field for the date (number)
                    dayValue = data?.RecurringTemplateData?.Day || "";
                }
                setFormData({
                    CustomerDisplayName: data.Data.CustomerDisplayName || "",
                    CustomerId: data.Data.CustomerId || "",
                    ForemanId: data.Data.ForemanId || "",
                    TemplateName: data?.RecurringTemplateData?.TemplateName || "",
                    StartDate: data?.RecurringTemplateData?.StartDate ? data?.RecurringTemplateData?.StartDate.split("T")[0] : "",
                    EndDate: data?.RecurringTemplateData?.EndDate ? data?.RecurringTemplateData?.EndDate.split("T")[0] : "",
                    RepeatIntervalId: data?.RecurringTemplateData?.RepeatIntervalId || "",
                    Day: dayValue,
                    RepeatEvery: data?.RecurringTemplateData?.RepeatEvery || "",
                });
            }
        } catch (error) {
            
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText("Failed to fetch template data.");
            setSubmitClicked(false);
            setLoading(false);
        }
    };

    // Handle row click: open modal, fetch data, set editId
    const handleRowClick = (item) => {
        // If no edit access, don't open modal
        if (!canEdit) {
            return;
        }
        setEditId(item?.ForemanQCChecklistFormId);
        setAddModalOpen(true);
        fetchForemanById(item?.ForemanQCChecklistFormId);
    };

    // Handle delete for table row
    const handleDeleteRow = async (id) => {
        if (!id) return;
        setLoading(true);
        setSubmitClicked(true);
        try {
            const response = await axios.get(
                `${baseUrl}/api/ForemanQCChecklist/DeleteForemanQCChecklist?id=${id}`,
                { headers }
            );
            setOpenSnackBar(true);
            setSnackBarColor("success");
            setSnackBarText(response.data.Message);
            // After delete, refetch with current page and "" search
            fetchForemanData({ page, rowsPerPage, search: search });
        } catch (error) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText(error.response?.data || "Delete failed");
            setSubmitClicked(false);
            setLoading(false);
            setSubmitClicked(false);
        } finally {
            setLoading(false);
            setSubmitClicked(false);
        }
        setLoading(false);
    };

    const handleFormChange = (e) => {
        // Prevent changes if no edit access
        if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
            return;
        }
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    const handleAutocompleteChange = (field, property, event, newValue) => {
        // Prevent changes if no edit access
        if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
            return;
        }
        setFormData((prev) => ({
            ...prev,
            [field]: newValue ? newValue[property] : "",
        }));
    };

    const handleSave = () => {
        // Check permissions before saving
        if (isEditMode) {
            // Updating existing QC schedule - need edit access
            if (!menuAccess.isLoading && !menuAccess.canEdit) {
                setOpenSnackBar(true);
                setSnackBarColor("error");
                setSnackBarText("You don't have permission to update QC schedules");
                return;
            }
        } else {
            // Creating new QC schedule - need create access
            if (!menuAccess.isLoading && !menuAccess.canCreate) {
                setOpenSnackBar(true);
                setSnackBarColor("error");
                setSnackBarText("You don't have permission to create QC schedules");
                return;
            }
        }
        
        setLoading(true);
        setSubmitClicked(true);
        // Validation
        if (!formData.CustomerId) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText('Customer Name is required');
            setLoading(false);
            setSubmitClicked(false);
            return;
        }
        if (!formData.ForemanId) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText('Foreman is required');
            setLoading(false);
            setSubmitClicked(false);
            return;
        }
        if (!formData.TemplateName) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText('Schedule Name is required');
            setLoading(false);
            setSubmitClicked(false);
            return;
        }
        if (!formData.StartDate) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText('Start Date is required');
            setLoading(false);
            setSubmitClicked(false);
            return;
        }
        if (!formData.EndDate) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText('End Date is required');
            setLoading(false);
            setSubmitClicked(false);
            return;
        }
        if (!formData.RepeatIntervalId) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText('Repeat Interval is required');
            setLoading(false);
            setSubmitClicked(false);
            return;
        }
        if (!formData.RepeatEvery || isNaN(formData.RepeatEvery) || formData.RepeatEvery <= 0) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText('Repeat Every must be a number greater than 0');
            setLoading(false);
            setSubmitClicked(false);
            return;
        }
        // For scheduled, require Day depending on interval
        const selectedRepeat = RepeatIntervalList.find(
            (r) => r.RepeatIntervalId === formData.RepeatIntervalId
        );
        const repeatType = selectedRepeat ? selectedRepeat.Repeat : "";

        if (
            (repeatType === "Weekly" || repeatType === "Monthly") &&
            !formData.Day
        ) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText(
                repeatType === "Weekly"
                    ? "Repeat Day is required for Weekly"
                    : "Repeat Date is required for Monthly"
            );
            setLoading(false);
            setSubmitClicked(false);
            return;
        }

        // Prepare recurringTemplateData: always use Day for both weekly and monthly, never RepeatDate
        let recurringTemplateData = {
            RecurringTemplateId: 0,
            TemplateName: formData.TemplateName,
            RecurringTemplateTypeId: 1, // SCHEDULED_TYPE_ID
            StartDate: formData.StartDate,
            EndDate: formData.EndDate,
            RepeatIntervalId: formData.RepeatIntervalId,
            RepeatEvery: parseInt(formData.RepeatEvery),
        };

        if (repeatType === "Weekly" || repeatType === "Monthly") {
            recurringTemplateData.Day = formData.Day;
        }
        // For Daily, do not send Day

        const foremanQCChecklistFormData = {
            CustomerId: formData.CustomerId,
            ForemanId: formData.ForemanId,
            HighProfileAreasChecked: false,
            ColorChecked: false,
            JobPatrolledForTrash: false,
            PropertyFreeOfDeadPlants: false,
            DeadPlantsReported: false,
            WeedsRemovedSidewalk: false,
            TurfConditionOk: false,
            PlantsAdequatelyWatered: false,
            NewPlantsSufficientWater: false,
            IrrigationSystemOk: false,
            FocalAreasMulched: false,
            PropertyFreeOfFallenTrees: false,
            CurrentRotation: "",
            NextWeekRotation: "",
            ForemanQCChecklistFormStatusId: 1,
            isTemplate: true,
            ForemanQCChecklistFormId: editId ? editId : 0,
        };

        const formDataToSend = new FormData();
        formDataToSend.append("ForemanQCChecklistFormData", JSON.stringify(foremanQCChecklistFormData));
        formDataToSend.append("RecurringTemplateData", JSON.stringify(recurringTemplateData));

        submitData(formDataToSend);
    };

    const submitData = async (data) => {
        setLoading(true);
        setSubmitClicked(true);
        try {
            const response = await axios.post(`${baseUrl}/api/ForemanQCChecklist/AddForemanQCChecklistForm`, data, { headers });
            if (response?.status == 200) {
                setOpenSnackBar(true);
                setSnackBarColor("success");
                setSnackBarText(response.data.Message);
                setAddModalOpen(false);
                setSubmitClicked(false);
                setEditId(null);
                setFormData({
                    CustomerId: "",
                    ForemanId: "",
                    TemplateName: "",
                    StartDate: "",
                    EndDate: "",
                    RepeatIntervalId: "",
                    Day: "",
                });
                // After save, always refetch with page 1 and "" search
                setPage(1);
                fetchForemanData({ page: 1, rowsPerPage, search: "" });
            }
        } catch (error) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText(error.response?.data || "Save failed");
            setLoading(false);
            setSubmitClicked(false);
        } finally {
            setLoading(false);
            setSubmitClicked(false);
        }
    };

    // Only scheduled, so always true
    const isScheduled = true;
    const selectedRepeat = RepeatIntervalList.find(
        (r) => r.RepeatIntervalId === formData.RepeatIntervalId
    );
    const isWeekly = selectedRepeat && selectedRepeat.Repeat === "Weekly";
    const isMonthly = selectedRepeat && selectedRepeat.Repeat === "Monthly";
    const isDaily = selectedRepeat && selectedRepeat.Repeat === "Daily";

    return (
        <>
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
                description="Are you sure you want to delete this QC Schedule?"
                onConfirm={() => {
                    modalOpen.onConfirm();
                    setModalOpen({ open: false, onConfirm: null });
                }}
                deleteButton
            />
            <TitleBar icon={<AutoModeIcon style={{fontSize: "20px"}} color="#8c8b8b" />} title={"QC Schedule"} />
            <div className="container-fluid">
                <div className="card">
                    <div className="card-body">
                        <div className="row ">
                            <div className="col-md-3">
                                <TextField
                                    type="text"
                                    label="Search"
                                    variant="standard"
                                    size="small"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="col-md-9">
                                <div className="custom-button-container mb-2">
                                    {canCreate ? (
                                        <AddButton onClick={() => {
                                            setAddModalOpen(true);
                                            setEditId(null);
                                            setFormData({
                                                CustomerId: "",
                                                ForemanId: "",
                                                TemplateName: "",
                                                StartDate: "",
                                                EndDate: "",
                                                RepeatIntervalId: "",
                                                Day: "",
                                                RepeatEvery: "",
                                            });
                                        }}>
                                            Add QC Schedule
                                        </AddButton>
                                    ) : (
                                        <Tooltip title="You don't have create access" arrow>
                                            <span>
                                                <AddButton
                                                    disabled
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    Add QC Schedule
                                                </AddButton>
                                            </span>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        </div>
                        <TableContainer sx={{ overflowX: "auto" }}>
                            <Table>
                                <TableHead className="table-header ">
                                <TableRow className="material-tbl-alignment">
                                    {[
                                        "Customer Name",
                                        "Foreman Name",
                                        "Template Name",
                                        "Interval",
                                        "Day",
                                        "Delete"
                                    ].map((headCell) => (
                                        <TableCell
                                            key={headCell}
                                            align={headCell === "Customer Name" ? "left" : "center"}
                                        >
                                            {headCell}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                    {/* <TableRow className="material-tbl-alignment">
                                        {[
                                            "Customer Name",
                                            "Foreman Name",
                                            "Template Name",
                                            "Interval",
                                            "Day",
                                            "Delete"
                                        ].map((headCell) => (
                                            <TableCell key={headCell} align="center">{headCell}</TableCell>
                                        ))}
                                    </TableRow> */}
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell align="center" colSpan={12}>
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (!foremanData || foremanData.length === 0) ? (
                                            <TableRow>
                                                <TableCell align="center" colSpan={12}>
                                                    No Record Found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            foremanData?.map((item, index) => (
                                                <TableRow
                                                    key={item.ForemanQCChecklistFormId || item.id}
                                                    hover
                                                    className="material-tbl-alignment"
                                                    style={{ 
                                                        cursor: canEdit ? "pointer" : "default",
                                                        opacity: canEdit ? 1 : 0.6
                                                    }}
                                                    onClick={() => handleRowClick(item)}
                                                >
                                                    <TableCell>{item.CustomerCompanyName}</TableCell>
                                                    <TableCell align="center">{item.ForemanFirstName} {item.ForemanLastName}</TableCell>
                                                    <TableCell align="center">{item.tblRecurringTemplate?.TemplateName}</TableCell>
                                                    <TableCell align="center">{item.Interval}</TableCell>
                                                    <TableCell align="center">
                                                        {item.tblRecurringTemplate?.Day}
                                                    </TableCell>
                                                    {/* <TableCell
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <IconButton
                                                            aria-label="delete"
                                                            color="error"
                                                            onClick={() => {
                                                                setModalOpen({
                                                                    open: true,
                                                                    onConfirm: () => handleDeleteRow(item.ForemanQCChecklistFormId)
                                                                });
                                                            }}
                                                            disabled={loading}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell> */}
                                                     <TableCell align="center" onClick={e => e.stopPropagation()}>
                              {canDelete ? (
                                <span
                                  onClick={() => {
                                      setModalOpen({
                                          open: true,
                                          onConfirm: () => handleDeleteRow(item.ForemanQCChecklistFormId)
                                      });
                                  }}
                                  disabled={loading}
                                  style={{ cursor: "pointer" }}
                                > 
                                  <Delete color="error" />
                                </span>
                              ) : (
                                <Tooltip title="You don't have permission to delete QC schedules" arrow>
                                  <span>
                                    <Delete color="error" style={{ cursor: "not-allowed", opacity: 0.6 }} />
                                  </span>
                                </Tooltip>
                              )}
                            </TableCell>
                                                </TableRow>
                                            ))
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[100, 200, 300]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={page - 1} // TablePagination is 0-based, our page is 1-based
                            onPageChange={(event, newPage) => setPage(newPage + 1)}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>
            <Dialog open={addModalOpen} onClose={() => { setAddModalOpen(false); setEditId(null); }} maxWidth="sm" fullWidth>
                <DialogTitle style={{borderBottom: "1px solid #e0e0e0",padding:"8px 24px "}}>
                    {editId ? "Edit Schedule" : "Add Schedule"}
                </DialogTitle>
                {isEditMode && !menuAccess.isLoading && !menuAccess.canEdit && (
                    <Alert severity="warning" style={{ margin: "15px 24px 0 24px" }}>
                        <strong>Read-only mode:</strong> You don't have permission to update this QC schedule. You can view the information but cannot make changes.
                    </Alert>
                )}
                {!isEditMode && !menuAccess.isLoading && !menuAccess.canCreate && (
                    <Alert severity="warning" style={{ margin: "15px 24px 0 24px" }}>
                        <strong>No create access:</strong> You don't have permission to create new QC schedules.
                    </Alert>
                )}
                <DialogContent style={{borderBottom: "1px solid #e0e0e0",marginTop:"15px"}}>
                    <Grid container spacing={2} >
                        <Grid item xs={6}>
                            <label className="form-label" style={{ color: "#989898" }}>Customer Name <span className="text-danger">*</span></label>
                            <CustomerAutocomplete
                                formData={formData}
                                setFormData={setFormData}
                                submitClicked={submitClicked}
                                disableField={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <label className="form-label" style={{ color: "#989898" }}>Foreman <span className="text-danger">*</span></label>
                            <Autocomplete
                                id="staff-autocomplete"
                                size="small"
                                options={staffData.filter(
                                    (staff) => staff.Role === "Foreman"
                                )}
                                getOptionLabel={(option) =>
                                    (option.FirstName ? option.FirstName : "") +
                                    " " +
                                    (option.LastName ? option.LastName : "")
                                }
                                value={
                                    staffData.find(
                                        (staff) => staff.UserId === formData.ForemanId
                                    ) || null
                                }
                                onChange={(event, newValue) =>
                                    handleAutocompleteChange(
                                        "ForemanId",
                                        "UserId",
                                        event,
                                        newValue
                                    )
                                }
                                disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                                isOptionEqualToValue={(option, value) =>
                                    option.UserId === value?.UserId
                                }
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <div className="customer-dd-border">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <h6 className="pb-0 mb-0">
                                                        {option.FirstName} {option.LastName}
                                                    </h6>
                                                </div>
                                                <div className="col-md-12">
                                                    <small>
                                                        {"("}
                                                        {option.Role}
                                                        {")"}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Choose..."
                                        className="bg-white"
                                        error={submitClicked && !formData.ForemanId}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <label className="form-label" style={{ color: "#989898" }}>Schedule Name <span className="text-danger">*</span></label>
                            <TextField
                                name="TemplateName"
                                value={formData.TemplateName}
                                onChange={handleFormChange}
                                placeholder="Enter template name"
                                size="small"
                                fullWidth
                                className="bg-white"
                                error={submitClicked && !formData.TemplateName}
                                disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                            />
                        </Grid>
                        {/* Type dropdown removed, static scheduled */}
                        {isScheduled && (
                            <>
                                <Grid item xs={6}>
                                    <label className="form-label" style={{ color: "#989898" }}>Start Date <span className="text-danger">*</span></label>
                                    <TextField
                                        type="date"
                                        className="form-control"
                                        name="StartDate"
                                        size="small"
                                        value={formData.StartDate}
                                        error={submitClicked && !formData.StartDate}
                                        onChange={handleFormChange}
                                        disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <label className="form-label" style={{ color: "#989898" }}>End Date <span className="text-danger">*</span></label>
                                    <TextField
                                        type="date"
                                        className="form-control"
                                        name="EndDate"
                                        size="small"
                                        value={formData.EndDate}
                                        error={submitClicked && !formData.EndDate}
                                        onChange={handleFormChange}
                                        disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <label className="form-label" style={{ color: "#989898" }}>
                                        Repeat Every <span className="text-danger">*</span>
                                    </label>
                                    <TextField
                                        type="number"
                                        inputProps={{ min: 1 }}
                                        name="RepeatEvery"
                                        value={formData.RepeatEvery}
                                        onChange={handleFormChange}
                                        placeholder="Enter Repeat Every"
                                        size="small"
                                        fullWidth
                                        className="bg-white"
                                        error={submitClicked && !formData.RepeatEvery}
                                        disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <label className="form-label" style={{ color: "#989898" }}>Repeat Interval <span className="text-danger">*</span></label>
                                    <Autocomplete
                                        id="inputStateRepeat"
                                        size="small"
                                        options={RepeatIntervalList.filter(option => option.Repeat !== "Daily")}
                                        getOptionLabel={(option) => option.Repeat || ""}
                                        value={
                                            RepeatIntervalList.find(
                                                (opt) => opt.RepeatIntervalId === formData.RepeatIntervalId
                                            ) || null
                                        }
                                        onChange={(event, newValue) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                RepeatIntervalId: newValue?.RepeatIntervalId || "",
                                                Day: "",
                                            }))
                                        }
                                        disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                                        isOptionEqualToValue={(option, value) =>
                                            option.RepeatIntervalId === value?.RepeatIntervalId
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select Repeat Interval"
                                                className="bg-white"
                                                error={submitClicked && !formData.RepeatIntervalId}
                                            />
                                        )}
                                    />
                                </Grid>
                                {isWeekly && (
                                    <Grid item xs={6}>
                                        <label className="form-label" style={{ color: "#989898" }}>Repeat Day <span className="text-danger">*</span></label>
                                        <Autocomplete
                                            id="inputStateRepeatDay"
                                            size="small"
                                            options={daysOfWeek}
                                            getOptionLabel={(option) => option.name || ""}
                                            value={
                                                daysOfWeek.find((day) => day.id === Number(formData.Day)) || null
                                            }
                                            onChange={(event, newValue) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    Day: newValue?.id || "",
                                                }))
                                            }
                                            disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select Day"
                                                    className="bg-white"
                                                    error={submitClicked && !formData.Day}
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}
                                {isMonthly && (
                                    <Grid item xs={6}>
                                        <label className="form-label" style={{ color: "#989898" }}>Repeat Date <span className="text-danger">*</span></label>
                                        <Autocomplete
                                            id="inputStateRepeatDate"
                                            size="small"
                                            options={monthDates}
                                            getOptionLabel={(option) => option.label || ""}
                                            value={
                                                monthDates.find((date) => date.id === Number(formData.Day)) || null
                                            }
                                            onChange={(event, newValue) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    Day: newValue?.id || "",
                                                }))
                                            }
                                            disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select Date"
                                                    className="bg-white"
                                                    error={submitClicked && !formData.Day}
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}
                                {/* If Daily, do not show Repeat Day or Repeat Date fields */}
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setAddModalOpen(false); setEditId(null); }} variant="outlined" color="primary">
                        Cancel
                    </Button>
                    {((!isEditMode && !menuAccess.isLoading && menuAccess.canCreate) || (isEditMode && !menuAccess.isLoading && menuAccess.canEdit)) ? (
                        <LoaderButton
                            disable={loading||submitClicked}
                            loading={loading||submitClicked}
                            handleSubmit={() => {
                                handleSave()
                            }}
                        >
                            Save
                        </LoaderButton>
                    ) : (
                        <Tooltip 
                            title={isEditMode ? "You don't have permission to update this record." : "You don't have permission to create QC schedules"} 
                            arrow
                        >
                            <span>
                                <LoaderButton
                                    disable={true}
                                    loading={false}
                                    handleSubmit={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    Save
                                </LoaderButton>
                            </span>
                        </Tooltip>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};
