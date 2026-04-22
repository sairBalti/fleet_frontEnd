import { useState, useEffect, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import venDaigram from '../../assets/car2.svg';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Modal from '../../components/Modal';
import { getVehicleInspection } from "../../services/VehicleService";
import VanCar from '../../components/vanCar';
import AddButton from '../../components/AddButton';
import { useNavigate } from 'react-router-dom';

const FleetInspectionDetails = () => {
  const [inspectionList, setInspectionList] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInspectionData();
  }, []);

  const fetchInspectionData = async () => {
    try {
      const data = await getVehicleInspection();
      setInspectionList(data); // this should be an array of inspection detail objects
    } catch (error) {
      console.error("Error fetching inspections:", error);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedInspection(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInspection(null);
  };
  // Keep your existing scroll handler
  const handleContainerScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollTop + container.clientHeight >= container.scrollHeight - 100;

    if (isNearBottom && visibleCount < inspectionList.length) {
      setVisibleCount((prev) => prev + 6);
    }
  };

  const HandleAddInspection = () =>{
    navigate("/add-inspection");

  }



  // Add a separate useEffect at the component level
  useEffect(() => {
    const container = containerRef.current;
    if (container && container.scrollHeight <= container.clientHeight) {
      // If not scrollable, load more until it becomes scrollable
      if (visibleCount < inspectionList.length) {
        setVisibleCount((prev) => prev + 6);
      }
    }
  }, [inspectionList, visibleCount]);

  return (
    <div className=''>
      <div className='bg-white p-4 shadow rounded flex justify-end mb-4 pr-[1.5rem]'>
        <AddButton label='Add Inspection' onClick={HandleAddInspection}/>


      </div>
      <div
        className="h-[calc(100vh-100px)] overflow-y-auto pr-2"
        onScroll={handleContainerScroll}
        ref={containerRef}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-6">
          {inspectionList.slice(0, visibleCount).map((item, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-3 relative">
              <h1 className="text-sm font-medium text-green-600">{item.inspectionInfo.inspection_result}</h1>
              <div className='flex justify-between items-center pr-12 '>
                <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-700 ">
                  <div className="flex gap-4"><span className="font-medium">Inspection ID:</span><span>{item.inspectionInfo.inspection_id}</span></div>
                  <div className="flex gap-4"><span className="font-medium">Fleet:</span><span>{item.inspectionInfo.fleet}</span></div>
                  <div className="flex gap-4"><span className="font-medium">Inspector:</span><span>{item.inspectionInfo.inspector_name}</span></div>
                  <div className="flex gap-4"><span className="font-medium">Date:</span><span>{item.inspectionInfo.inspection_date}</span></div>
                </div>
                <div className="w-16 h-16">
                  <CircularProgressbar
                    value={parseFloat(item.inspectionInfo.overall_score)}
                    maxValue={5}
                    text={`${item.inspectionInfo.overall_score}/5`}
                  />
                </div>
              </div>

              {/* Rating Stars */}
              <div className="mt-4 grid grid-cols-4 gap-1 text-sm">
                {item.ratings.map((r, i) => (
                  <div key={i}>
                    <span className="text-gray-500">{r.category}</span>
                    <div className="text-yellow-400">
                      {[...Array(parseInt(r.rating))].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* View Details Link */}
              <div className="mt-4 text-right">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenModal(item);
                  }}
                  className="text-blue-500 font-medium hover:underline text-sm"
                >
                  Detail View
                </a>
              </div>
            </div>
          ))}

          {/* Modal */}
          {isModalOpen && selectedInspection && (
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
              <div className="space-y-4"> {/* controls spacing between sections */}

                {/* Rating Guide */}
                <div>
                  <h4 className="font-semibold mb-1">Rating Guide</h4>
                  <div className="w-full h-5 bg-gradient-to-r from-blue-700 to-blue-100 rounded-full relative">
                    {selectedInspection.rating_guide.map((guide, index) => (
                      <span
                        key={index}
                        className="absolute text-white text-xs pl-2"
                        style={{ left: `${(index / selectedInspection.rating_guide.length) * 100}%` }}
                      >
                        {guide.max_value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SVG Car
              <div className="relative">
                <img src="/src/assets/4f22244e-1ed6-4b0e-ab72-6192e72ebab7_removalai_preview.png" alt="Van Logo" />
                <div className="absolute top-[20%] left-[30%] text-green-500 text-xl"><i className="fas fa-info-circle"></i></div>
                <div className="absolute top-[40%] left-[45%] text-red-500 text-xl"><i className="fas fa-exclamation-circle"></i></div>
              </div> */}

                {/* Documents and Notes Section (merged together to remove spacing between them) */}
                <div className="">
                  {/* PDF Documents */}
                  <div>
                    <h4 className="font-semibold mb-2">Documents of Inspection</h4>
                    <div className="flex flex-wrap gap-4">
                      {selectedInspection.documents && selectedInspection.documents.length > 0 ? (
                        selectedInspection.documents.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-100 p-2 rounded shadow text-center w-24"
                          >
                            <div className="bg-red-500 text-white font-bold px-4 py-2 rounded">PDF</div>
                            <p className="text-xs mt-2 break-words text-gray-700">{doc.file_name}</p>
                          </a>
                        ))
                      ) : (
                        <p className="text-sm text-gray-700">No documents available.</p>
                      )}
                    </div>
                  </div>

                  {/* Notes & Action */}
                  <div>
                    <h4 className="font-semibold mb-2">Notes And Comments</h4>
                    <p className="text-sm text-gray-700 mb-4">
                      {selectedInspection.inspectionInfo.notes}
                    </p>

                    <h4 className="font-semibold mb-2">Action Taken</h4>
                    <p className="text-sm text-gray-700">
                      {selectedInspection.inspectionInfo.action_taken}
                    </p>
                  </div>
                </div>

              </div>

            </Modal>
          )}
        </div>

      </div>
    </div>

      );
};

      export default FleetInspectionDetails;



