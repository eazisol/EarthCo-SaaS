import React, { useState, useRef,useEffect  } from "react";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FilterCards from "./FilterCards";
import StoreIcon from '@mui/icons-material/Store';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import Person4OutlinedIcon from '@mui/icons-material/Person4Outlined';
import FormatAlignJustifyOutlinedIcon from '@mui/icons-material/FormatAlignJustifyOutlined';
const CardContainer = ({statusId, setStatusId, totalRecords}) => {
    const scrollRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showBackIcon, setShowBackIcon] = useState(false);

    const handleScroll = (scrollOffset) => {
        const newScrollPosition = scrollPosition + scrollOffset;
        scrollRef.current.scrollTo({
          left: newScrollPosition,
          behavior: "smooth",
        });
        setScrollPosition(newScrollPosition);
      };
    
      const scrollToStart = () => {
        scrollRef.current.scrollTo({
          left: 0,
          behavior: "smooth",
        });
        setScrollPosition(0);
        setShowBackIcon(false)
      };
    
      const scrollToEnd = () => {
        const contentWidth = scrollRef.current.scrollWidth;
        const containerWidth = scrollRef.current.clientWidth;
        const maxScroll = contentWidth - containerWidth;
        scrollRef.current.scrollTo({
          left: maxScroll,
          behavior: "smooth",
        });
        setScrollPosition(maxScroll);
        setShowBackIcon(true)
      };
    
  return (
   
    <div
      
      style={{
        verticalAlign: "center",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "flex-start",
        display : "flex",
      }}
    >
      {showBackIcon && <div
        style={{ width: "5%", paddingBottom: "2em" }}
        onClick={scrollToStart}
      >
        <ArrowBackIosIcon fontSize="large" style={{ cursor: "pointer" }} />
      </div>}
      <div
        style={{
          width: "95%",
          overflowX: "scroll",
          scrollbarWidth: "none",
          WebkitScrollbar: "none",
        }}
        ref={scrollRef}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            whiteSpace: "nowrap",
            width: "118em",
          }}
        >
           <FilterCards
            icon={FormatAlignJustifyOutlinedIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={"All"}
            title={"All"}
            color={"info"}
            number={totalRecords.total}
            amount={456}
          />
          <FilterCards
            icon={PieChartOutlineIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={"Estimate"}
            title={"Estimates"}
            color={"success"}
            number={totalRecords.EstimateTotal}
            amount={456}
          />
          <FilterCards
            icon={StoreIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={"PurchaseOrder"}
            title={"Purchase Orders"}
            color={"info"}
            number={totalRecords.PoTotal}
            amount={456}
          />
          <FilterCards
            icon={ReceiptIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={"Bill"}
            title={"Bills"}
            color={"success"}
            number={totalRecords.BillTotal}
            amount={456}
          />
           <FilterCards
            icon={FeedOutlinedIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={"Invoice"}
            title={"Invoices"}
            color={"primary"}
            number={totalRecords.InvoiceTotal}
            amount={456}
          />
          <FilterCards
            icon={CategoryOutlinedIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={"Item"}
            title={"Item"}
            color={"info"}
            number={totalRecords.ItemsTotal}
            amount={456}
          />
         
          <FilterCards
            icon={PermIdentityOutlinedIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={"Customer"}
            title={"Customers"}
            color={"success"}
            number={totalRecords.CustomerTotal}
            amount={456}
          />
           <FilterCards
            icon={Person4OutlinedIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={"Vendor"}
            title={"Vendors"}
            color={"primary"}
            number={totalRecords.VendorTotal}
            amount={456}
          />
         
        </div>
      </div>
      {!showBackIcon &&
      <div
      className="text-end"
        style={{ width: "5%", paddingBottom: "2em" }}
        onClick={scrollToEnd}
      >
        <ArrowForwardIosIcon fontSize="large" style={{ cursor: "pointer" }} />
      </div>}
    </div>
  );
};

  


export default CardContainer