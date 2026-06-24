import React, { useEffect, useState } from "react";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FormControl, InputLabel } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

const TableFilterPopover = ({
  anchorEl,
  onClose,
  selectedCell,
  setBillFilter,
  setInvoiceFilter,
  setPoFilter,
  poFilter,
  billFilter,
  invoiceFilter,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (event) => {
    if (selectedCell == "PO filter by") {
      setSelectedOption(poFilter);
      setPoFilter(event.target.value);
      console.log("po", event.target.value);
    }
    if (selectedCell == "Bill filter by") {
      setBillFilter(event.target.value);
      setSelectedOption(billFilter);
      console.log("bill", event.target.value);
    }
    if (selectedCell == "Invoice filter by") {
      setInvoiceFilter(event.target.value);
      setSelectedOption(invoiceFilter);
      console.log("inv", event.target.value);
    }
    onClose();
  };

  useEffect(() => {
    if (selectedCell == "PO filter by") {
      setSelectedOption(poFilter);
    }
    if (selectedCell == "Bill filter by") {
      setSelectedOption(billFilter);
    }
    if (selectedCell == "Invoice filter by") {
      setSelectedOption(invoiceFilter);
    }
  }, []);

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <div style={{ padding: "16px 16px 16px 0px", width: "25em" }}>
        <div className="row">
          <div className="col-md-5 pe-0 mt-2 me-0 text-center">
            {/* <FilterAltIcon sx={{ fontSize: 40 }} /> */}
            <h5>{selectedCell}</h5>
          </div>
          <div className="col-md-7">
            {" "}
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label" size="small">
                {selectedCell}
              </InputLabel>
              <Select
                id="demo-simple-select"
                size="small"
                onChange={handleOptionChange}
                fullWidth
                label="Select filter"
                style={{ width: "100%" }}
              >
                <MenuItem value={2}>All</MenuItem>
                <MenuItem value={1}>Generated</MenuItem>
                <MenuItem value={0}>Not Generated</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
    </Popover>
  );
};

export default TableFilterPopover;
