import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Unauthorized from "../pages/Unauthorized";
import ManagerPages from "../pages/ManagerPage";
import DriverPages from "../pages/DriverPages";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Layout from "../components/Layout";
import VehicleList from "../pages/Fleet/VehicleList";
import AddVehicle from "../pages/Fleet/AddVehicle";
import EditVehicle from "../pages/Fleet/EditVehicle";
import FleetOverview from "../pages/Fleet/FleetOverview";
import FleetInspectionDetails from "../pages/Fleet/FleetInspectionDetails";
import AddInspection from "../pages/Fleet/AddInspection";
import SignUp from "../pages/SignUp";
import Live from "../pages/Businesses/Live";
import Targets from "../pages/Businesses/Targets";
import BranchList from "../pages/Branches/branchList";
import SmartModulePage from "../pages/Portal/SmartModulePage";
import MonthlyReports from "../pages/Reports/MonthlyReports";
import AnnualReports from "../pages/Reports/AnnualReports";
import DriverSchedule from "../pages/Driver/DriverSchedule";
import DriverPerformance from "../pages/Driver/DriverPerformance";
import DriverOverview from "../pages/Driver/DriverOverview";
import AddDriver from "../pages/Driver/AddDriver";
import EditDriver from "../pages/Driver/EditDriver";
import Maintenance from "../pages/Maintenance/Maintenance";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root (/) to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected portal with Layout */}
      <Route element={<Layout />}>
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Dashboard → all logged in users */}
        <Route element={<RoleProtectedRoute allowedRoles={["SuperAdmin","Manager", "Driver", "Admin", "CompanyAdmin", "CompanyManager", "Viewer", "Maintenance", "BranchManager"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/kpis" element={<Dashboard />} />
          <Route path="/dashboard/realtime" element={<SmartModulePage title="Real Time Statistics" subtitle="Live intelligent monitoring for vehicles, routes, and team performance." />} />
        </Route>

        {/* Fleet Management → Manager, Admin, CompanyAdmin, BranchManager */}
        <Route element={<RoleProtectedRoute allowedRoles={["Manager", "Admin", "CompanyAdmin", "BranchManager","SuperAdmin"]} />}>
          <Route path="/fleet/vehicles" element={<VehicleList />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/edit-vehicle/:id" element={<EditVehicle />} />
          <Route path="/fleet/overview" element={<FleetOverview />} />
          <Route path="/add-inspection" element={<AddInspection />} />
          <Route path="/fleet/assignment" element={<SmartModulePage title="Fleet Assignment" subtitle="Assign assets and drivers intelligently by business demand and constraints." />} />
        </Route>

        {/* Inspections → Drivers + Managers + Maintenance */}
        <Route element={<RoleProtectedRoute allowedRoles={["Driver", "Manager", "Maintenance","SuperAdmin"]} />}>
          <Route path="/fleet/inspection" element={<FleetInspectionDetails />} />
        </Route>

        {/* Manager-only section */}
        <Route element={<RoleProtectedRoute allowedRoles={["Manager","SuperAdmin"]} />}>
          <Route path="/manager" element={<ManagerPages />} />
        </Route>

        {/* Driver-only section */}
        <Route element={<RoleProtectedRoute allowedRoles={["Driver","SuperAdmin"]} />}>
          <Route path="/driver" element={<DriverPages />} />
        </Route>
        {/* Super Admin, Admin and Company Admin */}
        <Route element={<RoleProtectedRoute allowedRoles={["Admin","SuperAdmin", "CompanyAdmin","CompanyManager","BranchManager"]} />}>
          <Route path="/businesses/live" element={<Live />} />
          <Route path="/businesses/targets" element={<Targets />} />
          <Route path="/branches" element={<BranchList />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["Admin","SuperAdmin", "CompanyAdmin","CompanyManager","Manager","Viewer"]} />}>
          <Route path="/reports/monthly" element={<MonthlyReports />} />
          <Route path="/reports/annual" element={<AnnualReports />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["Manager","SuperAdmin","Admin","CompanyAdmin","CompanyManager","BranchManager"]} />}>
          <Route path="/driver/overview" element={<DriverOverview />} />
          <Route path="/add-driver" element={<AddDriver />} />
          <Route path="/edit-driver/:id" element={<EditDriver />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["Driver","Manager","SuperAdmin","Admin","CompanyAdmin","CompanyManager","BranchManager"]} />}>
          <Route path="/driver/schedule" element={<DriverSchedule />} />
          <Route path="/driver/performance" element={<DriverPerformance />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["Maintenance","Manager","SuperAdmin","Admin","CompanyAdmin","CompanyManager","BranchManager"]} />}>
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["Driver","Manager","SuperAdmin","Admin","CompanyAdmin","CompanyManager","BranchManager"]} />}>
          <Route path="/trips" element={<SmartModulePage title="Trips" subtitle="Trip lifecycle intelligence from dispatch to closure." />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["SuperAdmin","Admin","CompanyAdmin","CompanyManager","BranchManager","Manager","Driver"]} />}>
          <Route path="/chat" element={<SmartModulePage title="Chat" subtitle="Collaborative communication with operational AI suggestions." />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["SuperAdmin","Admin","CompanyAdmin","CompanyManager","BranchManager"]} />}>
          <Route path="/settings/account" element={<SmartModulePage title="Account Settings" subtitle="Role-aware account controls and profile governance." />} />
          <Route path="/settings/users" element={<SmartModulePage title="User Management" subtitle="Manage users, access levels, and intelligent permission policies." />} />
          <Route path="/settings/preferences" element={<SmartModulePage title="System Preferences" subtitle="Configure portal behavior and automation defaults by business type." />} />
        </Route>

        <Route element={<RoleProtectedRoute allowedRoles={["SuperAdmin","Admin","CompanyAdmin","CompanyManager","BranchManager","Manager","Driver","Viewer","Maintenance"]} />}>
          <Route path="/helpdesk" element={<SmartModulePage title="Help Desk" subtitle="Support intelligence, issue triage, and guided troubleshooting workflows." />} />
        </Route>
     
      </Route>
    </Routes>
  );
};

export default AppRoutes;
