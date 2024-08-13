import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_WEATHER_URL = "https://api.weather.gov";
const API_OPEN_WEATHER_MAP_URL =
  "https://api.openweathermap.org/data/2.5/weather";

export const fetchWeather = createAsyncThunk(
  "locationWeather/fetchWeather",
  async ({ lat, lon }, { rejectWithValue }) => {
    try {
      const [locationMetadataResult, currentWeatherDataResponse] =
        await Promise.all([
          axios.get(`${API_WEATHER_URL}/points/${lat},${lon}`),
          axios.get(
            `${API_OPEN_WEATHER_MAP_URL}?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_LOCATION_WEATHER_API_KEY}&units=imperial`
          ),
        ]);

      // get location data based on the lat/lon grid points
      const { gridX, gridY } = locationMetadataResult.data?.properties || {};

      let forecastDataResponse = { data: {} };
      if (gridX && gridY) {
        forecastDataResponse = await axios.get(
          `${API_WEATHER_URL}/gridpoints/LWX/${gridX},${gridY}/forecast`
        );
      }

      return {
        locationMetadata: locationMetadataResult.data,
        forecastWeatherData: forecastDataResponse.data,
        currentWeatherData: currentWeatherDataResponse.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

export const locationWeatherSlice = createSlice({
  name: "locationWeather",
  initialState: {
    error: null,
    currentWeatherData: {},
    locationMetadata: {},
    forecastWeatherData: {},
    isError: false,
    isLoading: true,
    status: "idle",
  },
  reducers: {
    resetLocation: (state) => {
      state.error = null;
      state.currentWeatherData = {};
      state.locationMetadata = {};
      state.forecastWeatherData = {};
      state.isError = false;
      state.isLoading = false;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.status = "loading";
        state.isLoading = true;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.forecastWeatherData = action.payload.forecastWeatherData;
        state.locationMetadata = action.payload.locationMetadata;
        state.currentWeatherData = action.payload.currentWeatherData;
        // reset state
        state.isLoading = false;
        state.error = null;
        state.isError = false;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isError = true;
        // reset state
        state.isLoading = false;
        state.currentWeatherData = {};
        state.locationMetadata = {};
        state.forecastWeatherData = {};
      });
  },
});

export const { resetLocation } = locationWeatherSlice.actions;
export default locationWeatherSlice.reducer;
