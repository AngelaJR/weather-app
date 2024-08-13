import "../../../styles/forecast.css";
import _ from "lodash";

import PropTypes from "prop-types";

import NoDataAvailable from "../../common/NoDataAvailable/NoDataAvailable";
import ForecastItem from "./ForecastCard";
import dataTestIdConstants from "../../../utils/dataTestIdConstants";

function renderForecast(dayPeriods) {
  if (_.isEmpty(dayPeriods)) {
    return (
      <NoDataAvailable
        componentId="forecast-no-data"
        message="There seems to be some issue obtaining the forecast. Try Again."
      />
    );
  }

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-stretch">
      {dayPeriods.map((dayPeriod) => {
        const componentId = _.kebabCase(
          `${dayPeriod.number}-${dayPeriod.name}`
        );

        return (
          <ForecastItem
            componentId={componentId}
            key={componentId}
            {...dayPeriod}
          />
        );
      })}
    </div>
  );
}

function Forecast(props) {
  const { forecastData } = props;

  const { periods = [] } = forecastData.properties || {};

  const dayPeriods = periods.filter(({ number, isDaytime }) => {
    const notToday = number !== 1;
    return notToday && isDaytime;
  });

  const sixDayForecast = dayPeriods.slice(0, 6);

  return (
    <div
      className="d-flex flex-column forecast-wrapper"
      data-testid={dataTestIdConstants.FORECAST_WRAPPER}
    >
      <div className="container-fluid flex-fill d-inline-flex">
        {renderForecast(sixDayForecast)}
      </div>
    </div>
  );
}

Forecast.prototype = {
  forecastData: PropTypes.object.isRequired,
};

export default Forecast;
