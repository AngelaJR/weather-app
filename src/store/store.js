import { configureStore } from "@reduxjs/toolkit";

import { locationWeatherSlice } from "./api-slice/locationWeatherSlice";
import { geolocationSlice } from "./api-slice/geolocationSlice";

export const store = configureStore({
  reducer: {
    [locationWeatherSlice.name]: locationWeatherSlice.reducer,
    [geolocationSlice.name]: geolocationSlice.reducer,
  },
});
