import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createDriver } from "../../services/driverService";
import { getCompanyBranchLookup } from "../../services/LookupService";
import DriverForm from "../../components/DriverForm";
import { useLoader } from "../../context/LoaderContext";
import { getUserData } from "../../utils/auth";

const AddDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoading } = useLoader();
  const [companyOptions, setCompanyOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [companyDisabled, setCompanyDisabled] = useState(false);
  const [branchDisabled, setBranchDisabled] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const [initialData, setInitialData] = useState({
    company_id: location.state?.companyId || "",
    branch_id: location.state?.branchId || "",
    driver_name: "",
    email: "",
    driver_status: "Active",
    total_driving_hours: "",
    total_mileage: "",
    efficiency_score: "",
    safety_score: "",
    completion_rate: "",
  });
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
      console.error("Failed to load branch options:", error);
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
        const branches = response.data?.branchList || [];
        setCompanyOptions(companies);
        setBranchOptions(branches);

        if (location.state?.businessType) {
          setSelectedBusinessType(location.state.businessType);
        }

        if (location.state?.companyId) {
          await handleCompanyChange(location.state.companyId);
        }

        if (user?.role === "BranchManager" && user.company_id && user.branch_id && companies.length > 0) {
          const match = companies.find((c) => String(c.id) === String(user.company_id));
          if (match) {
            setCompanyDisabled(true);
            setBranchDisabled(true);
            setSelectedBusinessType(match.business_type_name || "");
            setInitialData((prev) => ({
              ...prev,
              company_id: match.id,
              branch_id: String(user.branch_id),
            }));
            await handleCompanyChange(match.id);
          }
        } else if (["CompanyAdmin", "CompanyManager", "Driver"].includes(user?.role) && companies.length > 0) {
          const presetCompany = companies[0];
          setCompanyDisabled(true);
          setSelectedBusinessType(presetCompany.business_type_name || "");
          setInitialData((prev) => ({
            ...prev,
            company_id: presetCompany.id,
            branch_id: branches[0]?.id || "",
          }));
          await handleCompanyChange(presetCompany.id);
        }
      } catch (error) {
        console.error("Failed to load driver lookup:", error);
      }
    };
    loadLookup();
  }, []);

  const handleAdd = async (formData) => {
    try {
      setLoading(true);
      await createDriver(formData);
      navigate("/driver/overview");
    } catch (error) {
      console.error("Failed to add driver:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 relative">
      <h2 className="text-2xl font-bold mb-4">Add Driver</h2>
      <DriverForm
        initialData={initialData}
        onSubmit={handleAdd}
        onCancel={() => navigate("/driver/overview")}
        companyOptions={companyOptions}
        branchOptions={branchOptions}
        companyDisabled={companyDisabled}
        branchDisabled={branchDisabled}
        selectedBusinessType={selectedBusinessType}
        onCompanyChange={handleCompanyChange}
      />
    </div>
  );
};

export default AddDriver;
