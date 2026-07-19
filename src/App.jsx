import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import Live from "./pages/Live";
import LiveWatch from "./pages/LiveWatch";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Links from "./pages/Links";
import Earnings from "./pages/Earnings";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import Wallet from "./pages/Wallet";
import Files from "./pages/Files";
import Tasks from "./pages/Tasks";
import Play from "./pages/Play";
import Upgrade from "./pages/Upgrade";
import Ads from "./pages/Ads";
import AdEarnings from "./pages/AdEarnings";
import ComingSoon from "./pages/ComingSoon";
import useScrollToHash from "./hooks/useScrollToHash";

function ScrollManager() {
  useScrollToHash();
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />

          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />

          <Route path="/live" element={<Live />} />
          <Route
            path="/live/:id"
            element={
              <RequireAuth>
                <LiveWatch />
              </RequireAuth>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <UserDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/links"
            element={
              <RequireAuth>
                <Links />
              </RequireAuth>
            }
          />
          <Route
            path="/earnings"
            element={
              <RequireAuth>
                <Earnings />
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <Notifications />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/change-password"
            element={
              <RequireAuth>
                <ChangePassword />
              </RequireAuth>
            }
          />
          <Route
            path="/wallet"
            element={
              <RequireAuth>
                <Wallet />
              </RequireAuth>
            }
          />
          <Route
            path="/files"
            element={
              <RequireAuth>
                <Files />
              </RequireAuth>
            }
          />
          <Route
            path="/tasks"
            element={
              <RequireAuth>
                <Tasks />
              </RequireAuth>
            }
          />
          <Route
            path="/play"
            element={
              <RequireAuth>
                <Play />
              </RequireAuth>
            }
          />
          <Route
            path="/upgrade"
            element={
              <RequireAuth>
                <Upgrade />
              </RequireAuth>
            }
          />
          <Route
            path="/ads"
            element={
              <RequireAuth>
                <Ads />
              </RequireAuth>
            }
          />
          <Route
            path="/ads/earnings"
            element={
              <RequireAuth>
                <AdEarnings />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          <Route path="/how-it-works" element={<ComingSoon title="How it works" />} />
          <Route path="/about" element={<ComingSoon title="About" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
