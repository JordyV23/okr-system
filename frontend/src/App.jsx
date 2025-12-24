import { Router } from "./router/router";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "./components/ui/Tooltip"

// import { Toaster, TooltipProvider } from "./components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/Sonner";

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
