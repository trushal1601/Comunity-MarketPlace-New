import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export const AuthService = {
  async register(email, password, fullName, profileImageBase64 = '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366F1&color=fff&size=200`;
      const firestorePhotoURL = profileImageBase64 || defaultPhotoURL;
      const now = Date.now();
      let warning = '';

      // Keep Firebase Auth profile URL lightweight and stable.
      try {
        await updateProfile(user, {
          displayName: fullName,
          photoURL: defaultPhotoURL
        });
      } catch (profileError) {
        warning = profileError?.message || 'Profile update partially failed';
      }

      try {
        await setDoc(doc(db, 'Users', user.email), {
          displayName: fullName,
          email: user.email,
          photoURL: firestorePhotoURL,
          createdAt: now,
          updatedAt: now
        });
      } catch (userDocError) {
        // Fallback to default avatar if large base64 photo fails Firestore validation/size.
        await setDoc(doc(db, 'Users', user.email), {
          displayName: fullName,
          email: user.email,
          photoURL: defaultPhotoURL,
          createdAt: now,
          updatedAt: now
        });
        warning = warning || 'Profile photo could not be saved. Default avatar applied.';
      }

      return { success: true, user, warning };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return 'An error occurred. Please try again';
    }
  }
};
