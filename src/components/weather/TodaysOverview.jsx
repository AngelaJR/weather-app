import "../../styles/todaysOverview.css";

import _ from "lodash";

import PropTypes from "prop-types";

import WeatherIcon from "../common/WeatherIcon/WeatherIcon";
import dataTestIdConstants from "../../utils/dataTestIdConstants";

function getDisplayValue(value) {
  // show data when value is 0
  const stringValue = value?.toString();
  return stringValue || "--";
}

function renderDetails({ value, units }) {
  const displayValue = getDisplayValue(value);
  return (
    <span className="d-block">
      <strong>{displayValue}</strong>
      {displayValue !== "--" && units ? ` ${units}` : null}
    </span>
  );
}

function renderOverviewCard(overviewInfo) {
  const { label, value, units, imageDescription } = overviewInfo;

  const key = _.kebabCase(label);
  return (
    <div key={key} className="overview-item m-2 col shadow">
      <div className="text-start p-2 pb-4 pt-4">{label}</div>
      <div className="text-center p-2 pb-4">
        <WeatherIcon
          size={WeatherIcon.SIZE.LARGE}
          componentId={`${key}-icon`}
          description={imageDescription}
        />
      </div>
      <div className="p-2 pb-4">{renderDetails({ value, units })}</div>
    </div>
  );
}

function renderOverviewCards(currentWeatherData) {
  const { visibility, main = {}, wind = {} } = currentWeatherData;
  const { humidity } = main;
  const { speed } = wind;

  const overviewDetails = [
    {
      label: `Wind Status`,
      value: speed,
      units: "MPH",
      imageDescription: null,
    },
    {
      label: "UV Index",
      value: null,
      units: "UV",
      imageDescription: null,
    },
    {
      label: "Humidity",
      value: humidity,
      units: "%",
      imageDescription: "Humidity",
    },
    {
      label: "Visibility",
      value: visibility,
      units: "M",
      imageDescription: "Visibility",
    },
  ];

  return overviewDetails.map((detail) => renderOverviewCard(detail));
}

function TodaysOverview({ currentWeatherData }) {
  return (
    <div
      className="overview-item-wrapper m-2"
      data-testid={dataTestIdConstants.TODAYS_OVERVIEW_WRAPPER}
    >
      <div className="overview-item-wrapper container">
        <div className="row">{renderOverviewCards(currentWeatherData)}</div>
      </div>
    </div>
  );
}

TodaysOverview.prototype = {
  currentWeatherData: PropTypes.object.isRequired,
};

export default TodaysOverview;
