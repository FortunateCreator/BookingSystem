import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Room, Booking, Transaction } from '../types';

export function useGuestData(userId: string | undefined) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pathRooms = 'rooms';
    // Only show available rooms
    const qRooms = query(collection(db, pathRooms), where('status', '==', 'Available'));
    const unsubRooms = onSnapshot(qRooms, (snap) => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, pathRooms));

    let unsubBookings = () => {};
    if (userId) {
      const pathBookings = 'bookings';
      const qBookings = query(
        collection(db, pathBookings), 
        where('guestId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      unsubBookings = onSnapshot(qBookings, (snap) => {
        setMyBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
        setLoading(false);
      }, (err) => handleFirestoreError(err, OperationType.LIST, pathBookings));
    } else {
      setLoading(false);
    }

    return () => {
      unsubRooms();
      unsubBookings();
    };
  }, [userId]);

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>, room: Room) => {
    const pathBookings = 'bookings';
    const pathTransactions = 'transactions';
    try {
      // 1. Create Booking
      const bookingRef = await addDoc(collection(db, pathBookings), {
        ...bookingData,
        createdAt: new Date().toISOString()
      });

      // 2. Create Transaction for Investor
      const investorAmount = bookingData.totalAmount * room.revenueSplit;
      const resortAmount = bookingData.totalAmount * (1 - room.revenueSplit);

      const transaction: Omit<Transaction, 'id'> = {
        bookingId: bookingRef.id,
        roomId: room.id,
        investorAmount,
        resortAmount,
        type: 'Revenue',
        date: new Date().toISOString()
      };

      await addDoc(collection(db, pathTransactions), transaction);

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathBookings);
    }
  };

  return { rooms, myBookings, loading, createBooking };
}
