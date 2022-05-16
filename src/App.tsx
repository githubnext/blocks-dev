import React from "react";
import Wrapper from "./components/Wrapper";
import { QueryClient, QueryClientProvider } from "react-query";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Wrapper />
    </QueryClientProvider>
  );
}
