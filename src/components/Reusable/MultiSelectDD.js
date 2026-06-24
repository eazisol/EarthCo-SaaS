import React, { useCallback, useEffect, useMemo, useState } from "react";
import useGetData from "../Hooks/useGetData";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { NavLink } from "react-router-dom";
import { Chip } from "@mui/material";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";
import axios from "axios";
const MultiSelectDD = ({
  property1,
  property2,
  endPoint,
  placeholder,
  setPayload,
  payload,
  nav,
  isPartial,
  invoice = false,
  idParam,
  totalAmount = 0,
}) => {
 const num = (v) => Number(v) || 0;
  const totalAmountSum = useMemo(
    () => payload.reduce((sum, item) => sum + num(item.TotalAmount), 0),
    [payload],
  );
  const alreadyInPayload = useCallback(
    (obj) => payload.some((p) => p[property1] === obj[property1]),
    [payload, property1],
  );
  const { getListData, data } = useGetData();
  const [search, setSearch] = useState("");
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };


  useEffect(() => {
    if (endPoint !== "") {
      getListData(`${endPoint}?Search=${search}`);
    }

  }, [search]);
const tryAddToPayload = async (option) => {
  if (!option || alreadyInPayload(option)) return;

  if (invoice) {
    const { data: allowRes = false } = await axios.get(
      `${baseUrl}/api/Estimate/IsInvoiceAllowedForEstimate`,
      { params: { EstimateId: idParam }, headers },
    );
    if (!allowRes) return;
  }

  setPayload((prev) => {
    if (prev.some((p) => p[property1] === option[property1])) return prev;

    const newTotal =
      prev.reduce((s, it) => s + num(it.TotalAmount), 0) + num(option.TotalAmount);

    if (newTotal > totalAmount) return prev; 

    return isPartial ? [...prev, option] : [option];
  });
};

  const handleInvoiceChange = async (event, newValue) => {
//  tryAddToPayload(newValue);
if (!newValue) return
if (isPartial) {

      setPayload([...payload, newValue])
      return

    } else if (!isPartial) {
      setPayload([newValue])
      return
    }
    // if (!newValue) return;
    // const { data } = await axios.get(
    //   `${baseUrl}/api/Estimate/IsInvoiceAllowedForEstimate`,
    //   {
    //     params: { EstimateId: idParam },
    //     headers
    //   }
    // );
    // console.log("🚀 ~ handleInvoiceChange ~ data:", data)
    //   const prospectiveTotal = totalAmountSum + num(option.TotalAmount);
    //   if (!isPartial && prospectiveTotal > totalAmount) return; 
    //    setPayload((prev) => (isPartial ? [...prev, option] : [option]));
    // if (totalAmountSum >= totalAmount) {
    //   console.log("🚀 ~ handleInvoiceChange ~ totalAmountSum >= totalAmount:",)
    //   return
    // } else if (totalAmountSum <= totalAmount && !isPartial) {
    //   console.log("🚀 ~ handleInvoiceChange ~ totalAmountSum<=totalAmount&&!isPartial:",)
    //   setPayload([newValue])
    //   return
    // }else if (totalAmountSum <= totalAmount && isPartial) {
    //   console.log("🚀 ~ handleInvoiceChange ~ totalAmountSum<=totalAmount &&isPartial:",)
    //   setPayload([...payload, newValue])
    //   return
    // } else {
    //   return
    // }

  }
  const handleChipChange = (event, newValue) => {
    if (!newValue) return;

    if (!invoice) {
      setPayload([...payload, newValue])
      return
    } else if (isPartial) {

      setPayload([...payload, newValue])
      return

    } else if (!isPartial) {
      setPayload([newValue])
      return
    } else {
      setPayload([...payload, newValue])

    }


  };

  const partialInvoiceHandler = (event, newValue) => {

    if (newValue) {
      setPayload([newValue])
    }

  };

  const handleChipDelete = (option, index) => {
    const newPayload = [...payload];
    newPayload.splice(index, 1);
    setPayload(newPayload);
  };

  return (
    <>
      <Autocomplete
        size="small"
        options={data}
        filterOptions={(option) => option}
        getOptionLabel={(option) => option[property2] || ""}
        noOptionsText="No record found in system"
        onChange={invoice ? handleInvoiceChange : handleChipChange}
        renderInput={(params) => (
          <TextField
            {...params}
            onChange={(e) => setSearch(e.target.value)}
            label=""
            placeholder={placeholder}
            className="bg-white"
          />
        )}
        aria-label="Contact select"
      />

      {/* {payload.map((option, index) =>
        option[property1] ? (
          <Chip
            key={option[property1]}
            sx={{marginTop : "5px", marginRight : "3px"}}
            label={
              <NavLink to={`${nav}${option[property1]}`}>
                {option[property2]}
              </NavLink>
            }
            size="small"
            deleteIcon={<span className="fa fa-times"></span>}
            onDelete={(event) => {
              handleChipDelete(option, index);
            }}
          />
        ) : (
          <></>
        )
      )} */}
    </>
  );
};

export default MultiSelectDD;
