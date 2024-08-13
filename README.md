# Weather App

This React weather app offers real-time weather updates and can fetch current weather conditions based on your location. Users can search for weather information for any location or use the app’s geolocation feature to see weather details for their current position. The app displays key data such as temperature, humidity, and weather description, and includes a forecast for the upcoming days.

![Weather App](images/weather-app-img.png)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Set Up

### API

#### API Key

To run the app, you'll need to include an API key in the .env file located at the root of the repository. The key should be named `REACT_APP_LOCATION_WEATHER_API_KEY`. You can obtain this API key by visiting [OpenWeather](https://openweathermap.org/api)

#### End Points

- GET https://api.openweathermap.org - Geolocation and Current Weather
- GET https://api.weather.gov - Location Metadata and Forecast Weather

### Installation

Clone the repository to your local machine and then run npm install to set up the project.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Acknowledgements

[Bootstrap](https://getbootstrap.com/)
[Icons8](https://icons8.com)
[ReactJS](https://react.dev/)
[Redux Toolkit](https://redux-toolkit.js.org/)
[Floating UI](https://floating-ui.com/)
