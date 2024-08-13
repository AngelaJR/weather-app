import "../../styles/currentWeather.css";

import _ from "lodash";

import PropTypes from "prop-types";

import weatherUtils from "../../utils/weatherUtils";
import WeatherIcon from "../common/WeatherIcon/WeatherIcon";
import Temperature from "./Temperature";
import dateUtils from "../../utils/dateUtils";
import dataTestIdConstants from "../../utils/dataTestIdConstants";

function renderWeatherDetails({ label, value, units }) {
  // show data when value is 0
  const stringValue = value?.toString();

  return (
    <span key={_.kebabCase(label)} className="d-block">
      <span className="text-muted">{label}</span>{" "}
      <strong>
        {stringValue || "--"}
        {stringValue ? units : null}
      </strong>
    </span>
  );
}

function renderLeftDetails(currentWeatherData) {
  const { main = {}, wind = {} } = currentWeatherData;
  const { feels_like: feelsLike, humidity, pressure } = main;
  const { speed, deg } = wind;

  const directionsByDegree = weatherUtils.getDirectionByDegree(deg);

  const details = [
    {
      label: "Real Feel",
      value: feelsLike,
    },
    {
      label: `Wind ${directionsByDegree || ""}`,
      value: speed,
      units: "MPH",
    },
    {
      label: "Pressure",
      value: pressure,
      units: "MB",
    },
    {
      label: "Humidity",
      value: humidity,
      units: "%",
    },
  ];

  return details.map((weatherInfo) => renderWeatherDetails(weatherInfo));
}

function renderRightDetails(currentWeatherData) {
  const { sunrise, sunset } = currentWeatherData.sys || {};
  const details = [
    {
      label: "Sunrise",
      value: dateUtils.getUnixToTime(sunrise),
    },
    {
      label: "Sunset",
      value: dateUtils.getUnixToTime(sunset),
    },
  ];

  return details.map((weatherInfo) => renderWeatherDetails(weatherInfo));
}

function CurrentWeather(props) {
  const { currentWeatherData } = props;
  const { main, weather } = currentWeatherData;

  const { day, time } = dateUtils.getCurrentDateInfo();

  return (
    <div
      className="current-weather-wrapper m-2 shadow"
      data-testid={dataTestIdConstants.CURRENT_WEATHER_WRAPPER}
    >
      <div className="current-weather-header container fs-5 fw-bold text-center">
        <div className="current-weather-row-header row">
          <div className="col-12 p-1 col-sm-6 text-sm-start">
            <span>{day}</span>
          </div>
          <div className="col-12 p-1 col-sm-6 text-sm-end">
            <span>{time}</span>
          </div>
        </div>
      </div>
      <div className="m-2">
        <div className="current-weather container">
          <div className="row">
            <div className="col-sm-6 col-12 text-sm-start text-center">
              <Temperature
                bold
                componentId="current-temperature"
                size={Temperature.SIZE.LARGE}
                temperature={main?.temp}
              />
            </div>
            <div className="col-sm-6 col-12">
              <WeatherIcon description={weather?.[0]?.description} />
            </div>
          </div>
        </div>
        <div className="text-center d-flex flex-wrap justify-content-around align-items-center">
          <div className="p-2 text-sm-start">
            {renderLeftDetails(currentWeatherData)}
          </div>
          <div className="p-2 text-sm-end">
            {renderRightDetails(currentWeatherData)}
          </div>
        </div>
      </div>
    </div>
  );
}

CurrentWeather.prototype = {
  currentWeatherData: PropTypes.object.isRequired,
};

export default CurrentWeather;
