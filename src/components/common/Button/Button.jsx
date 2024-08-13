import "./button.css";
import PropTypes from "prop-types";
import classNames from "classnames";

import { FaSpinner } from "react-icons/fa6";
import Tooltip from "../Tooltip/Tooltip";

const BUTTON_TYPE = {
  PRIMARY: "PRIMARY",
  SECONDARY: "SECONDARY",
};

const BUTTON_TYPE_CLASS_NAME = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
};

function renderIcon(icon, isLoading) {
  const iconClassNames = ["weather-button-icon"];

  let displayIcon = icon;
  if (isLoading) {
    displayIcon = <FaSpinner />;
    iconClassNames.push("loading");
  }

  return <span className={classNames(iconClassNames)}>{displayIcon}</span>;
}

function Button(props) {
  const {
    ariaLabel,
    buttonType = BUTTON_TYPE.PRIMARY,
    className,
    disabled,
    icon,
    isLoading,
    tooltipText,
    label,
    onClick,
    title,
  } = props;

  const isDisabled = isLoading || disabled;

  const buttonClassNames = classNames(
    className,
    "weather-button",
    isDisabled && "disable",
    BUTTON_TYPE_CLASS_NAME[buttonType]
  );

  const onClickButton = (event) => {
    if (isDisabled) {
      return;
    }

    onClick(event);
  };

  function renderButton() {
    return (
      <button
        className={buttonClassNames}
        aria-label={ariaLabel}
        aria-disabled={isDisabled}
        onClick={(event) => onClickButton(event)}
        title={title}
      >
        {renderIcon(icon, isLoading)}
        {label}
      </button>
    );
  }

  if (tooltipText && isDisabled) {
    return (
      <Tooltip toolTipContent={isLoading ? "Data is loading" : tooltipText}>
        {renderButton()}
      </Tooltip>
    );
  }

  return renderButton();
}

Button.prototype = {
  ariaLabel: PropTypes.string,
  buttonType: PropTypes.oneOf(Object.values(BUTTON_TYPE)),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  isLoading: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
};

Button.TYPE = BUTTON_TYPE;

export default Button;
