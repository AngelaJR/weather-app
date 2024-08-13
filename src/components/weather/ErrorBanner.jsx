import "../../styles/errorBanner.css";
import _ from "lodash";

import PropTypes from "prop-types";

import { MdErrorOutline } from "react-icons/md";

function getErrorMessage(errorInfo) {
  const { message, status, detail } = errorInfo;

  if (status === "failed" && (message || detail)) {
    return (
      <span>
        <strong>Server Error:</strong> {message || detail}
      </span>
    );
  }

  return message;
}

function capitalize(string) {
  return string
    ?.split(" ")
    .map((str) => _.capitalize(str))
    .join(" ");
}

function ErrorBanner(props) {
  const { hasErrors, errorInfo } = props;
  const { additionalInfo, label, title } = errorInfo;

  if (hasErrors) {
    return (
      <div className="error-banner-wrapper m-4">
        <MdErrorOutline size={40} color={"#ad0101"} />
        <h5>{capitalize(label || title) || "Error Loading Weather"}</h5>
        <p>
          {getErrorMessage(errorInfo)}
          <br />
          <span>
            <strong>Information:</strong>{" "}
            {additionalInfo ||
              "Tray again by clicking the “Refresh Weather Button” or search for a new location."}
          </span>
        </p>
      </div>
    );
  }

  return null;
}

ErrorBanner.prototype = {
  hasErrors: PropTypes.bool,
  errorInfo: PropTypes.object.isRequired,
};

export default ErrorBanner;
