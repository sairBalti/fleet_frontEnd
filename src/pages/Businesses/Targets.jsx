import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { format } from "date-fns";
import SortIcons from "../../components/SortIcons";
import DateRangeFilter from "../../components/DateRangeFilter";
import Dropdown from "../../components/Dropdown";
import Pagination from "../../components/Pagination";
import { getDemoRequests } from "../../services/businessService";

const businessTypeOptions = [
  { id: "Logistics", name: "Logistics" },
  { id: "Transportations", name: "Transportations" },
  { id: "Delivery Services", name: "Delivery Services" },
  { id: "Constructions", name: "Constructions" },
  { id: "Maintaniance Services", name: "Maintaniance Services" },
  { id: "Rental Services", name: "Rental Services" },
  { id: "Public Transport", name: "Public Transport" },
];

const Targets = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("DESC");

  const totalPages = Math.ceil(totalRecords / pageSize);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const payload = {
        pageNumber,
        pageSize,
        sortColumn,
        sortDirection,
        nameFilter: nameFilter || null,
        emailFilter: emailFilter || null,
        businessTypeFilter: businessTypeFilter || null,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
      };

      const response = await getDemoRequests(payload);
      setRequests(response.data || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching demo requests:", error);
      setRequests([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [pageNumber, pageSize, sortColumn, sortDirection, nameFilter, emailFilter, businessTypeFilter, startDate, endDate]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
      return;
    }
    setSortColumn(column);
    setSortDirection("ASC");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Search name"
          className="border p-2 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:border-blue-200 w-full"
          value={nameFilter}
          onChange={(event) => {
            setPageNumber(1);
            setNameFilter(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Search email"
          className="border p-2 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:border-blue-200 w-full"
          value={emailFilter}
          onChange={(event) => {
            setPageNumber(1);
            setEmailFilter(event.target.value);
          }}
        />
        <Dropdown
          options={businessTypeOptions}
          value={businessTypeFilter}
          onChange={(value) => {
            setPageNumber(1);
            setBusinessTypeFilter(value);
          }}
          placeholder="All Business Types"
          className="w-full min-w-0 md:max-w-none"
        />
        <DateRangeFilter
          placeholder="Filter by request date"
          allowFuture={true}
          onChange={({ start, end }) => {
            setPageNumber(1);
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>

      <div className="bg-white overflow-x-auto">
        <div className="max-h-[520px] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 sticky top-0">
              <tr>
                <th className="p-3">#</th>
                {[
                  ["full_name", "full name"],
                  ["email", "email"],
                  ["company_name", "company name"],
                  ["business_type", "business type"],
                  ["fleet_size", "fleet size"],
                  ["preferred_date", "preferred date"],
                  ["created_at", "requested at"],
                ].map(([column, label]) => (
                  <th key={column} className="p-3 cursor-pointer" onClick={() => handleSort(column)}>
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcons active={sortColumn === column} direction={sortDirection.toLowerCase()} />
                    </span>
                  </th>
                ))}
                <th className="p-3">goals</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3"><Skeleton /></td>
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
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-400">
                    No demo requests found
                  </td>
                </tr>
              ) : (
                requests.map((item, index) => (
                  <tr key={item.id} className="border-t align-top">
                    <td className="p-3 text-center font-semibold">{(pageNumber - 1) * pageSize + index + 1}</td>
                    <td className="p-3">{item.full_name}</td>
                    <td className="p-3">{item.email}</td>
                    <td className="p-3">{item.company_name}</td>
                    <td className="p-3">{item.business_type}</td>
                    <td className="p-3">{item.fleet_size || "-"}</td>
                    <td className="p-3">{item.preferred_date ? format(new Date(item.preferred_date), "yyyy-MM-dd") : "-"}</td>
                    <td className="p-3">{new Date(item.created_at).toLocaleString()}</td>
                    <td className="p-3 max-w-[280px]">{item.goals || "-"}</td>
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
        onPageChange={setPageNumber}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNumber(1);
        }}
      />
    </div>
  );
};

export default Targets;
