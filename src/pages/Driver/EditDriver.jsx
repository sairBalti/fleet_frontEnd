import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DriverForm from "../../components/DriverForm";
import { getDriverById, updateDriver } from "../../services/driverService";
import { useLoader } from "../../context/LoaderContext";
import { getCompanyBranchLookup } from "../../services/LookupService";
import { getUserData } from "../../utils/auth";

const EditDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading } = useLoader();
  const [driver, setDriver] = useState(null);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [companyDisabled, setCompanyDisabled] = useState(false);
  const [branchDisabled, setBranchDisabled] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const user = getUserData();

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

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
        if (user?.role === "BranchManager") {
          setBranchDisabled(true);
        }
      } catch (error) {
        console.error("Failed to load driver lookup:", error);
      }
    };
    loadLookup();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDriverById(id);
        const d = res.data;
        if (!d || !d.driver_name) {
          console.error("Invalid driver payload");
          return;
        }
        setDriver({
          company_id: d.company_id || "",
          branch_id: d.branch_id || "",
          driver_name: d.driver_name || "",
          email: d.email || "",
          driver_status: d.status || d.driver_status || "Active",
          total_driving_hours: d.total_driving_hours ?? "",
          total_mileage: d.total_mileage ?? "",
          efficiency_score: d.efficiency_score ?? "",
          safety_score: d.safety_score ?? "",
          completion_rate: d.completion_rate ?? "",
        });
        if (d.company_id) {
          await handleCompanyChange(d.company_id);
        }
        if (d.company_name) {
          setSelectedBusinessType((prev) => prev || "");
        }
      } catch (error) {
        console.error("Failed to load driver:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, setLoading]);

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      await updateDriver(id, formData);
      navigate("/driver/overview");
    } catch (error) {
      console.error("Failed to update driver:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/driver/overview");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Driver</h2>
      {driver ? (
        <DriverForm
          initialData={driver}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          companyOptions={companyOptions}
          branchOptions={branchOptions}
          companyDisabled={companyDisabled}
          branchDisabled={branchDisabled}
          selectedBusinessType={selectedBusinessType}
          onCompanyChange={handleCompanyChange}
        />
      ) : (
        <p className="text-gray-500">Loading driver…</p>
      )}
    </div>
  );
};

export default EditDriver;
