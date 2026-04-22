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
import BranchList from "../pages/Branches/branchList";

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
        <Route element={<RoleProtectedRoute allowedRoles={["SuperAdmin","Manager", "Driver", "Admin", "CompanyAdmin", "Viewer", "Maintenance", "BranchManager"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Fleet Management → Manager, Admin, CompanyAdmin, BranchManager */}
        <Route element={<RoleProtectedRoute allowedRoles={["Manager", "Admin", "CompanyAdmin", "BranchManager","SuperAdmin"]} />}>
          <Route path="/fleet/vehicles" element={<VehicleList />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/edit-vehicle/:id" element={<EditVehicle />} />
          <Route path="/fleet/overview" element={<FleetOverview />} />
          <Route path="/add-inspection" element={<AddInspection />} />
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
        <Route element={<RoleProtectedRoute allowedRoles={["Admin","SuperAdmin", "CompanyAdmin","BranchManager"]} />}>
          <Route path="/Businesses/live" element={<Live />} />
          <Route path="/branches" element={<BranchList />} />
        </Route>
     
      </Route>
    </Routes>
  );
};

export default AppRoutes;
