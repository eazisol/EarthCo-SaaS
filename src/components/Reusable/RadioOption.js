import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
const RadioOption = ({ name, options = [] , formData, setFormData, title}) => {

  const handleChange = (event) => {
    setFormData({ ...formData, [name]: event.target.value });
  };

  return (
    <FormControl>
      <FormLabel id={`demo-controlled-radio-buttons-group-${name}`}>
        {title}
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby={`demo-controlled-radio-buttons-group-${name}`}
        // value={formData[name]||options[0].value}
        value={formData[name] ?? ""}
        onChange={handleChange}
      >
        {options.map((option, index) => (
          <FormControlLabel
          style={{marginLeft:"-8px"}}
            key={index}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioOption;
