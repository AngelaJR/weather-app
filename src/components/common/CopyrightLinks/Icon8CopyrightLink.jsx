import PropTypes from "prop-types";

function Icon8CopyrightLink({ sourceUrl, name }) {
  return (
    <div style={{ fontSize: "6px" }}>
      <a target="_blank" href={sourceUrl} rel="noreferrer">
        {name}
      </a>{" "}
      icon by{" "}
      <a target="_blank" href="https://icons8.com" rel="noreferrer">
        Icons8
      </a>
    </div>
  );
}

Icon8CopyrightLink.prototype = {
  sourceUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default Icon8CopyrightLink;
