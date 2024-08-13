import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_OPEN_WEATHER_MAP_URL =
  "https://api.openweathermap.org/geo/1.0/direct";

export const fetchGeolocationData = createAsyncThunk(
  "geolocation/fetchGeolocationData",
  async (location, { rejectWithValue }) => {
    try {
      const geolocationData = await axios.get(
        `${API_OPEN_WEATHER_MAP_URL}?q=${location},US&limit=1&appid=${process.env.REACT_APP_LOCATION_WEATHER_API_KEY}`
      );

      return geolocationData.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

export const geolocationSlice = createSlice({
  name: "geolocation",
  initialState: {
    error: null,
    geolocationData: {},
    isError: false,
    isLoading: false,
    status: "idle",
  },
  reducers: {
    resetGeolocation: (state) => {
      state.error = null;
      state.geolocationData = {};
      state.isError = false;
      state.isLoading = false;
      state.status = "idle";
    },
  },
});

export const { resetGeolocation } = geolocationSlice.actions;
export default geolocationSlice.reducer;
