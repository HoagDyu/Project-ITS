import "./Layout.css";
import Uploader from "./components/Uploader";
import Preview from "./components/Preview";
import Log from "./components/Log";

function Layout() {
  return (
    <div className="layout-container">

      {/* Bên trái */}
      <div className="left-panel">
        <Uploader />
      </div>

      {/* Bên phải */}
      <div className="right-panel">
        <Preview />
        <Log />
      </div>

    </div>
  );
}

export default Layout;