import "./WeatherIcon.css";
import _ from "lodash";
import classNames from "classnames";

import PropTypes from "prop-types";
import Icon8CopyrightLink from "../CopyrightLinks/Icon8CopyrightLink";

const ICON_SIZE = {
  LARGE: "LARGE",
};

const FORE_CASE_ICON_MAP = [
  {
    imgFileName: "icons8-cloud-with-lightning-and-rain-100.png",
    sourceUrl:
      "https://icons8.com/icon/ESeqfDjC5eVO/cloud-with-lightning-and-rain",
    name: "Cloud With Lightning And Rain",
    exactKeywords: ["thunderstorms"],
    hasPrecipitation: true,
  },
  {
    imgFileName: "icons8-sun-behind-rain-cloud-100.png",
    sourceUrl: "https://icons8.com/icon/kBdkBkiwut6s/sun-behind-rain-cloud",
    name: "Sun Behind Rain Cloud",
    exactKeywords: ["partly cloudy", "showers|rain"],
    hasPrecipitation: true,
  },
  {
    imgFileName: "icons8-cloud-with-rain-100.png",
    sourceUrl: "https://icons8.com/icon/ulJA5JddHJKv/cloud-with-rain",
    name: "Cloud With Rain",
    keywords: ["rain", "showers"],
    hasPrecipitation: true,
  },
  {
    imgFileName: "icons8-cloud-100",
    sourceUrl: "https://icons8.com/icon/P9tT31QGJr_S/sun-behind-cloud",
    name: "Sun Behind Cloud",
    keywords: ["partly cloudy", "partly sunny"],
  },
  {
    imgFileName: "icons8-sun-behind-small-cloud-100.png",
    sourceUrl: "https://icons8.com/icon/UyNm3S4bECd7/sun-behind-small-cloud",
    name: "Sun Behind Small Cloud",
    keywords: ["mostly sunny", "mostly clear"],
  },
  {
    imgFileName: "icons8-cloud-100.png",
    sourceUrl: "https://icons8.com/icon/1RZffALm9Wgo/cloud",
    name: "Clouds",
    keywords: ["clouds"],
  },
  {
    imgFileName: "icons8-sun-behind-cloud-100.png",
    sourceUrl: "https://icons8.com/icon/8LM7-CYX4BPD/sun",
    name: "Sunny",
    keywords: ["sunny", "clear sky"],
  },
  {
    imgFileName: "humidity-cloud.png",
    sourceUrl: null,
    name: "Humidity",
    exactKeywords: ["humidity"],
  },
  {
    imgFileName: "visibility-icon.png",
    sourceUrl: null,
    name: "Visibility",
    exactKeywords: ["visibility"],
  },
];

function defaultIcon() {
  return {
    imgFileName: "icons8-face-in-clouds-100.png",
    sourceUrl: "https://icons8.com/icon/1dTT2MwTyowz/face-in-clouds",
    name: "Face In Clouds",
  };
}

function matchesKeyword(keyword, description) {
  const regex = new RegExp(`\\b(${keyword})`, "g");
  return description?.toLowerCase().match(regex);
}

function hasKeywords(iconInfo, description) {
  // since precipitation does not always have a value when there is a chance
  // of rain, and the api does not return a more reliable way to determine
  // the weather forecast based on the conditions;
  // need to match the exact word of the forecast description
  // to get the most accurate forecast icon.
  if (iconInfo.exactKeywords) {
    return iconInfo.exactKeywords.every((keyword) => {
      return matchesKeyword(keyword, description);
    });
  }

  return iconInfo.keywords.some((keyword) => {
    return matchesKeyword(keyword, description);
  });
}

function WeatherIcon(props) {
  const { componentId, description, size } = props;

  const { name, imgFileName } =
    FORE_CASE_ICON_MAP.find((iconInfo) => {
      return hasKeywords(iconInfo, description);
    }) || defaultIcon();

  const iconClassName = classNames(
    "weather-icon",
    size === ICON_SIZE.LARGE && "large-icon"
  );

  return (
    <>
      <img
        className={iconClassName}
        id={`${componentId}-${_.kebabCase(name)}`}
        src={`images/${imgFileName}`}
        alt={name}
        title={description || "No Weather Icon Available"}
      />
      {/* leaving it for copyright purposes {sourceUrl && <Icon8CopyrightLink sourceUrl={sourceUrl} name={name} />} */}
    </>
  );
}

WeatherIcon.prototype = {
  componentId: PropTypes.string.isRequired,
  description: PropTypes.string,
  size: PropTypes.oneOf(Object.values(ICON_SIZE)),
};

WeatherIcon.SIZE = ICON_SIZE;

export default WeatherIcon;
