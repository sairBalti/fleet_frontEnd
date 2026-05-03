import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SortIcons from "../../components/SortIcons";
import { createBranchAI, getBranchList, previewBranchAI } from "../../services/businessService";
import Dropdown from "../../components/Dropdown";
import Pagination from "../../components/Pagination";
import AICommandBar from "../../components/AiCommandBar";
import { getUserData } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import BranchPreviewModal from "../../components/BranchPreviewModal";

const BranchList = () => {

    const [nameFilter, setNameFilter] = useState("");
    const [statusFilter, SetStatusFilter] = useState("");

    const [userRole, setUserRole] = useState(null);
    const [companyId, setCompanyId] = useState(null);

    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const totalPages = Math.ceil(totalRecords / pageSize)

    const [sortColumn, setSortColumn] = useState("");
    const [sortDirection, setSortDirection] = useState("");


    const [previewData, setPreviewData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalErrors, setModalErrors] = useState({});

    const [resetCommandBar, setResetCommandBar] = useState(false); // NEW
    const [companyMeta, setCompanyMeta] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const companyName = location.state?.companyName ||
        companyMeta?.company_name ||
        "Branches";
    const companyIdFromRoute = location.state?.companyId;
    console.log("ROUTE companyId:", companyIdFromRoute);

    // Get user data on component mount
    useEffect(() => {
        const userData = getUserData();

        if (userData) {
            setUserRole(userData.role);
            setCompanyId(userData.company_id);
        }
    }, []);


    useEffect(() => {
        if (userRole === "BranchManager") {
            navigate("/branches");
        }
    }, [userRole]);
    // Fetch Data
    const fetchBranches = async () => {
        try {
            setLoading(true);

            const payload = {
                pageNumber,
                pageSize,
                sortColumn,
                sortDirection,
                branchNameFilter: nameFilter || null,
                statusFilter: statusFilter || null,
                companyId: userRole === "BranchManager"
                    ? null
                    : companyIdFromRoute || null
            };

            const response = await getBranchList(payload);

            setBranches(response.data);
            setTotalRecords(response.pagination.totalRecords);
            setCompanyMeta(response.companyMeta);
        } catch (error) {
            console.error("Error fetching branch list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, [pageNumber, pageSize, sortColumn, sortDirection, nameFilter, statusFilter, companyId]);

    // Sorting
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
        } else {
            setSortColumn(column);
            setSortDirection("ASC");
        }
    };

    const statusOptions = [
        { id: "1", name: "Active" },
        { id: "0", name: "Inactive" }
    ];

    const isBranchAIAllowed = ["SuperAdmin", "CompanyAdmin", "CompanyManager"].includes(userRole);

    const handlePreview = async ({ message, file }) => {
        if (!message && !file) return;

        const msg = (message || "").toLowerCase();
        const directAction =
            msg.includes("update") ||
            msg.includes("edit") ||
            msg.includes("deactivate") ||
            msg.includes("inactive") ||
            msg.includes("activate");

        try {
            setModalErrors({});

            if (file) {
                await createBranchAI({
                    message,
                    data: {
                        file,
                        company_id: companyIdFromRoute || companyId || null,
                    },
                });
                fetchBranches();
                setResetCommandBar((previous) => !previous);
                return;
            }

            if (directAction) {
                await createBranchAI({ message });
                fetchBranches();
                setResetCommandBar((previous) => !previous);
                return;
            }

            const res = await previewBranchAI({ message });
            if (res.success) {
                const preview = {
                    ...res.preview,
                    action: res.preview.action || "CREATE_BRANCH",
                    company_id: res.preview.company_id || companyIdFromRoute || companyId || "",
                };
                setPreviewData(preview);
                setShowModal(true);
            }
        } catch (err) {
            const apiError = err?.response?.data || err;
            setModalErrors({
                general: apiError?.message || "Unable to process branch AI command",
            });
        }
    };

    const handleSave = async (updatedData) => {
        try {
            setModalErrors({});
            await createBranchAI({
                data: {
                    action: updatedData.action || "CREATE_BRANCH",
                    company_id: updatedData.company_id || companyIdFromRoute || companyId,
                    branch_name: updatedData.branch_name,
                    branch_location: updatedData.branch_location,
                },
            });
            setShowModal(false);
            fetchBranches();
            setResetCommandBar((previous) => !previous);
        } catch (err) {
            const apiError = err?.response?.data || err;
            setModalErrors({
                general: apiError?.message || "Unable to save branch action",
            });
        }
    };

    return (
        <div className="space-y-4">

            {isBranchAIAllowed && (
                <div className="p-6 bg-gray-50 flex justify-end">
                    <AICommandBar
                        placeholder="Add branch Lahore Central at Lahore for company 4 or upload branch CSV"
                        onExecute={handlePreview}
                        onSuccess={() => fetchBranches()}
                        onError={(err) => console.error(err)}
                        resetTrigger={resetCommandBar}
                        disabled={showModal}
                    />
                </div>
            )}

            {modalErrors?.general && (
                <div className="bg-red-50 border border-red-300 p-3 rounded text-sm mt-2">
                    <p className="text-red-600 font-semibold">{modalErrors.general}</p>
                </div>
            )}

            <div>
                <h1>{companyName} - Branch List</h1>
                {/* Add your branch list content here */}
            </div>
            {/* 🔹 FILTERS */}
            <div className="flex flex-col gap-3 bg-gray-50 p-4 sm:flex-row sm:items-end sm:p-6">
                <input
                    type="text"
                    placeholder="search branch"
                    className="w-full rounded border p-2 text-sm text-gray-700 focus:border-blue-200 focus:outline-none focus:ring-1 sm:min-w-0 sm:flex-1"
                    value={nameFilter}
                    onChange={(e) => {
                        setPageNumber(1);
                        setNameFilter(e.target.value);
                    }}
                />
                <Dropdown
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(val) => {
                        setPageNumber(1);
                        SetStatusFilter(val);
                    }}
                    placeholder="All Status"
                    className="w-full min-w-0 shrink-0 sm:w-52"
                />
            </div>



            <div className="bg-white overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-indigo-50 sticky top-0">
                            <tr>
                                <th className="p-3 ">
                                    #
                                </th>

                                {["branch_name", "branch_location", "created_at", "status_name"].map(col => (
                                    <th
                                        key={col}
                                        className="p-3 cursor-pointer"
                                        onClick={() => handleSort(col)}
                                    >
                                        <span className="flex items-center gap-1">
                                            {col.replaceAll("_", " ")}
                                            <SortIcons
                                                active={sortColumn === col}
                                                direction={sortDirection}
                                            />
                                        </span>
                                    </th>
                                ))}


                                <th className="text-center"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                    </tr>
                                ))
                            ) : branches.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-400">
                                        No branch found
                                    </td>
                                </tr>
                            ) : (
                                branches.map((item, index) => (
                                    <tr key={item.branch_id} className="border-t">
                                        <td className="p-4 text-center font-semibold">
                                            {(pageNumber - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="p-3">{item.branch_name}</td>
                                        <td className="p-3">{item.branch_location}</td>
                                        <td className="p-3">{new Date(item.created_at).toLocaleString()}</td>
                                        <td className="p-3 ">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status_name === "Active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.status_name}
                                            </span>
                                        </td>
                                        <td></td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination
                currentPage={pageNumber}
                totalPages={totalPages}
                totalEntries={totalRecords}
                pageSize={pageSize}
                onPageChange={(page) => setPageNumber(page)}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPageNumber(1);
                }}
            />

            {showModal && (
                <BranchPreviewModal
                    data={previewData}
                    errors={modalErrors}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}

        </div>
    );
};

export default BranchList;