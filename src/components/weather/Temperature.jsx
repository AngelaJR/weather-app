import PropTypes from "prop-types";
import classNames from "classnames";

const TEMPERATURE_SIZE = {
  LARGE: "LARGE",
};

function Temperature({ bold, componentId, size, temperature }) {
  let temperatureValue = "--";

  if (temperature) {
    temperatureValue = <span>{temperature}&deg;</span>;
  }

  const fontSize = size === TEMPERATURE_SIZE.LARGE ? "fs-1" : "fs-2";
  const fontWeight = bold ? "fw-bolder" : "";
  const temperatureClassNames = classNames("p-2", fontSize, fontWeight);

  return (
    <div id={componentId} className={temperatureClassNames}>
      {temperatureValue}
    </div>
  );
}

Temperature.prototype = {
  bold: PropTypes.bool,
  componentId: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.keys(TEMPERATURE_SIZE)),
  temperature: PropTypes.string,
};

Temperature.SIZE = TEMPERATURE_SIZE;

export default Temperature;
