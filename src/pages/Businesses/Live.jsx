import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AddButton from "../../components/AddButton";
import Checkbox from "../../components/Checkbox";
import SortIcons from "../../components/SortIcons";
import { createCompanyAI, getCompanyList, previewCompanyAI } from "../../services/businessService";
import Dropdown from "../../components/Dropdown";
import DateRangeFilter from "../../components/DateRangeFilter";
import { format, set } from "date-fns";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import Pagination from "../../components/Pagination";
import AICommandBar from "../../components/AiCommandBar";
import { getUserData } from "../../utils/auth";
import PreviewModal from "../../components/PreviewModal";
import { useNavigate } from "react-router-dom";

const Live = () => {

    const [nameFilter, setNameFilter] = useState("");
    const [statusFilter, SetStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [companyId, setCompanyId] = useState(null);

    const [business, setBusiness] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const totalPages = Math.ceil(totalRecords / pageSize)

    const [sortColumn, setSortColumn] = useState("");
    const [sortDirection, setSortDirection] = useState("");

    const [selectAll, setSelectAll] = useState(false);

    const [previewData, setPreviewData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalErrors, setModalErrors] = useState({});

    const [resetCommandBar, setResetCommandBar] = useState(false); // NEW

    const navigate = useNavigate();

    // Get user data on component mount
    useEffect(() => {
        const userData = getUserData();
        if (userData) {
            setUserRole(userData.role);
            setCompanyId(userData.company_id);
        }
    }, []);

    // Fetch Data
    const fetchBusiness = async () => {
        try {
            setLoading(true);

            const payload = {
                pageNumber,
                pageSize,
                sortColumn,
                sortDirection,
                nameFilter: nameFilter || null,
                statusFilter: statusFilter || null,
                startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
                endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
                // For CompanyAdmin, filter by their company
                companyId: userRole === "CompanyAdmin" ? companyId : null
            };

            const response = await getCompanyList(payload);

            setBusiness(response.data);
            setTotalRecords(response.pagination.totalRecords)
        } catch (error) {
            console.error("Error fetching company list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusiness();
    }, [pageNumber, pageSize, sortColumn, sortDirection, nameFilter, statusFilter, startDate, endDate, userRole, companyId]);

    // Select All
    const handleSelectAll = () => {
        setSelectAll(!selectAll);
    };

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
    const handlePreview = async ({ message, file }) => {

        // =========================
        //  FILE FLOW (NO MODAL)
        // =========================
        if (file) {
            try {
                setModalErrors({});

                await createCompanyAI({
                    message: null,
                    file
                });

                fetchBusiness();

                // reset command bar
                setResetCommandBar(prev => !prev);

            } catch (err) {
                const apiError = err.response?.data;

                setModalErrors({
                    general: apiError?.message,
                    details: apiError?.details || []
                }); c
            }

            return;
        }
        const msg = message.toLowerCase();

        if (msg.includes("update") || msg.includes("edit") ||
            msg.includes("activate") ||
            msg.includes("deactivate") || msg.includes("inactivate")) {

            try {
                await createCompanyAI({ message });

                fetchBusiness();
                setResetCommandBar(prev => !prev);

            } catch (err) {
                const apiError = err.response?.data;

                setModalErrors({
                    general: apiError?.message
                });
            }

            return;
        }

        // =========================
        // TEXT FLOW (MODAL)
        // =========================
        const res = await previewCompanyAI({ message });

        if (res.success) {
            setPreviewData(res.preview);
            setShowModal(true);
        }
    };
    const handleConfirm = async () => {
        await createCompanyAI(previewData)
        setShowModal(false);

        fetchBusiness();
    }

    const handleSave = async (updatedData) => {
        try {
            setModalErrors({});

            await createCompanyAI({
                message: "",      // no command
                file: null,
                data: updatedData
            });

            setShowModal(false);
            fetchBusiness();
            setResetCommandBar(prev => !prev);

        } catch (err) {
            const apiError = err?.response?.data || err;

            if (apiError?.field) {
                setModalErrors({
                    [apiError.field]: apiError.message
                });
            } else {
                setModalErrors({
                    general: apiError?.message || "Something went wrong"
                });
            }
        }
    };


    return (
        <div className="space-y-4">
            {
                userRole === "SuperAdmin" && (
                    <div className="flex w-full justify-end bg-gray-50 p-4 sm:p-6">
                        <AICommandBar
                            placeholder="Add company Faisal Movers with transportation"
                            onExecute={handlePreview}   // important
                            onSuccess={() => fetchBusiness()}
                            onError={(err) => console.error(err)}
                            resetTrigger={resetCommandBar}
                            disabled={showModal}
                            maxWidthClass="w-full max-w-2xl"
                        />
                    </div>

                )}
            {modalErrors?.general && (
                <div className="bg-red-50 border border-red-300 p-3 rounded text-sm mt-2">

                    <p className="text-red-600 font-semibold">
                        {modalErrors.general}
                    </p>

                    {/* 🔥 ROW LEVEL ERRORS */}
                    {modalErrors.details?.map((err, index) => (
                        <div key={index} className="text-xs text-red-500 mt-1">
                            Row {err.row}, Column "{err.column}" → {err.message}
                        </div>
                    ))}

                </div>
            )}


            {/* 🔹 FILTERS */}
            <div className="flex flex-col gap-4 bg-gray-50 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                <div className="min-w-0 flex-1">
                    <input
                        type="text"
                        placeholder="search business"
                        className="w-full rounded border p-2 text-sm text-gray-700 focus:border-blue-200 focus:outline-none focus:ring-1"
                        value={nameFilter}
                        onChange={(e) => {
                            setPageNumber(1);
                            setNameFilter(e.target.value);
                        }}
                    />

                </div>
                <div className="flex flex-wrap items-end justify-start gap-3 sm:justify-end">
                    <Dropdown
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(val) => {
                            setPageNumber(1);
                            SetStatusFilter(val);
                        }}
                        placeholder="All Status"
                        className="w-full min-w-0 sm:w-52"
                    />
                    <DateRangeFilter
                        placeholder="filter by created date"
                        onChange={({ start, end }) => {
                            setPageNumber(1)
                            setStartDate(start)
                            setEndDate(end)

                        }}
                        allowFuture={true}
                    />
                </div>
            </div>



            <div className="bg-white overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-indigo-50 sticky top-0">
                            <tr>
                                <th className="p-3 ">
                                    #
                                </th>

                                {["company_name", "business_type_name", "number_of_branches", "total_admins", "created_at", "status_name"].map(col => (
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
                                [...Array(7)].map((_, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                        <td className="p-3"><Skeleton /></td>
                                    </tr>
                                ))
                            ) : business.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-4 text-center text-gray-400">
                                        No businesses found
                                    </td>
                                </tr>
                            ) : (
                                business.map((item, index) => (
                                    <tr key={item.company_id} className="border-t">
                                        <td className="p-4 text-center font-semibold">
                                            {(pageNumber - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="p-3">{item.company_name}</td>
                                        <td className="p-3">{item.business_type_name}</td>
                                        <td className="p-3">
                                            <div
                                                className="group flex items-center gap-2 cursor-pointer  text-indigo-600  cursor-pointer hover:text-indigo-800 transition"
                                                 onClick={() => navigate(`/branches`, { state: { companyName: item.company_name, companyId: item.company_id } })}
                                            >
                                                <span className="underline">{item.number_of_branches}</span>

                                                {/* Arrow */}
                                                <span className="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200 text-indigo-600">
                                                    →
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3">{item.total_admins}</td>
                                        <td className="p-3">
                                            {new Date(item.created_at).toLocaleString()}
                                        </td>
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


            {/* PREVIEW MODAL (CORRECT PLACE) */}
            {showModal && (
                <PreviewModal
                    data={previewData}
                    errors={modalErrors}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}

        </div>
    );
};

export default Live;