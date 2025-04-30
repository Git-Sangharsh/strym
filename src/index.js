import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Redux setup
import { Provider } from "react-redux";
import store from "./components/store/Store";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_AUTH}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);

// Optional performance monitoring
reportWebVitals();
