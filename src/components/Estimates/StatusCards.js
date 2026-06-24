import React, { useState, useRef,useEffect  } from "react";
import SingleCard from "./SingleCard";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import WorkHistoryIcon from "@mui/icons-material/WorkHistoryOutlined";
import CheckBoxIcon from "@mui/icons-material/BeenhereOutlined";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
const StatusCards = ({ setStatusId, estmRecords, statusId }) => {
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
        display : "flex",
        verticalAlign: "center",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "flex-start",
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
           height : "9.5em"
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
          <SingleCard
            icon={PendingActionsIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={4}
            title={"Pending"}
            color={"warning"}
            number={estmRecords.totalNewRecords}
            amount={estmRecords.totalNewRecordsSum}
          />
          <SingleCard
            icon={WorkHistoryIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={6}
            title={"Needs PO"}
            color={"info"}
            number={estmRecords.totalNeedsPOCount}
            amount={estmRecords.totalNeedsPOSum}
          />

          <SingleCard
            icon={CheckBoxIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={1}
            title={"Open Approved"}
            color={"success"}
            // iconColor={"#fff"}
            number={estmRecords.totalApprovedRecords}
            amount={estmRecords.totalApprovedRecordsSum}
          />
          <SingleCard
            icon={PlaylistAddCheckIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={7}
            title={"Ready To Invoice"}
            color={"success"}
            number={estmRecords.totalReadytoInvoiceCount}
            amount={estmRecords.totalReadytoInvoiceSum}
          />
          <SingleCard
            icon={FactCheckIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={2}
            title={"Closed Billed"}
            color={"success"}
            number={estmRecords.totalClosedRecords}
            amount={estmRecords.totalClosedRecordsSum}
          />
          <SingleCard
            icon={CancelPresentationIcon}
            setStatusId={setStatusId}
            statusId={statusId}
            status={5}
            title={"Rejected"}
            color={"danger"}
            number={estmRecords.totalRejectedCount }
            amount={estmRecords.totallRejectedSum}
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

export default StatusCards;
