import "../../styles/header.css";
import PropTypes from "prop-types";
import classNames from "classnames";

import Notifications from "./Notifications";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";

const COL_PADDING_TOP_BOTTOM = "pt-2 pb-2";

function Header({ onSearchGeolocation }) {
  return (
    <header id="weather-header" className="container">
      <div className="container-fluid mt-4">
        <div className="row align-middle text-center align-items-center">
          <div
            className={classNames(
              "col-12 col-sm-3",
              COL_PADDING_TOP_BOTTOM,
              "text-sm-start"
            )}
          >
            <Notifications />
          </div>
          <div
            className={classNames(
              "col-12 col-sm-6",
              COL_PADDING_TOP_BOTTOM,
              "text-center"
            )}
          >
            <SearchBar
              onSearchGeolocation={(location) => onSearchGeolocation(location)}
            />
          </div>
          <div
            className={classNames(
              "col-12 col-sm-3 ",
              COL_PADDING_TOP_BOTTOM,
              "text-sm-end"
            )}
          >
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}

Header.prototype = {
  onSearchGeolocation: PropTypes.func.isRequired,
};

export default Header;
