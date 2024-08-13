import "./ErrorBanner";
import PropTypes from "prop-types";

import { FaLocationDot, FaArrowRotateRight } from "react-icons/fa6";

import Button from "../common/Button/Button";

function WeatherToolbar(props) {
  const { isRefreshDisabled, isLoading, onReloadWeather, locationMetadata } =
    props;

  const { city, state } =
    locationMetadata?.properties?.relativeLocation?.properties || {};

  const tooltipText = !(city && state)
    ? "There is no location to refresh"
    : "Refresh is allow after 20sec";

  return (
    <>
      <div className="container d-flex flex-wrap justify-content-between">
        <div className="m-2 align-self-center text-start">
          <FaLocationDot />
          <span className="ms-2 me-2">
            {city ? `${city}, ${state}` : "Not Available"}
          </span>
        </div>
        <div className="m-2 align-self-center text-end">
          <Button
            label="Refresh Weather"
            isLoading={isLoading}
            disabled={isRefreshDisabled}
            tooltipText={tooltipText}
            onClick={(event) => {
              event.stopPropagation();
              onReloadWeather();
            }}
            icon={<FaArrowRotateRight />}
          />
        </div>
      </div>
    </>
  );
}

WeatherToolbar.prototype = {
  isLoading: PropTypes.bool,
  isRefreshDisabled: PropTypes.bool,
  locationMetadata: PropTypes.object.isRequired,
  onReloadWeather: PropTypes.func.isRequired,
};

export default WeatherToolbar;
