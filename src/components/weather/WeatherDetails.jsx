import PropTypes from "prop-types";
import Forecast from "./forecast/Forecast";
import CurrentWeather from "./CurrentWeather";

function WeatherDetails(props) {
  const { currentWeatherData, forecastData } = props;

  return (
    <div className="weather-details">
      <div className="d-inline-block">
        <div className="d-flex flex-wrap justify-content-center align-items-stretch">
          <CurrentWeather
            currentWeatherData={currentWeatherData}
            forecastData={forecastData}
          />
          <Forecast forecastData={forecastData} />
        </div>
      </div>
    </div>
  );
}

WeatherDetails.prototype = {
  currentWeatherData: PropTypes.object.isRequired,
  forecastData: PropTypes.object.isRequired,
};

export default WeatherDetails;
