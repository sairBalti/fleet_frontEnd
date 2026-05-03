import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VehicleForm from "../../components/VehicleForm";
import { getVehicleById, updateVehicleById } from "../../services/VehicleService";
import { useLoader } from "../../context/LoaderContext";
import { getCompanyBranchLookup } from "../../services/LookupService";
import { getUserData } from "../../utils/auth";

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {setLoading} = useLoader()
  const [vehicle, setVehicle] = useState(null);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [companyDisabled, setCompanyDisabled] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const user = getUserData();

  const handleCompanyChange = async (nextCompanyId) => {
    try {
      const response = await getCompanyBranchLookup({
        companyId: nextCompanyId || null,
        returnCompanyData: false,
        returnBranchData: true,
      });
      setBranchOptions(response.data?.branchList || []);
      const selectedCompany = companyOptions.find((item) => String(item.id) === String(nextCompanyId));
      setSelectedBusinessType(selectedCompany?.business_type_name || "");
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranchOptions([]);
    }
  };

  useEffect(() => {
    const loadLookup = async () => {
      try {
        const response = await getCompanyBranchLookup({
          returnCompanyData: true,
          returnBranchData: true,
        });
        const companies = response.data?.companyList || [];
        setCompanyOptions(companies);
        setBranchOptions(response.data?.branchList || []);
        if (["CompanyAdmin", "CompanyManager", "BranchManager", "Driver"].includes(user?.role)) {
          setCompanyDisabled(true);
        }
      } catch (error) {
        console.error("Failed to load vehicle lookup:", error);
      }
    };
    loadLookup();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getVehicleById(id);
        setVehicle({
          company_id: data.company_id || "",
          branch_id: data.branch_id || "",
          registration: data.registration || "",
          manufacturer: data.manufacturer || "",
          model: data.model || "",
          date_registered: data.date_registered || "",
          maintenance_interval_months: data.maintenance_interval_months || "",
          fuel_type: data.fuel_type || "",
          status: data.status || "",
        });
        await handleCompanyChange(data.company_id);
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
        companyOptions={companyOptions}
        branchOptions={branchOptions}
        companyDisabled={companyDisabled}
        selectedBusinessType={selectedBusinessType}
        onCompanyChange={handleCompanyChange}
      />
    </div>
  );
};

export default EditVehicle; 