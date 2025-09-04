import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const value = {
    userData,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthCtx = () => useContext(AuthContext);

export default AuthProvider;
