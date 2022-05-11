import React from "react";
import Wrapper from "./components/wrapper";
import { QueryClient, QueryClientProvider } from "react-query";

export default function App({ children }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Wrapper />
    </QueryClientProvider>
  );
}