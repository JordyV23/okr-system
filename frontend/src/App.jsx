import { Router } from "./router/router";

import { Sonner, Toaster, TooltipProvider } from "./components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
