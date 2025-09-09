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

const NETWORK = {
  id: Number(import.meta.env.VITE_CHAIN_ID),
  name: import.meta.env.VITE_NETWORK_NAME,
  nativeCurrency: {
    name: import.meta.env.VITE_TOKEN_NAME,
    symbol: import.meta.env.VITE_SYMBOL,
    decimals: Number(import.meta.env.VITE_DECIMALS),
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: import.meta.env.VITE_BLOCK_EXPLORER_NAME,
      url: import.meta.env.VITE_EXPLORER_URL,
    },
  },
  testnet: import.meta.env.VITE_ISTESTNET == "true",
};

console.log(NETWORK);
const config = createConfig({
  chains: [NETWORK],

  connectors: [injected()],

  transports: {
    [NETWORK.id]: http(),
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
