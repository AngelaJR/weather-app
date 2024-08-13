import { useEffect, useReducer, useState } from "react";
import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchWeather,
  resetLocation,
} from "../../store/api-slice/locationWeatherSlice";
import { fetchGeolocationData } from "../../store/api-slice/geolocationSlice";

import WeatherToolbar from "./WeatherToolbar";
import WeatherDetails from "./WeatherDetails";
import ErrorBanner from "./ErrorBanner";
import TodaysOverview from "./TodaysOverview";
import Header from "../header/Header";

const GEOLOCATION_LOCATION_OBTAINED = "GEOLOCATION_LOCATION_OBTAINED";
const REFRESH_TIME_OUT = 20000;

const initialGeolocationState = {
  position: {},
  errorInfo: {},
  additionalInfo: "",
  isError: false,
};

function geolocationReducer(state, action) {
  switch (action.type) {
    case GEOLOCATION_LOCATION_OBTAINED:
      return {
        ...state,
        position: action.position,
        isError: false,
        errorInfo: {},
      };
    default:
      return {
        position: {},
        errorInfo: action.errorInfo,
        isError: true,
      };
  }
}

function Weather() {
  const dispatch = useDispatch();
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);
  const [geolocationCoordinates, dispatchGeolocationPosition] = useReducer(
    geolocationReducer,
    initialGeolocationState
  );

  const {
    currentWeatherData,
    locationMetadata,
    forecastWeatherData,
    error,
    isError,
    isLoading,
    status,
  } = useSelector((state) => state.locationWeather);

  const { lon: geolocationLon, lat: geolocationLat } =
    geolocationCoordinates.position;
  const hasErrors = isError || geolocationCoordinates.isError;
  const errorInfo = { ...geolocationCoordinates.errorInfo, ...error, status };

  function loadWeather({ lon, lat }) {
    if (lon && lat) {
      dispatch(fetchWeather({ lon, lat }));
    } else {
      dispatchGeolocationPosition({
        errorInfo: {
          message: `Coordinates are not valid.`,
          additionalInfo: `Try again or search for a new City.`,
        },
      });

      dispatch(resetLocation());
    }
  }

  function onReloadWeather() {
    setIsRefreshDisabled(true);
    const { lon, lat } = geolocationCoordinates.position;
    loadWeather({ lon, lat });
  }

  function onSearchGeolocation(location) {
    setIsRefreshDisabled(true);

    // get geolocation
    dispatch(fetchGeolocationData(location))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        // getting the first one from the array as too assume
        // is the most relevant location.
        const { lon, lat } = originalPromiseResult?.[0] || {};
        dispatchGeolocationPosition({
          type: GEOLOCATION_LOCATION_OBTAINED,
          position: {
            lon,
            lat,
          },
        });

        loadWeather({ lon, lat });
      })
      .catch((rejectedValueOrSerializedError) => {
        dispatchGeolocationPosition({
          errorInfo: {
            additionalInfo: `Not able to get location for ${location}.`,
            ...rejectedValueOrSerializedError,
          },
        });

        dispatch(resetLocation());
      });
  }

  useEffect(() => {
    if (isRefreshDisabled) {
      const timer = setTimeout(
        () => setIsRefreshDisabled(false),
        REFRESH_TIME_OUT
      );
      return () => clearTimeout(timer);
    }
  }, [isRefreshDisabled]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position?.coords || {};
          loadWeather({ lon, lat });

          if (lat && lon) {
            dispatchGeolocationPosition({
              type: GEOLOCATION_LOCATION_OBTAINED,
              position: {
                lat,
                lon,
              },
            });
          }
        },
        (error) => {
          dispatchGeolocationPosition({
            errorInfo: {
              label: error.message,
              message: "Error getting current geolocation position.",
              additionalInfo:
                "Ensure you grant permission to access your location.",
            },
          });
          dispatch(resetLocation());
        }
      );
    } else {
      dispatchGeolocationPosition({
        errorInfo: {
          message: "Error getting current geolocation position.",
          additionalInfo: "Geolocation is not supported by this browser.",
        },
      });
      dispatch(resetLocation());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header
        onSearchGeolocation={(location) => onSearchGeolocation(location)}
      />
      <ErrorBanner errorInfo={errorInfo} hasErrors={hasErrors} />
      <WeatherToolbar
        isLoading={isLoading}
        isRefreshDisabled={
          isRefreshDisabled || !(geolocationLon && geolocationLat)
        }
        onReloadWeather={() => onReloadWeather()}
        locationMetadata={locationMetadata}
      />
      <WeatherDetails
        isLoading={isLoading}
        forecastData={forecastWeatherData}
        currentWeatherData={currentWeatherData}
      />
      <TodaysOverview currentWeatherData={currentWeatherData} />
    </>
  );
}

export default Weather;
