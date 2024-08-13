import "./App.css";
import { Weather } from "./weather";

function App() {
  return (
    <div className="App">
      <div id="weather-app-content-wrapper container-filed">
        <div>
          <Weather />
        </div>
      </div>
    </div>
  );
}

export default App;
