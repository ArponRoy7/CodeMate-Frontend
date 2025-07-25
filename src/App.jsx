import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "/home/arpon-roy/Desktop/WebDevCodes/devtinder-frontend/src/components/Body.jsx";
import Login from "/home/arpon-roy/Desktop/WebDevCodes/devtinder-frontend/src/components/Login.jsx";
import Profile from "/home/arpon-roy/Desktop/WebDevCodes/devtinder-frontend/src/components/Profile.jsx";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "/home/arpon-roy/Desktop/WebDevCodes/devtinder-frontend/src/components/Feed.jsx";

function App() {
  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Feed />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
