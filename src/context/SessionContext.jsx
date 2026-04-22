import React, { createContext, useContext, useState, useCallback } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionExpired, setSessionExpired] = useState(false);

  const handleSessionExpiration = useCallback(() => {
    setSessionExpired(true);
  }, []);

  const closeSessionModal = useCallback(() => {
    setSessionExpired(false);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionExpired, handleSessionExpiration, closeSessionModal }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
