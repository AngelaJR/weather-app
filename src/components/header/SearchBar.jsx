import PropTypes from "prop-types";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import classNames from "classnames";

import stateConstants from "../../utils/stateConstants";
import dataTestIdConstants from "../../utils/dataTestIdConstants";
const { STATE_MAP } = stateConstants;

function getSateName(stateInput) {
  if (!stateInput) {
    return null;
  }

  let stateName = "";
  if (stateInput.length === 2) {
    stateName = STATE_MAP[stateInput.toUpperCase()];
  }

  if (stateInput.length > 2) {
    stateName = Object.values(STATE_MAP).find((stateKey) => {
      return stateInput.toUpperCase() === stateKey.toUpperCase();
    });
  }

  return stateName;
}

function SearchBar({ onSearchGeolocation }) {
  const [location, setLocation] = useState("");
  const [invalidFeedback, setInvalidFeedback] = useState("");

  function validateForm(event) {
    const { type, key } = event;

    if ((type === "keydown" && key === "Enter") || type === "click") {
      if (!location) {
        setInvalidFeedback("Provide a valid city.");
        return;
      }

      const trimmedValue = location.trim();

      // only allow letter and one comma
      const validFormat = /^([a-zA-Z\s]+)(, ?[a-zA-Z]+)?$/;
      if (!validFormat.test(trimmedValue)) {
        setInvalidFeedback(
          "Invalid format. Valid format: “City” “City, State”."
        );
        return;
      }

      let inputValues = "";
      let stateInputValue = "";
      let cityInputValue = "";
      if (/,/.test(trimmedValue)) {
        inputValues = trimmedValue.split(",");
        // assuming second parameter after the comma is the state
        stateInputValue = inputValues[1].replace(" ", "");
        cityInputValue = inputValues[0];
      } else {
        cityInputValue = trimmedValue;
      }

      // get state
      const stateName = getSateName(stateInputValue);
      if (!stateName && stateInputValue) {
        setInvalidFeedback("Invalid State.");
        return;
      }

      // api format "City, State" || "City"
      const formatLocation = stateName
        ? `${cityInputValue}, ${stateName}`
        : cityInputValue;

      setLocation(formatLocation);
      setInvalidFeedback("");
      onSearchGeolocation(formatLocation.replace(" ", "%20"));
    }
  }

  const inputClassNames = classNames(
    "form-control",
    invalidFeedback && "is-invalid",
    "mr-sm-2"
  );

  return (
    <>
      <div
        data-testid={dataTestIdConstants.SEARCH_BAR_WRAPPER}
        className="input-group"
      >
        <input
          aria-label="Search City, State"
          className={inputClassNames}
          name="search"
          placeholder="Search City, State"
          onKeyDown={(event) => validateForm(event)}
          onChange={(event) => setLocation(event.target.value)}
          value={location}
          type="search"
          aria-describedby="search-location"
        />
        <span
          role="button"
          id="search-location"
          className="input-group-text cursor-pointer"
          onClick={(event) => validateForm(event)}
        >
          <FaSearch />
        </span>
        {invalidFeedback && (
          <div className="invalid-feedback">{invalidFeedback}</div>
        )}
      </div>
    </>
  );
}

SearchBar.prototype = {
  onSearchGeolocation: PropTypes.func.isRequired,
};

export default SearchBar;
