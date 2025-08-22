import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./app/store";
import App from "./App";
import { fetchColorConfig } from "features/QuanLyCongViec/CongViec/colorConfigSlice";
const container = document.getElementById("root");
const root = createRoot(container);

// Preload global color configuration once at bootstrap
store.dispatch(fetchColorConfig());

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
