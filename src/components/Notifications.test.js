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

import dataTestIdConstants from "../../src/utils/dataTestIdConstants";

import Notifications from "./header/Notifications";

const {
  CURRENT_WEATHER_WRAPPER,
  FORECAST_WRAPPER,
  SEARCH_BAR_WRAPPER,
  TODAYS_OVERVIEW_WRAPPER,
  TOOLTIP_REFERENCE,
} = dataTestIdConstants;

// Set up a mock store
const store = configureStore({
  reducer: {
    [locationWeatherSlice.name]: locationWeatherSlice.reducer,
  },
});

const renderWithProvider = (component) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe("src/component/header/Notifications", () => {
  it("handles notification popover interactions", async () => {
    render(<Notifications />);

    const buttonReference = screen.getByLabelText("Open Notifications");
    const clickButton = createEvent.click(buttonReference);

    // Use act() to handle state updates for clicking the button
    await act(async () => {
      buttonReference.dispatchEvent(clickButton);
    });

    // Use await with findBy queries to wait for asynchronous updates
    expect(
      await screen.findByText("There are no notifications at this time.")
    ).toBeInTheDocument();
    expect(await screen.findByText("No Notifications")).toBeInTheDocument();

    const closeButton = screen.getByLabelText("Close Notifications");
    const clickCloseButton = createEvent.click(closeButton);

    // Use act() to handle state updates for clicking the close button
    await act(async () => {
      closeButton.dispatchEvent(clickCloseButton);
    });

    // Check that the notifications are no longer present
    expect(
      screen.queryByText("There are no notifications at this time.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("No Notifications")).not.toBeInTheDocument();
  });
});
