import { create } from "zustand";

type User = {
  id: number;
  username: string;
  email: string;
};

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  user_id: number;
  created_at: string;
};

type Store = {
  user: User | null;
  tickets: Ticket[];
  setUser: (user: User) => void;
  setTickets: (tickets: Ticket[]) => void;
  logout: () => void;
};

export const useStore = create<Store>((set) => ({
  user: null,
  tickets: [],
  setUser: (user) => set({ user }),
  setTickets: (tickets) => set({ tickets }),
  logout: () => set({ user: null, tickets: [] }),
}));
