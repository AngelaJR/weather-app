function formatTime(date) {
  const options = { hour: "2-digit", minute: "2-digit" };
  return date.toLocaleTimeString([], options);
}

function formatDay(date) {
  // Sunday - Saturday : 0 - 6
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = date.getDay();
  return weekDays[day];
}

const dateUtils = {
  getUnixToTime: (unixTimestamp) => {
    if (!unixTimestamp) {
      return "";
    }

    const date = new Date(unixTimestamp * 1000);
    return formatTime(date);
  },

  getCurrentDateInfo: () => {
    const today = new Date();

    return {
      date: today,
      time: formatTime(today),
      day: formatDay(today),
    };
  },
};

export default dateUtils;
