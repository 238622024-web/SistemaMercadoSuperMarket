import { createContext } from 'react';

export const AuthContext = createContext({
  userProfile: null,
  signOut: () => {}
});
