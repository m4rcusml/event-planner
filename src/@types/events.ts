// @/@types/events.ts
import { Timestamp } from 'firebase/firestore';

export interface Event {
  id?: string;
  title: string;
  date: Timestamp | Date | string;
  local?: string;
  description?: string;
  userId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  guests?: {
    id: string;
    email: string;
    confirmed: boolean;
  }[]
}