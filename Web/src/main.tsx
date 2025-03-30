import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.ts";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/utils.ts";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
 
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        </QueryClientProvider>
      </Provider>
      </GoogleOAuthProvider>
     

    </BrowserRouter>
  </StrictMode>
);
