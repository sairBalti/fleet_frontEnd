const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalEntries,
  onPageSizeChange,
}) => {
  const pageNumbers = [];

  if (totalEntries > 0) {
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pageNumbers.push(i);
      } else if (
        (i === currentPage - 2 && i > 1) ||
        (i === currentPage + 2 && i < totalPages)
      ) {
        pageNumbers.push("...");
      }
    }
  }

  const noRecords = totalEntries === 0;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Show Entries */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500 text-center">Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={noRecords}
          className="border rounded px-2 py-1 focus:outline-none focus:ring-1 text-sm text-gray-500 text-center"
        >
          {[20, 5, 10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="text-sm text-gray-500">
          entries of {totalEntries} entries
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        <button
          disabled={noRecords || currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2 py-0.5 border rounded disabled:opacity-50"
        >
          &lt;
        </button>

        {!noRecords &&
          pageNumbers.map((num, i) =>
            num === "..." ? (
              <span key={i} className="px-2 py-1 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={i}
                onClick={() => onPageChange(num)}
                className={`px-2 py-0.5 border rounded ${
                  num === currentPage ? "bg-blue-500 text-white" : "text-gray-500"
                }`}
              >
                {num}
              </button>
            )
          )}

        <button
          disabled={noRecords || currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2 py-0.5 border rounded disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
