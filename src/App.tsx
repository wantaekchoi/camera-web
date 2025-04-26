import { QrCode, CameraView } from "./components";
import "./App.css";
function App() {
  return (
    <div className="App">
      <CameraView />
      <QrCode data={window.location.href} />
    </div>
  );
}

export default App;
