import { useEffect, useState } from "react";
import { getFleetOverview } from "../../services/VehicleService";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import SortIcons from "../../components/SortIcons";
import Pagination from "../../components/Pagination";
import MaintenanceTable from "../../components/maintenanceTable";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFE"];

const FleetOverview = () => {
    const [data, setData] = useState({ maintenanceAlerts: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [sortColumn, setSortColumn] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");
    const [skeleton, setSkeleton] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, [currentPage, pageSize, sortColumn, sortDirection]);

    const fetchOverview = async () => {
        setSkeleton(true);
        try {
            const request = {
                pageNumber: currentPage,
                pageSize,
                sortBy: sortColumn,
                sortDirection,
            };
            const response = await getFleetOverview(request);
            setData(response);
            setTotalEntries(response.totalRecords);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Error fetching fleet overview:", error);
        } finally {
            setSkeleton(false);
        }
    };
    return (
        <div className="space-y-3">
            <h2 className="text-2xl font-bold pt-4">Fleet Overview</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {skeleton
                    ? ["bg-blue-50", "bg-green-50", "bg-yellow-50", "bg-red-50", "bg-purple-50"].map((bgColor, i) => (
                        <div key={i} className={`shadow rounded p-4 space-y-2 ${bgColor}`}>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-8 bg-gray-300 rounded w-2/3"></div>
                        </div>
                    ))
                    : [
                        { key: "totalVehicles", label: "Total Vehicles" },
                        { key: "activeVehicles", label: "Active" },
                        { key: "maintenanceVehicles", label: "Maintenance" },
                        { key: "unavailableVehicles", label: "Unavailable" },
                        { key: "registeredThisMonth", label: "Registered This Month" },
                    ].map(({ key, label }, index) => {
                        const bgColors = [
                            "bg-blue-100",
                            "bg-green-100",
                            "bg-yellow-100",
                            "bg-red-100",
                            "bg-purple-100",
                        ];
                        return (
                            <div key={key} className={`shadow rounded p-4 text-center ${bgColors[index]}`}>
                                <p className="text-gray-500 text-sm">{label}</p>
                                <p className="text-2xl font-bold">{data.summaryStats?.[key] ?? "-"}</p>
                            </div>
                        );
                    })}
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-4 shadow rounded">
                <h3 className="text-lg font-semibold mb-2">Fuel Type Distribution</h3>
                {skeleton ? (
                    <div className="flex justify-center items-center h-[300px]">
                        <div className="w-40 h-40 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.fuelDistribution.map((item) => ({
                                    name: item.fuel_type,
                                    value: item.count,
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label
                            >
                                {data.fuelDistribution.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
            <MaintenanceTable />
        </div>
    );
};

export default FleetOverview;
