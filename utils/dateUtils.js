  export function formatDate(dateString) {
    const datePart = dateString.split('T')[0];
    
    // Parse the date
    const date = new Date(datePart);
    
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    function getOrdinalSuffix(day) {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    }
    
    const formattedDate = `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
    // Alternate format: const formattedDate = `${day}${getOrdinalSuffix(day)} of ${month}, ${year}`;
    
    return formattedDate;
  }
  
//module.exports = { formatDate };