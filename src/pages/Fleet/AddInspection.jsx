import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { insertInspection } from "../../services/VehicleService";
import CustomLoader from "../../components/CustomLoader";
import { useLoader } from "../../context/LoaderContext";
import InspectionForm from "../../components/InspectionForm";


const AddInspection = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader()

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    const emptyInspection = useMemo(() => ({
        vehicle_id: "",
        inspector_name: "",
        inspection_date: "",
        overall_score: "",
        result: "",
        ratings: {},
        notes: "",
        action_taken: "",
        documents: null,
    }), []);

    const handleAdd = async (formData) => {
        try {
            setLoading(true); //show loader while submitting
            await insertInspection(formData);
            navigate("/fleet/inspection");
        } catch (error) {
            console.error("Failed to add Inspection:", error);
        } finally {
            setLoading(false); // stop loader
        }
    };

    return (
        <div className="p-6 relative">
            <h2 className="text-2xl font-bold mb-4">Add Inspection</h2>
            <InspectionForm
                initialData={emptyInspection}
                onSubmit={handleAdd}
                onCancel={() => navigate("/fleet/inspection")}

            />
        </div>
    );
};

export default AddInspection;