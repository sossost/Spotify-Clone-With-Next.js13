"use client";

import { MyUserContextProvider } from "@/hooks/useUser";

interface UsersProviderProps {
  children: React.ReactNode;
}

const UserProvider: React.FC<UsersProviderProps> = ({ children }) => {
  return <MyUserContextProvider>{children}</MyUserContextProvider>;
};

export default UserProvider;
