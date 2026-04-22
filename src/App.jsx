
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";
import { LoaderProvider, useLoader } from "./context/LoaderContext";
import { SessionProvider, useSession } from "./context/SessionContext";
import CustomLoader from "./components/CustomLoader";
import SessionExpirationModal from "./components/SessionExpirationModal";

const AppContent = () =>{
  const  { loading } = useLoader();
  const { sessionExpired, handleSessionExpiration, closeSessionModal } = useSession();

  useEffect(() => {
    // Listen for session expiration events
    const handleSessionExpired = () => {
      handleSessionExpiration();
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('sessionExpired', handleSessionExpired);
  }, [handleSessionExpiration]);

  return(
    <>
      {loading && <CustomLoader />}
      <SessionExpirationModal isOpen={sessionExpired} onClose={closeSessionModal} />
      <AppRoutes />
    </>
  );
};

function App() {
  return (
    <LoaderProvider>
      <Router>
        <SessionProvider>
          <AppContent />
        </SessionProvider>
      </Router>
    </LoaderProvider>
    
  );
}

export default App;
