import "./noDataAvailable.css";
import PropTypes from "prop-types";

function NoDataAvailable(props) {
  const { componentId, message } = props;

  return (
    <div id={componentId} className="p-4 no-data-available-wrapper">
      <h4>No Data Available</h4>
      <p>{message}</p>
    </div>
  );
}

NoDataAvailable.prototype = {
  componentId: PropTypes.string.isRequired,
  message: PropTypes.string,
};

export default NoDataAvailable;
