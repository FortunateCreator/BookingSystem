import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User, Room, AvailabilityOverride, Booking } from '../types';

export function useAdminData() {
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pathUsers = 'users';
    const unsubUsers = onSnapshot(collection(db, pathUsers), (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as User)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, pathUsers));

    const pathRooms = 'rooms';
    const unsubRooms = onSnapshot(collection(db, pathRooms), (snap) => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, pathRooms));

    const pathBookings = 'bookings';
    const unsubBookings = onSnapshot(query(collection(db, pathBookings), orderBy('createdAt', 'desc')), (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, pathBookings));

    const pathOverrides = 'availability_overrides';
    const unsubOverrides = onSnapshot(collection(db, pathOverrides), (snap) => {
      setOverrides(snap.docs.map(d => ({ id: d.id, ...d.data() } as AvailabilityOverride)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, pathOverrides));

    return () => {
      unsubUsers();
      unsubRooms();
      unsubBookings();
      unsubOverrides();
    };
  }, []);

  const createRoom = async (roomData: Omit<Room, 'id'>) => {
    const path = 'rooms';
    try {
      await addDoc(collection(db, path), roomData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    const path = 'users';
    try {
      await updateDoc(doc(db, path, userId), { role });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleOverride = async (overrideId: string, status: 'Approved' | 'Rejected') => {
    const path = 'availability_overrides';
    try {
      await updateDoc(doc(db, path, overrideId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const inviteUser = async (email: string, name: string, role: User['role']) => {
    const path = 'invitations';
    try {
      await setDoc(doc(db, path, email.toLowerCase()), {
        email: email.toLowerCase(),
        name,
        role,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  return { users, rooms, overrides, bookings, loading, createRoom, updateUserRole, handleOverride, inviteUser };
}
