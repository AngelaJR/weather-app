import PropTypes from "prop-types";

import WeatherIcon from "../../common/WeatherIcon/WeatherIcon";
import Temperature from "../Temperature";

function ForecastItem(props) {
  const { componentId, name, shortForecast, temperature } = props;

  const dayOfTheWeek = name.substring(0, 3).toUpperCase();

  return (
    <div
      id={componentId}
      className="forecast-item-wrapper m-2 text-center shadow"
    >
      <div className="temperature-content d-flex flex-wrap flex-column justify-content-around align-items-stretch h-100">
        <div className="fw-bold">{dayOfTheWeek}</div>
        <div>
          <WeatherIcon
            componentId={`${componentId}-icon`}
            description={shortForecast}
          />
        </div>
        <div>
          <Temperature
            componentId={`${componentId}-temperature`}
            temperature={temperature}
          />
        </div>
      </div>
    </div>
  );
}

ForecastItem.prototype = {
  componentId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  temperature: PropTypes.string.isRequired,
  shortForecast: PropTypes.string,
};

export default ForecastItem;
