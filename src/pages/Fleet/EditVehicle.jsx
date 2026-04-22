import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VehicleForm from "../../components/VehicleForm";
import { getVehicleById, updateVehicleById } from "../../services/VehicleService";
import { useLoader } from "../../context/LoaderContext";

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {setLoading} = useLoader()
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getVehicleById(id);
        setVehicle({
          registration: data.registration || "",
          manufacturer: data.manufacturer || "",
          model: data.model || "",
          date_registered: data.date_registered || "",
          maintenance_interval_months: data.maintenance_interval_months || "",
          fuel_type: data.fuel_type || "",
          status: data.status || "",
        });
      } catch (error) {
        console.error("Failed to load vehicle:", error);

      }
      finally {
        setLoading(false); // Always stop loader
      }
    };
    fetchData();
  }, [ id, setLoading ]);

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      await updateVehicleById(id, formData);
      navigate("/fleet/vehicles");
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
    finally {
      setLoading(false); // Stop loader
    }
  };
  const handleCancel = () => {
    setLoading(false); // Ensure loader stops if canceling
    navigate("/fleet/vehicles");
  };
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Vehicle</h2>
      <VehicleForm
        initialData={vehicle}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditVehicle; 