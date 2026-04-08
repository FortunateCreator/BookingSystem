import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Room, Booking, AvailabilityOverride, Transaction, MaintenanceLog } from '../types';
import { useAuth } from '../components/AuthProvider';

export function useInvestorData() {
  const { user, isInvestor } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isInvestor) return;

    const pathRooms = 'rooms';
    const qRooms = query(collection(db, pathRooms), where('investorId', '==', user.uid));
    
    const unsubRooms = onSnapshot(qRooms, (snapshot) => {
      const roomData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomData);
      
      if (roomData.length === 0) {
        setLoading(false);
        return;
      }

      const roomIds = roomData.map(r => r.id);

      // Bookings
      const pathBookings = 'bookings';
      const qBookings = query(collection(db, pathBookings), where('roomId', 'in', roomIds), orderBy('startDate', 'desc'));
      const unsubBookings = onSnapshot(qBookings, (snap) => {
        setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, pathBookings));

      // Overrides
      const pathOverrides = 'availability_overrides';
      const qOverrides = query(collection(db, pathOverrides), where('investorId', '==', user.uid));
      const unsubOverrides = onSnapshot(qOverrides, (snap) => {
        setOverrides(snap.docs.map(d => ({ id: d.id, ...d.data() } as AvailabilityOverride)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, pathOverrides));

      // Transactions
      const pathTransactions = 'transactions';
      const qTransactions = query(collection(db, pathTransactions), where('roomId', 'in', roomIds), orderBy('date', 'desc'));
      const unsubTransactions = onSnapshot(qTransactions, (snap) => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, pathTransactions));

      // Maintenance
      const pathMaintenance = 'maintenance_logs';
      const qMaintenance = query(collection(db, pathMaintenance), where('roomId', 'in', roomIds), orderBy('date', 'desc'));
      const unsubMaintenance = onSnapshot(qMaintenance, (snap) => {
        setMaintenanceLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceLog)));
        setLoading(false);
      }, (err) => handleFirestoreError(err, OperationType.LIST, pathMaintenance));

      return () => {
        unsubBookings();
        unsubOverrides();
        unsubTransactions();
        unsubMaintenance();
      };
    }, (err) => handleFirestoreError(err, OperationType.LIST, pathRooms));

    return () => unsubRooms();
  }, [user, isInvestor]);

  const requestBlock = async (roomId: string, startDate: string, endDate: string, reason: string) => {
    if (!user) return;

    // Conflict check
    const bookingsSnap = await getDocs(query(
      collection(db, 'bookings'),
      where('roomId', '==', roomId),
      where('status', '==', 'Confirmed')
    ));

    const hasConflict = bookingsSnap.docs.some(doc => {
      const b = doc.data() as Booking;
      return (startDate < b.endDate && endDate > b.startDate);
    });

    if (hasConflict) {
      throw new Error('Conflict detected with an existing guest booking.');
    }

    const path = 'availability_overrides';
    try {
      await addDoc(collection(db, path), {
        roomId,
        investorId: user.uid,
        startDate,
        endDate,
        status: 'Pending_Admin',
        type: 'Block',
        reason,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  return { rooms, bookings, overrides, transactions, maintenanceLogs, loading, requestBlock };
}
