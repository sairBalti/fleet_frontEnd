const VanCar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 300 150"
    width="300"
    height="150"
    fill="none"
    stroke="black"
    strokeWidth="2"
  >
    {/* Van body */}
    <rect x="20" y="50" width="240" height="60" fill="white" stroke="black" />
    
    {/* Front cabin extension */}
    <rect x="200" y="50" width="60" height="60" fill="white" stroke="black" />

    {/* Wheels */}
    <circle cx="60" cy="120" r="12" fill="black" />
    <circle cx="220" cy="120" r="12" fill="black" />
    
    {/* Side door outline */}
    <line x1="160" y1="50" x2="160" y2="110" stroke="black" strokeWidth="2" />
    
    {/* Front door outline */}
    <line x1="210" y1="50" x2="210" y2="110" stroke="black" strokeWidth="2" />
    
    {/* Windows */}
    <rect x="170" y="55" width="30" height="20" fill="black" />
    <rect x="215" y="55" width="25" height="20" fill="black" />
  </svg>
);

export default VanCar;

