
export function formatDateToCustomString(date) {
    if (!date) return ""; 
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return new Date(date).toLocaleDateString("en-US", options).replace(",", "-");
  }
  
  export const formatDate = (dateString) => {
    if (!dateString) return ""; // Handle empty or undefined input
    // Split the dateString to get only the date part
    if (typeof dateString !== "string") {
      const formattedDate = dateString.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    console.log("formattedDate",formattedDate);
     return formattedDate
    }
  };
  
  export function formatDateToInput(value) {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString().split("T")[0];
  }
  export function formatTimeToCustomString(timeString) {
    if (!timeString) return "N/A"; // Handle empty or undefined input

    // Ensure timeString is in a proper format (HH:mm or HH:mm:ss)
    const timeParts = timeString.split(":");
    if (timeParts.length < 2) return "Invalid Time"; // Ensure we have hours and minutes

    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert 0 to 12-hour format
    const formattedMinutes = minutes.toString().padStart(2, "0"); // Ensure two-digit minutes

    return `${hours}:${formattedMinutes} ${ampm}`;
}

