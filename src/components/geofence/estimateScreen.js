import React, { useContext, useEffect, useState } from "react";
import MapCo from "./estimateMap";
import Cookies from "js-cookie";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { CircularProgress } from "@mui/material";
import EventPopups from "../Reusable/EventPopups";
import { baseUrl } from "../../apiConfig";
import { DataContext } from "../../context/AppData";
import Authorization from "../Reusable/Authorization";
import TitleBar from "../TitleBar";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import useGetApi from "../Hooks/useGetApi";
const EstimmateMapScreen = () => {
    const token = Cookies.get("token");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const queryParams = new URLSearchParams(window.location.search);
    const idParam = Number(queryParams.get("id"));
    const { loggedInUser } = useContext(DataContext);
    const { getData } = useGetApi();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSR, setselectedSR] = useState(null);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarColor, setSnackBarColor] = useState("");
    const [snackBarText, setSnackBarText] = useState("");
    const [foremanData, setForemanData] = useState([]);
    const [selectForeman, setSelectForeman] = useState(0);
    const [openModal2, setOpenModal2] = useState(false);
    const [radiusLoader, setRadiusLoader] = useState(false);
    const [formData, setFormData] = useState({
        SRTypeId: 0,
        pageLength: 50,
        CustomerId: idParam || 0,
        ForemanId: selectForeman || 0
    });
    const [radius, setRadius] = useState(0);
    const [mapData, setMapData] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [coloredMarkersList, setColoredMarkersList] = useState([]);
    const [selectedColoredMarker, setSelectedColoredMarker] = useState({});
 
    const handleAutocompleteChange = (
        fieldName,
        valueProperty,
        event,
        newValue
    ) => {
        const simulatedEvent = {
            target: {
                name: fieldName,
                value: newValue ? newValue[valueProperty] : "",
            },
        };
        handleInputChange(simulatedEvent);
    };
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSelectForeman(value);
    };

    const handleClearForeman = () => {
        setSelectForeman(0);
        // Call API to get all foremen when clearing
        fetchStaffList();
    };

    const fetchStaffList = async () => {
        getData(
            `/Staff/GetStaffList`,
            (data) => {
                setForemanData(data);
            },
            (err) => {
                setForemanData(false);
            }
        );
    };

    useEffect(() => {
        fetchStaffList()

    }, []);
    const [scrollLoader, setScrollLoader] = useState(false);
    const getSRMap = async () => {
        setScrollLoader(true);
        try {
            const response = await axios.get(
                `${baseUrl}/api/Estimate/GetEstimateServerSideList?Search=&DisplayStart=1&DisplayLength=50&StatusId=0&isAscending=0&isPurchaseOrder=2&isBill=2&isInvoice=2&isRegionalManager=0&isBillSort=2&isInvoiceSort=0&isProfit=0&isApprovedDate=0&StartDate=null&EndDate=null&EstimateTypeId=0&ForemanId=${formData.ForemanId || selectForeman}&isForemanOnly=1`,
                {
                    headers,
                }
            );
            setScrollLoader(false);
            console.log("map Data", response.data);
            setMapData(response.data?.Data);
            setCustomers(response.data?.Data);
            setIsLoading(false);
            // window.location.reload();
        } catch (error) { 
            setIsLoading(false);
            setScrollLoader(false);
            setMapData([]);
            console.error("There was an error getting map:", error);
        }
    };
  
    const submitRadius =async () => {
        setRadiusLoader(true);
        let data = {
         EstimateId: selectedColoredMarker.EstimateId,
         LocationRadius: radius
        }
           try {
             const response = await axios.post(`${baseUrl}/api/Estimate/UpdateEstimateLocationRadius`,
              data,
               {headers},
               
             );
             setOpenSnackBar(true);
             setSnackBarColor("success");
             setSnackBarText(response?.data);
             getSRMap()
             setTimeout(() => {
                setOpenModal2(false);
                setRadiusLoader(false);
             }, 2000);
         
           } catch (error) {
             console.log("error getting staff list", error);
             setRadiusLoader(false);
           }
         
      
      
       };
    

   

    const [toolTipData, setToolTipData] = useState({});

    const getLatLngs = (map) => {
        if (!map.lat) {
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText("Location not Found");
            return;
        }

        setToolTipData(map);
    };


    useEffect(() => {
        getSRMap();
    }, [formData,selectForeman]);

    if (isLoading) {
        return (
            <div className="center-loader">
                <CircularProgress></CircularProgress>
            </div>
        );
    }

    return (
        <>
            <EventPopups
                open={openSnackBar}
                setOpen={setOpenSnackBar}
                color={snackBarColor}
                text={snackBarText}
            />
            <TitleBar icon={<LocationOnOutlinedIcon sx={{ color: "#8c8b8b", fontSize: 20 }} />} title={"Shift Tracker"}></TitleBar>
            <div className="container-fluid">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-5">
                                <div>
                                    <div>
                                     
                                        <Authorization allowTo={[1, 4, 5, 6]} hide>
                                            <label className="form-label">Select Foreman</label>

                                            <Autocomplete
                                                id="staff-autocomplete"
                                                size="small"
                                                options={foremanData?.filter(
                                                    (staff) =>
                                                        staff?.Role === "Foreman"
                                                )}
                                                getOptionLabel={(option) =>
                                                    option.FirstName + " " + option.LastName || ""
                                                }
                                                value={
                                                    foremanData?.find((staff) => staff.UserId === selectForeman) ||
                                                    null
                                                }
                                                onChange={(event, newValue) => {
                                                    if (newValue === null) {
                                                        handleClearForeman();
                                                    } else {
                                                        handleAutocompleteChange(
                                                            "selectForeman",
                                                            "UserId",
                                                            event,
                                                            newValue
                                                        );
                                                    }
                                                }}
                                                isOptionEqualToValue={(option, value) =>
                                                    option.UserId === value.selectForeman
                                                }
                                                renderOption={(props, option) => (
                                                    <li {...props}>
                                                        <div className="customer-dd-border">
                                                            <div className="row">
                                                                <div className="col-md-auto">
                                                                    <h6 className="pb-0 mb-0">
                                                                        {option.FirstName} {option.LastName}
                                                                    </h6>
                                                                </div>
                                                                {/* <div className="col-md-auto">
                                                                    <small>({option.Role})</small>
                                                                </div> */}
                                                            </div>
                                                        </div>
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label=""
                                                        placeholder="Choose..."
                                                        className="transparent"
                                                    />
                                                )}
                                            />

                                        </Authorization>
                                    </div>
                                    <div className=" mt-2  ">
                                        <div className="pt-0">
                                            <div className="tab-content">
                                                <div style={{ height: "70vh", overflowY: "scroll" }}>
                                                    {mapData?.length <= 0 ? (
                                                        <h4 className="mt-3 text-center">
                                                            No Record Found
                                                        </h4>
                                                    ) : (
                                                        mapData?.filter((map) => map?.ForemanId).map((map) => { 
                                                            return (
                                                            <div
                                                                style={{ cursor: "pointer" }}
                                                                key={map?.EstimateId}
                                                                className="tab-pane active"
                                                            >
                                                                <div className="row serviceLocations py-0">
                                                                    <div
                                                                        onClick={() => {
                                                                            getLatLngs(map);
                                                                            setselectedSR(map?.EstimateId);
                                                                        }}
                                                                        className="col-md-12"
                                                                    >
                                                                        <div
                                                                            className={
                                                                                selectedSR === map?.EstimateId
                                                                                    ? "locationInfo selected-map"
                                                                                    : "locationInfo"
                                                                            }
                                                                        >
                                                                            <div className="col-md-3 flex-box">
                                                                                <p>{map?.EstimateNumber}</p>
                                                                            </div>
                                                                            <div className="col-md-9">
                                                                                <div className="media-body">
                                                                                    <h6 className="mb-1">
                                                                                        {map?.CustomerDisplayName}
                                                                                    </h6>
                                                                                    <p className="mb-1">{map?.Address}</p>
                                                                                  
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )})
                                                    )}
                                                    <div
                                                        className="row text-center justify-content-center"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                pageLength: formData.pageLength + 10,
                                                            });
                                                        }}
                                                    >
                                                        {scrollLoader ? (
                                                            <div style={{ height: "10em" }}>
                                                                <CircularProgress></CircularProgress>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {mapData?.length <= 0 ? (
                                                                    <></>
                                                                ) : (
                                                                    <h4>Load More</h4>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-7">
                                <MapCo
                                    mapData={mapData}
                                    toolTipData={toolTipData}
                                    coloredMarkersList={coloredMarkersList}
                                    radius={radius}
                                    setRadius={setRadius}
                                    radiusLoader={radiusLoader}
                                    submitRadius={submitRadius}
                                    openModal2={openModal2}
                                    setOpenModal2={setOpenModal2}
                                    selectedColoredMarker={selectedColoredMarker}
                                    setSelectedColoredMarker={setSelectedColoredMarker}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EstimmateMapScreen;
