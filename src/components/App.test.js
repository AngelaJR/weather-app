import _ from "lodash";
import axios from "axios";

import {
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { locationWeatherSlice } from "../../src/store/api-slice/locationWeatherSlice";

import currentWeatherRes from "../../src/assets/currentWeatherRes.json";
import forecastColumbiaMdRes from "../../src/assets/forecastColumbiaMdRes.json";
import geolocationColumbiaMdRes from "../../src/assets/geolocationColumbiaMdRes.json";
import locationMetadataColumbiaMdRes from "../../src/assets/locationMetadataColumbiaMdRes.json";

import dataTestIdConstants from "../../src/utils/dataTestIdConstants";

import App from "../../src/components/App";

const {
  CURRENT_WEATHER_WRAPPER,
  FORECAST_WRAPPER,
  SEARCH_BAR_WRAPPER,
  TODAYS_OVERVIEW_WRAPPER,
  TOOLTIP_REFERENCE,
} = dataTestIdConstants;

jest.mock("axios");

const TODAY = "2022-04-23";

// Set up a mock store
const store = configureStore({
  reducer: {
    [locationWeatherSlice.name]: locationWeatherSlice.reducer,
  },
});

const renderWithProvider = (component) => {
  return render(<Provider store={store}>{component}</Provider>);
};

function mockNavigatorGeolocation({ isReject, response } = {}) {
  // Mock geolocation
  global.navigator.geolocation = {
    getCurrentPosition: jest.fn((success, error) => {
      if (isReject) {
        error({ message: "Geolocation Not Enabled" });
      } else {
        success(
          response || { coords: { latitude: 39.2156, longitude: -76.8582 } }
        );
      }
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  };
}

function fireEventKeydown(searchInput, key = "Enter") {
  const keydownEvent = createEvent.keyDown(searchInput, {
    key,
    code: key,
  });

  fireEvent(searchInput, keydownEvent);
}

function expectToHaveFieldsWithValues(container, values) {
  values.forEach((value) => {
    expect(within(container).getByText(value)).toBeInTheDocument();
  });
}

function expectToNotHaveFieldsWithValues(container, values) {
  values.forEach((value) => {
    expect(within(container).queryByText(value)).not.toBeInTheDocument();
  });
}

describe("src/component/App", () => {
  beforeEach(() => {
    mockNavigatorGeolocation();

    jest.useFakeTimers({ advanceTimers: true });
    jest.setSystemTime(new Date(TODAY));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("handle geolocation errors", () => {
    it("show error when geolocation is not supported", async () => {
      global.navigator.geolocation = null;

      renderWithProvider(<App />);

      expect(
        await screen.findByText("Error Loading Weather")
      ).toBeInTheDocument();

      expect(
        await screen.findByText("Error getting current geolocation position.")
      ).toBeInTheDocument();

      expect(
        await screen.findByText("Geolocation is not supported by this browser.")
      ).toBeInTheDocument();

      expect(screen.getByText("No Data Available")).toBeInTheDocument();

      expect(
        screen.getByText(
          "There seems to be some issue obtaining the forecast. Try Again."
        )
      ).toBeInTheDocument();

      expect(screen.getAllByText("Face In Clouds").length).toBe(3);

      const refreshButton = screen.getByRole("button", {
        name: "Refresh Weather",
      });

      // doesn't do anything when default is true
      fireEvent.click(refreshButton);
      expect(axios.get).toHaveBeenCalledTimes(0);
    });

    it("show error when geolocation position is not found", async () => {
      mockNavigatorGeolocation({ isReject: true });

      renderWithProvider(<App />);

      expect(
        await screen.findByText("Geolocation Not Enabled")
      ).toBeInTheDocument();

      expect(
        await screen.findByText("Error getting current geolocation position.")
      ).toBeInTheDocument();

      expect(
        await screen.findByText(
          "Ensure you grant permission to access your location."
        )
      ).toBeInTheDocument();

      expect(screen.getByText("No Data Available")).toBeInTheDocument();

      expect(
        screen.getByText(
          "There seems to be some issue obtaining the forecast. Try Again."
        )
      ).toBeInTheDocument();

      expect(screen.getAllByText("Face In Clouds").length).toBe(3);
    });

    it("show error when there is no coordinates for current location", async () => {
      mockNavigatorGeolocation({ response: {} });

      renderWithProvider(<App />);

      expect(
        await screen.findByText("Error Loading Weather")
      ).toBeInTheDocument();

      expect(
        await screen.findByText("Coordinates are not valid.")
      ).toBeInTheDocument();

      expect(
        await screen.findByText("Try again or search for a new City.")
      ).toBeInTheDocument();

      expect(screen.getByText("No Data Available")).toBeInTheDocument();

      expect(
        screen.getByText(
          "There seems to be some issue obtaining the forecast. Try Again."
        )
      ).toBeInTheDocument();

      expect(screen.getAllByText("Face In Clouds").length).toBe(3);
    });
  });

  describe("loads data based on user current location", () => {
    it("show data based on current location", async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes("forecast")) {
          return Promise.resolve({ data: forecastColumbiaMdRes });
        }

        if (url.includes("points")) {
          return Promise.resolve({ data: locationMetadataColumbiaMdRes });
        }

        if (url.includes("openweathermap")) {
          return Promise.resolve({ data: currentWeatherRes });
        }
      });

      renderWithProvider(<App />);

      expect(await screen.findByText("Columbia, MD")).toBeInTheDocument();

      jest.advanceTimersByTime(1000);

      // current data
      const currentWeatherWrapper = await screen.findByTestId(
        CURRENT_WEATHER_WRAPPER
      );

      expectToHaveFieldsWithValues(currentWeatherWrapper, [
        "Friday",
        "08:00 PM",
        "Sunrise",
        "06:19 AM",
        "Sunset",
        "08:05 PM",
        /63.37/,
        "Real Feel",
        /63.32/,
        "Wind N",
        "1.99MPH",
        "Pressure",
        "1017MB",
        "Humidity",
        "83%",
        "Clouds",
      ]);

      expect(
        within(currentWeatherWrapper).queryByText("Face In Clouds")
      ).not.toBeInTheDocument();

      // forecast data
      const forecastWrapper = screen.getByTestId(FORECAST_WRAPPER);

      expectToHaveFieldsWithValues(forecastWrapper, [
        "SAT",
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THU",
        /88/,
        /86/,
      ]);

      expect(within(forecastWrapper).getAllByText(/87/).length).toBe(2);
      expect(within(forecastWrapper).getAllByText(/85/).length).toBe(2);

      expect(within(forecastWrapper).getAllByText("Sunny").length).toBe(2);

      expect(
        within(forecastWrapper).getAllByText("Cloud With Lightning And Rain")
          .length
      ).toBe(4);

      // overview data
      const overviewWrapper = screen.getByTestId(TODAYS_OVERVIEW_WRAPPER);

      expectToHaveFieldsWithValues(overviewWrapper, [
        "Wind Status",
        "UV Index",
        "Humidity",
        "Visibility",
        "--",
        /83/,
        /10000/,
        /1.99/,
      ]);
    });

    it("show no data based on current location", async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes("forecast")) {
          return Promise.resolve({ data: {} });
        }

        if (url.includes("points")) {
          return Promise.resolve({ data: {} });
        }

        if (url.includes("openweathermap")) {
          return Promise.resolve({ data: {} });
        }
      });

      renderWithProvider(<App />);

      expect(await screen.findByText("Not Available")).toBeInTheDocument();

      jest.advanceTimersByTime(1000);

      // current data
      const currentWeatherWrapper = screen.getByTestId(CURRENT_WEATHER_WRAPPER);

      expectToHaveFieldsWithValues(currentWeatherWrapper, [
        "Friday",
        "08:00 PM",
        "Sunrise",
        "Sunset",
        "Real Feel",
        "Wind",
        "Pressure",
        "Humidity",
        "Face In Clouds",
      ]);

      expectToNotHaveFieldsWithValues(currentWeatherWrapper, [
        "06:19 AM",
        "08:05 PM",
        /63.37/,
        /63.32/,
        "1.99MPH",
        "1017MB",
        "83%",
        "Clouds",
      ]);

      // forecast data
      const forecastWrapper = screen.getByTestId(FORECAST_WRAPPER);

      expectToHaveFieldsWithValues(forecastWrapper, [
        "No Data Available",
        "There seems to be some issue obtaining the forecast. Try Again.",
      ]);

      expectToNotHaveFieldsWithValues(forecastWrapper, [
        "SAT",
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THU",
        /88/,
        /86/,
        /87/,
        /85/,
        "Sunny",
        "Cloud With Lightning And Rain",
      ]);

      // overview data
      const overviewWrapper = screen.getByTestId(TODAYS_OVERVIEW_WRAPPER);

      expectToHaveFieldsWithValues(overviewWrapper, [
        "Wind Status",
        "UV Index",
        "Humidity",
        "Visibility",
      ]);

      expectToNotHaveFieldsWithValues(overviewWrapper, [/83/, /10000/, /1.99/]);
    });

    describe("handle weather location errors", () => {
      it("show no data if there was an issue with the request", async () => {
        axios.get.mockImplementation((url) => {
          if (url.includes("forecast")) {
            return Promise.resolve({ data: forecastColumbiaMdRes });
          }

          if (url.includes("points")) {
            return Promise.reject({
              message: { message: "Error getting data from the api" },
            });
          }

          if (url.includes("openweathermap")) {
            return Promise.resolve({ data: currentWeatherRes });
          }
        });

        renderWithProvider(<App />);

        jest.advanceTimersByTime(1000);

        expect(
          await screen.findByText("Error Loading Weather")
        ).toBeInTheDocument();

        expect(await screen.findByText("Server Error:")).toBeInTheDocument();

        expect(
          await screen.findByText("Error getting data from the api")
        ).toBeInTheDocument();

        expect(await screen.findByText("Not Available")).toBeInTheDocument();

        // current data
        const currentWeatherWrapper = screen.getByTestId(
          CURRENT_WEATHER_WRAPPER
        );

        expectToHaveFieldsWithValues(currentWeatherWrapper, [
          "Friday",
          "08:00 PM",
          "Sunrise",
          "Sunset",
          "Real Feel",
          "Wind",
          "Pressure",
          "Humidity",
          "Face In Clouds",
        ]);

        expectToNotHaveFieldsWithValues(currentWeatherWrapper, [
          "06:19 AM",
          "08:05 PM",
          /63.37/,
          /63.32/,
          "1.99MPH",
          "1017MB",
          "83%",
          "Clouds",
        ]);

        // forecast data
        const forecastWrapper = screen.getByTestId(FORECAST_WRAPPER);

        expectToHaveFieldsWithValues(forecastWrapper, [
          "No Data Available",
          "There seems to be some issue obtaining the forecast. Try Again.",
        ]);

        expectToNotHaveFieldsWithValues(forecastWrapper, [
          "SAT",
          "SUN",
          "MON",
          "TUE",
          "WED",
          "THU",
          /88/,
          /86/,
          /87/,
          /85/,
          "Sunny",
          "Cloud With Lightning And Rain",
        ]);

        // overview data
        const overviewWrapper = screen.getByTestId(TODAYS_OVERVIEW_WRAPPER);

        expectToHaveFieldsWithValues(overviewWrapper, [
          "Wind Status",
          "UV Index",
          "Humidity",
          "Visibility",
        ]);

        expectToNotHaveFieldsWithValues(overviewWrapper, [
          /83/,
          /10000/,
          /1.99/,
        ]);
      });

      it("show no data if the api failed", async () => {
        axios.get.mockImplementation((url) => {
          if (url.includes("forecast")) {
            return Promise.resolve({ data: forecastColumbiaMdRes });
          }

          if (url.includes("points")) {
            return Promise.reject({
              response: {
                data: {
                  title: "Error with api key",
                  message: "Error getting data from the api",
                },
              },
            });
          }

          if (url.includes("openweathermap")) {
            return Promise.resolve({ data: currentWeatherRes });
          }
        });

        renderWithProvider(<App />);

        expect(
          await screen.findByText("Error With Api Key")
        ).toBeInTheDocument();
        expect(await screen.findByText("Server Error:")).toBeInTheDocument();
        expect(
          await screen.findByText("Error getting data from the api")
        ).toBeInTheDocument();

        expect(await screen.findByText("Not Available")).toBeInTheDocument();

        // current data
        const currentWeatherWrapper = screen.getByTestId(
          CURRENT_WEATHER_WRAPPER
        );

        expectToHaveFieldsWithValues(currentWeatherWrapper, [
          "Friday",
          "08:00 PM",
          "Sunrise",
          "Sunset",
          "Real Feel",
          "Wind",
          "Pressure",
          "Humidity",
          "Face In Clouds",
        ]);

        expectToNotHaveFieldsWithValues(currentWeatherWrapper, [
          "06:19 AM",
          "08:05 PM",
          /63.37/,
          /63.32/,
          "1.99MPH",
          "1017MB",
          "83%",
          "Clouds",
        ]);

        // forecast data
        const forecastWrapper = screen.getByTestId(FORECAST_WRAPPER);

        expectToHaveFieldsWithValues(forecastWrapper, [
          "No Data Available",
          "There seems to be some issue obtaining the forecast. Try Again.",
        ]);

        expectToNotHaveFieldsWithValues(forecastWrapper, [
          "SAT",
          "SUN",
          "MON",
          "TUE",
          "WED",
          "THU",
          /88/,
          /86/,
          /87/,
          /85/,
          "Sunny",
          "Cloud With Lightning And Rain",
        ]);

        // overview data
        const overviewWrapper = screen.getByTestId(TODAYS_OVERVIEW_WRAPPER);

        expectToHaveFieldsWithValues(overviewWrapper, [
          "Wind Status",
          "UV Index",
          "Humidity",
          "Visibility",
        ]);

        expectToNotHaveFieldsWithValues(overviewWrapper, [
          /83/,
          /10000/,
          /1.99/,
        ]);
      });
    });
  });

  describe("loads location data based on search", () => {
    it("searches for location weather based on user input - City and State", async () => {
      mockNavigatorGeolocation({ isReject: true });

      renderWithProvider(<App />);

      expect(
        await screen.findByText(
          "Ensure you grant permission to access your location."
        )
      ).toBeInTheDocument();

      const searchInput = screen.getByLabelText("Search City, State");
      let searchValue = "Columbia, MD";
      fireEvent.change(searchInput, { target: { value: searchValue } });

      axios.get.mockImplementation((url) => {
        if (url.includes("openweathermap") && url.includes("direct")) {
          return Promise.resolve({ data: geolocationColumbiaMdRes });
        }

        if (url.includes("forecast")) {
          return Promise.resolve({ data: forecastColumbiaMdRes });
        }

        if (url.includes("points")) {
          return Promise.resolve({ data: locationMetadataColumbiaMdRes });
        }

        if (url.includes("openweathermap") && url.includes("weather")) {
          return Promise.resolve({ data: currentWeatherRes });
        }
      });

      // Use act to handle the click event and subsequent state updates
      act(() => {
        fireEventKeydown(searchInput);
      });

      // Check if the flag is true (element should be in the DOM)
      const refreshButton = screen.getByRole("button", {
        name: "Refresh Weather",
      });
      expect(refreshButton.getAttribute("aria-disabled")).toEqual("true");

      expect(await screen.findByText("Columbia, MD")).toBeInTheDocument();

      // current data
      const currentWeatherWrapper = screen.getByTestId(CURRENT_WEATHER_WRAPPER);

      expectToHaveFieldsWithValues(currentWeatherWrapper, [
        "Friday",
        "08:00 PM",
        "Sunrise",
        "06:19 AM",
        "Sunset",
        "08:05 PM",
        /63.37/,
        "Real Feel",
        /63.32/,
        "Wind N",
        "1.99MPH",
        "Pressure",
        "1017MB",
        "Humidity",
        "83%",
        "Clouds",
      ]);

      expect(
        within(currentWeatherWrapper).queryByText("Face In Clouds")
      ).not.toBeInTheDocument();

      // forecast data
      const forecastWrapper = screen.getByTestId(FORECAST_WRAPPER);

      expectToHaveFieldsWithValues(forecastWrapper, [
        "SAT",
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THU",
        /88/,
        /86/,
      ]);

      expect(within(forecastWrapper).getAllByText(/87/).length).toBe(2);
      expect(within(forecastWrapper).getAllByText(/85/).length).toBe(2);

      expect(within(forecastWrapper).getAllByText("Sunny").length).toBe(2);

      expect(
        within(forecastWrapper).getAllByText("Cloud With Lightning And Rain")
          .length
      ).toBe(4);

      // overview data
      const overviewWrapper = screen.getByTestId(TODAYS_OVERVIEW_WRAPPER);

      expectToHaveFieldsWithValues(overviewWrapper, [
        "Wind Status",
        "UV Index",
        "Humidity",
        "Visibility",
        "--",
        /83/,
        /10000/,
        /1.99/,
      ]);

      const tooltipReference = screen.getByTestId(TOOLTIP_REFERENCE);
      const mouseOverEvent = createEvent.mouseOver(tooltipReference);
      const mouseOutEvent = createEvent.mouseOut(tooltipReference);

      const buttonRefresh = screen.getByText(/Refresh Weather/i);
      act(() => {
        buttonRefresh.dispatchEvent(mouseOverEvent);
      });

      expect(
        screen.getByText(/Refresh is allow after 20sec/)
      ).toBeInTheDocument();

      act(() => {
        buttonRefresh.dispatchEvent(mouseOutEvent);
      });

      expect(
        screen.queryByText(/Refresh is allow after 20sec/)
      ).not.toBeInTheDocument();

      // reset timer to set refresh back to false
      act(() => {
        jest.advanceTimersByTime(20000);
      });

      act(() => {
        buttonRefresh.dispatchEvent(mouseOverEvent);
      });

      expect(
        screen.queryByText(/Refresh is allow after 20sec/)
      ).not.toBeInTheDocument();

      await waitFor(() => {
        const refreshButton = screen.getByRole("button", {
          name: "Refresh Weather",
        });

        expect(refreshButton.getAttribute("aria-disabled")).toEqual("false");
      });
    });

    it("searches for location weather based on user input - City", async () => {
      mockNavigatorGeolocation({ isReject: true });

      renderWithProvider(<App />);

      expect(
        await screen.findByText(
          "Ensure you grant permission to access your location."
        )
      ).toBeInTheDocument();

      const searchInput = screen.getByLabelText("Search City, State");
      let searchValue = "Columbia";
      fireEvent.change(searchInput, { target: { value: searchValue } });

      axios.get.mockImplementation((url) => {
        if (url.includes("openweathermap") && url.includes("direct")) {
          return Promise.resolve({ data: geolocationColumbiaMdRes });
        }

        if (url.includes("forecast")) {
          return Promise.resolve({ data: forecastColumbiaMdRes });
        }

        if (url.includes("points")) {
          return Promise.resolve({ data: locationMetadataColumbiaMdRes });
        }

        if (url.includes("openweathermap") && url.includes("weather")) {
          return Promise.resolve({ data: currentWeatherRes });
        }
      });

      // Use act to handle the click event and subsequent state updates
      act(() => {
        fireEventKeydown(searchInput);
      });

      // Check if the flag is true (element should be in the DOM)
      const refreshButton = screen.getByRole("button", {
        name: "Refresh Weather",
      });
      expect(refreshButton.getAttribute("aria-disabled")).toEqual("true");

      expect(await screen.findByText("Columbia, MD")).toBeInTheDocument();

      // current data
      const currentWeatherWrapper = screen.getByTestId(CURRENT_WEATHER_WRAPPER);

      expectToHaveFieldsWithValues(currentWeatherWrapper, [
        "Friday",
        "08:00 PM",
        "Sunrise",
        "06:19 AM",
        "Sunset",
        "08:05 PM",
        /63.37/,
        "Real Feel",
        /63.32/,
        "Wind N",
        "1.99MPH",
        "Pressure",
        "1017MB",
        "Humidity",
        "83%",
        "Clouds",
      ]);

      expect(
        within(currentWeatherWrapper).queryByText("Face In Clouds")
      ).not.toBeInTheDocument();

      // forecast data
      const forecastWrapper = screen.getByTestId(FORECAST_WRAPPER);

      expectToHaveFieldsWithValues(forecastWrapper, [
        "SAT",
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THU",
        /88/,
        /86/,
      ]);

      expect(within(forecastWrapper).getAllByText(/87/).length).toBe(2);
      expect(within(forecastWrapper).getAllByText(/85/).length).toBe(2);

      expect(within(forecastWrapper).getAllByText("Sunny").length).toBe(2);

      expect(
        within(forecastWrapper).getAllByText("Cloud With Lightning And Rain")
          .length
      ).toBe(4);

      // overview data
      const overviewWrapper = screen.getByTestId(TODAYS_OVERVIEW_WRAPPER);

      expectToHaveFieldsWithValues(overviewWrapper, [
        "Wind Status",
        "UV Index",
        "Humidity",
        "Visibility",
        "--",
        /83/,
        /10000/,
        /1.99/,
      ]);

      const tooltipReference = screen.getByTestId(TOOLTIP_REFERENCE);
      const mouseOverEvent = createEvent.mouseOver(tooltipReference);
      const mouseOutEvent = createEvent.mouseOut(tooltipReference);

      const buttonRefresh = screen.getByText(/Refresh Weather/i);
      act(() => {
        buttonRefresh.dispatchEvent(mouseOverEvent);
      });

      expect(
        screen.getByText(/Refresh is allow after 20sec/)
      ).toBeInTheDocument();

      act(() => {
        buttonRefresh.dispatchEvent(mouseOutEvent);
      });

      expect(
        screen.queryByText(/Refresh is allow after 20sec/)
      ).not.toBeInTheDocument();

      // reset timer to set refresh back to false
      act(() => {
        jest.advanceTimersByTime(20000);
      });

      act(() => {
        buttonRefresh.dispatchEvent(mouseOverEvent);
      });

      expect(
        screen.queryByText(/Refresh is allow after 20sec/)
      ).not.toBeInTheDocument();

      await waitFor(() => {
        const refreshButton = screen.getByRole("button", {
          name: "Refresh Weather",
        });

        expect(refreshButton.getAttribute("aria-disabled")).toEqual("false");
      });
    });

    describe("handles error when searching for a location", () => {
      it("handles search validation", async () => {
        global.navigator.geolocation = null;

        renderWithProvider(<App />);

        expect(
          await screen.findByText("Error Loading Weather")
        ).toBeInTheDocument();

        const searchInput = screen.getByLabelText("Search City, State");
        expect(searchInput.value).toBe("");

        // no error validation on any other key that's not Enter
        fireEventKeydown(searchInput, "a");
        expect(screen.queryByText(/Invalid format/)).not.toBeInTheDocument();
        expect(
          screen.queryByText(/Provide a valid city/)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/Invalid State/)).not.toBeInTheDocument();

        // no value
        fireEventKeydown(searchInput);
        expect(screen.getByText(/Provide a valid city/)).toBeInTheDocument();

        // invalid format
        let searchValue = "sdsadf,asdf,";
        fireEvent.change(searchInput, { target: { value: searchValue } });
        expect(searchInput.value).toBe(searchValue);

        fireEventKeydown(searchInput);
        expect(screen.getByText(/Invalid format/)).toBeInTheDocument();

        // invalid format space in between
        searchValue = "Mongomery PA";
        fireEvent.change(searchInput, { target: { value: searchValue } });
        expect(searchInput.value).toBe(searchValue);

        // check with the submit button
        const searchInputButton = within(
          screen.getByTestId(SEARCH_BAR_WRAPPER)
        ).getByRole("button");

        // invalid state abbreviation
        searchValue = "Mongomery,Pg";
        fireEvent.change(searchInput, { target: { value: searchValue } });
        expect(searchInput.value).toBe(searchValue);

        fireEvent.click(searchInputButton);
        expect(screen.getByText(/Invalid State/)).toBeInTheDocument();

        // invalid state name
        searchValue = "Mongomery,Marylend";
        fireEvent.change(searchInput, { target: { value: searchValue } });
        expect(searchInput.value).toBe(searchValue);

        fireEvent.click(searchInputButton);
        expect(screen.getByText(/Invalid State/)).toBeInTheDocument();
      });

      it("sets error if api fails to get geolocation", async () => {
        mockNavigatorGeolocation({ isReject: true });

        renderWithProvider(<App />);

        // fist check data is not loaded due to geo location
        expect(
          await screen.findByText(
            "Ensure you grant permission to access your location."
          )
        ).toBeInTheDocument();

        const searchInput = screen.getByLabelText("Search City, State");
        let searchValue = "Columbia, MD";
        fireEvent.change(searchInput, { target: { value: searchValue } });

        const tooltipReference = screen.getByTestId(TOOLTIP_REFERENCE);
        const mouseOverEvent = createEvent.mouseOver(tooltipReference);
        const mouseOutEvent = createEvent.mouseOut(tooltipReference);

        act(() => {
          screen.getByText(/Refresh Weather/i).dispatchEvent(mouseOverEvent);
        });

        expect(
          screen.getByText(/There is no location to refresh/)
        ).toBeInTheDocument();

        act(() => {
          screen.getByText(/Refresh Weather/i).dispatchEvent(mouseOutEvent);
        });

        expect(
          screen.queryByText(/There is no location to refresh/)
        ).not.toBeInTheDocument();

        axios.get.mockImplementation((url) => {
          if (url.includes("openweathermap") && url.includes("direct")) {
            return Promise.reject({
              message: { message: "Error getting data from the api" },
            });
          }
        });

        // Use act to handle the click event and subsequent state updates
        act(() => {
          fireEventKeydown(searchInput);
        });

        expect(
          await screen.findByText(
            "Not able to get location for Columbia,%20Maryland."
          )
        ).toBeInTheDocument();

        expect(
          await screen.findByText(/Not able to get location/)
        ).toBeInTheDocument();

        expect(
          await screen.findByText(/Error getting data from the api/)
        ).toBeInTheDocument();

        // reset timer to set refresh back to false
        act(() => {
          jest.advanceTimersByTime(20000);
        });

        await waitFor(() => {
          const refreshButton = screen.getByRole("button", {
            name: "Refresh Weather",
          });

          expect(refreshButton.getAttribute("aria-disabled")).toEqual("true");
        });
      });

      it("sets error if there is no valid coordinates", async () => {
        mockNavigatorGeolocation({ isReject: true });

        renderWithProvider(<App />);

        // fist check data is not loaded due to geo location
        expect(
          await screen.findByText(
            "Ensure you grant permission to access your location."
          )
        ).toBeInTheDocument();

        const searchInput = screen.getByLabelText("Search City, State");
        let searchValue = "Columbia, MD";
        fireEvent.change(searchInput, { target: { value: searchValue } });

        const tooltipReference = screen.getByTestId(TOOLTIP_REFERENCE);
        const mouseOverEvent = createEvent.mouseOver(tooltipReference);
        const mouseOutEvent = createEvent.mouseOut(tooltipReference);

        act(() => {
          screen.getByText(/Refresh Weather/i).dispatchEvent(mouseOverEvent);
        });

        expect(
          screen.getByText(/There is no location to refresh/)
        ).toBeInTheDocument();

        act(() => {
          screen.getByText(/Refresh Weather/i).dispatchEvent(mouseOutEvent);
        });

        expect(
          screen.queryByText(/There is no location to refresh/)
        ).not.toBeInTheDocument();

        axios.get.mockImplementation((url) => {
          if (url.includes("openweathermap") && url.includes("direct")) {
            return Promise.resolve({ data: [] });
          }
        });

        // Use act to handle the click event and subsequent state updates
        act(() => {
          fireEventKeydown(searchInput);
        });

        expect(
          await screen.findByText("Error Loading Weather")
        ).toBeInTheDocument();

        expect(
          await screen.findByText("Coordinates are not valid.")
        ).toBeInTheDocument();

        expect(
          await screen.findByText("Try again or search for a new City.")
        ).toBeInTheDocument();

        expect(screen.getByText("No Data Available")).toBeInTheDocument();

        expect(
          screen.getByText(
            "There seems to be some issue obtaining the forecast. Try Again."
          )
        ).toBeInTheDocument();

        expect(screen.getAllByText("Face In Clouds").length).toBe(3);

        // reset timer to set refresh back to false
        act(() => {
          jest.advanceTimersByTime(20000);
        });

        const refreshButton = screen.getByRole("button", {
          name: "Refresh Weather",
        });

        await waitFor(() => {
          expect(refreshButton.getAttribute("aria-disabled")).toEqual("true");
        });
      });
    });
  });

  describe("refresh location data", () => {
    it("refreshes location data", async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes("forecast")) {
          return Promise.resolve({ data: forecastColumbiaMdRes });
        }

        if (url.includes("points")) {
          return Promise.resolve({ data: locationMetadataColumbiaMdRes });
        }

        if (url.includes("openweathermap")) {
          return Promise.resolve({ data: currentWeatherRes });
        }
      });

      renderWithProvider(<App />);

      expect(await screen.findByText("Columbia, MD")).toBeInTheDocument();

      let currentWeatherWrapper = await screen.findByTestId(
        CURRENT_WEATHER_WRAPPER
      );

      expectToHaveFieldsWithValues(currentWeatherWrapper, [
        "Friday",
        "08:00 PM",
        "Sunrise",
        "06:19 AM",
        "Sunset",
        "08:05 PM",
        /63.37/,
        "Real Feel",
        /63.32/,
        "Wind N",
        "1.99MPH",
        "Pressure",
        "1017MB",
        "Humidity",
        "83%",
        "Clouds",
      ]);

      act(() => {
        jest.advanceTimersByTime(20000);
      });

      // Check if the flag is true (element should be in the DOM)
      const refreshButton = await screen.findByRole("button", {
        name: "Refresh Weather",
      });

      expect(refreshButton.getAttribute("aria-disabled")).toEqual("false");

      axios.get.mockImplementation((url) => {
        if (url.includes("forecast")) {
          return Promise.resolve({ data: forecastColumbiaMdRes });
        }

        if (url.includes("points")) {
          const newLocationMetadataColumbiaMdRes = _.cloneDeep(
            locationMetadataColumbiaMdRes
          );
          newLocationMetadataColumbiaMdRes.properties.relativeLocation.properties =
            {
              city: "Columbia",
              state: "NC",
              distance: {
                unitCode: "wmoUnit:m",
                value: 1608.8814395500999,
              },
              bearing: {
                unitCode: "wmoUnit:degree_(angle)",
                value: 2,
              },
            };
          return Promise.resolve({
            data: newLocationMetadataColumbiaMdRes,
          });
        }

        if (url.includes("openweathermap")) {
          return Promise.resolve({
            data: {
              ...currentWeatherRes,
              wind: { speed: 0, deg: 355, gust: 5.01 },
            },
          });
        }
      });

      const clickButton = createEvent.click(refreshButton);

      // Use act to handle the click event and subsequent state updates
      act(() => {
        refreshButton.dispatchEvent(clickButton);
      });

      await waitFor(() => {
        const refreshButton = screen.getByRole("button", {
          name: "Refresh Weather",
        });

        expect(refreshButton.getAttribute("aria-disabled")).toEqual("true");
      });

      expect(await screen.findByText("Columbia, NC")).toBeInTheDocument();

      currentWeatherWrapper = await screen.findByTestId(
        CURRENT_WEATHER_WRAPPER
      );

      expectToHaveFieldsWithValues(currentWeatherWrapper, ["0MPH"]);

      act(() => {
        jest.advanceTimersByTime(20000);
      });

      await waitFor(() => {
        const refreshButton = screen.getByRole("button", {
          name: "Refresh Weather",
        });

        expect(refreshButton.getAttribute("aria-disabled")).toEqual("false");
      });
    });
  });
});
