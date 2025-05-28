import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export const usersRef = collection(db, 'users');
export const flightsRef = collection(db, 'flights');
export const bookingsRef = collection(db, 'bookings');
export const seatsRef = collection(db, 'seats');

// User Functions
export const createUserProfile = async (userId, userData) => {
  const userRef = doc(usersRef, userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Flight Functions
export const getFlight = async (flightId) => {
  const flightRef = doc(flightsRef, flightId);
  const flightSnap = await getDoc(flightRef);
  return flightSnap.exists() ? flightSnap.data() : null;
};

export const getAvailableFlights = async () => {
  const q = query(flightsRef, where('status', '==', 'scheduled'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Booking Functions
export const createBooking = async (bookingData) => {
  const bookingRef = doc(bookingsRef);
  await setDoc(bookingRef, {
    ...bookingData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return bookingRef.id;
};

export const updateBookingStatus = async (bookingId, status) => {
  const bookingRef = doc(bookingsRef, bookingId);
  await updateDoc(bookingRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

// Seat Functions
export const getAvailableSeats = async (flightId) => {
  const q = query(seatsRef, 
    where('flightId', '==', flightId),
    where('status', '==', 'available')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const reserveSeat = async (seatId, bookingId) => {
  const seatRef = doc(seatsRef, seatId);
  await updateDoc(seatRef, {
    status: 'reserved',
    bookingId,
    updatedAt: serverTimestamp()
  });
}; 