const weatherUtils = {
  getDirectionByDegree: (angle) => {
    const directions = ["N", "N-E", "E", "S-E", "S", "S-W", "W", "N-W"];

    const index =
      Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
    return directions[index];
  },
};

export default weatherUtils;
