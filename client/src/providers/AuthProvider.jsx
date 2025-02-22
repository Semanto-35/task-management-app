/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import app from '@/firebase/firebase.config';
import axios from 'axios';


// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createNewUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };


  const signInUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = async () => {
    setLoading(true);
    return signOut(auth);
  };

  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (currentUser?.email) {
        setUser(currentUser);

        // Get JWT token
        await axios.post(`${import.meta.env.VITE_API_URL}/jwt`,
          {
            email: currentUser?.email,
          },
          { withCredentials: true }
        )
      } else {
        setUser(currentUser);
        await axios.get(`${import.meta.env.VITE_API_URL}/logout`,
          {
            withCredentials: true
          }
        )
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
    }
  }, []);

  const authInfo = {
    user,
    loading,
    setUser,
    setLoading,
    createNewUser,
    signInWithGoogle,
    signInUser,
    logOut,
    updateUserProfile,
  };



  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;

