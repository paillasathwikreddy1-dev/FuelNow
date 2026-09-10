import React from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Request from "./pages/Request";
import Tracking from "./pages/Tracking";
import MyRequests from "./pages/MyRequests";
import SavedLocations from "./pages/SavedLocations";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import HelpSafety from "./pages/HelpSafety";
import RiderDashboard from "./pages/RiderDashboard";
import StationDashboard from "./pages/StationDashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />

      {/* Customer / Driver Experience */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/request" component={Request} />
      <Route path="/tracking" component={Tracking} />
      <Route path="/tracking/:id" component={Tracking} />
      <Route path="/my-requests" component={MyRequests} />
      <Route path="/saved-locations" component={SavedLocations} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />
      <Route path="/help" component={HelpSafety} />

      {/* Role-Specific Hubs */}
      <Route path="/rider" component={RiderDashboard} />
      <Route path="/station" component={StationDashboard} />
      <Route path="/admin" component={Admin} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-right" richColors />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
