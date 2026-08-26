import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Video from "./pages/Video";
import "./App.css";
import Upload from "./pages/upload";
import Profile from "./pages/Profile";

function App() {
  const path = window.location.pathname;

  const accessToken =
    localStorage.getItem("accessToken");

  if (path === "/register") {
    return <Register />;
  }

  if (path === "/home") {
    if (!accessToken) {
      window.location.replace("/login");
      return null;
    }

    return <Home />;
  }

  if (path === "/video") {
    if (!accessToken) {
      window.location.replace("/login");
      return null;
    }

    return <Video />;
  }

  if (path === "/upload") {
    if (!accessToken) {
      window.location.replace("/login");
      return null;
    }

    return <Upload />;
  }
  if (path === "/profile") {
  if (!accessToken) {
    window.location.replace("/login");
    return null;
  }

  return <Profile />;
}

  return <Login />;
}

export default App;