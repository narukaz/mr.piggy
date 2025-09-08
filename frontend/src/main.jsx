import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { injected } from "@wagmi/connectors";

const sonicTestnet = {
  id: 146,
  name: "Sonic Mainnet",
  nativeCurrency: {
    name: "Sonic",
    symbol: "S",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.soniclabs.com/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Sonic Mainnet Explorer",
      url: "https://explorer.soniclabs.com/",
    },
  },
  testnet: true,
};

const config = createConfig({
  chains: [sonicTestnet],

  connectors: [injected()],

  transports: {
    [sonicTestnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "transparent",
              accentColorForeground: "#FFFFFF",
            })}
          >
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);
