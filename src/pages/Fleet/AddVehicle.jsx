import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addvehicles } from "../../services/VehicleService";
import VehicleForm from "../../components/VehicleForm";
import CustomLoader from "../../components/CustomLoader";
import { useLoader } from "../../context/LoaderContext";


const AddVehicle = () => {
  const navigate = useNavigate();
  const { setLoading } = useLoader()

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  const emptyVehicle = useMemo(() => ({
    registration: "",
    manufacturer: "",
    model: "",
    date_registered: "",
    maintenance_interval_months: "",
    fuel_type: "",
    status: "",
  }), []);

  const handleAdd = async (formData) => {
    try {
      setLoading(true); //show loader while submitting
      await addvehicles(formData);
      navigate("/fleet/vehicles");
    } catch (error) {
      console.error("Failed to add vehicle:", error);
    } finally {
      setLoading(false); // stop loader
    }
  };

  return (
    <div className="p-6 relative">
      <h2 className="text-2xl font-bold mb-4">Add Vehicle</h2>
      <VehicleForm
        initialData={emptyVehicle}
        onSubmit={handleAdd}
        onCancel={() => navigate("/fleet/vehicles")}

      />
    </div>
  );
};

export default AddVehicle;