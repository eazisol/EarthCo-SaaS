import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
const TimeInput = ({name, formData, setFormData,title}) => {
  return (
    <div className="d-flex flex-column">
      <label className="form-label">{title}</label>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          slotProps={{ textField: { size: "small" } }}
          value={formData[name]}
          onChange={(newValue) => setFormData({...formData,[name]: newValue})}
        />
      </LocalizationProvider>
    </div>
  );
};

export default TimeInput;
