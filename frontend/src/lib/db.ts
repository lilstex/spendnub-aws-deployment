import Dexie, { Table } from "dexie";

export interface LocalTransaction {
  id?: number; // Local auto-increment ID
  amount: number;
  description: string;
  category: string;
  subCategory?: string;
  date: Date;
  type: "income" | "expense";
  syncStatus: "synced" | "pending" | "failed";
  backendId?: string; // The MongoID from API
}

export class SpendNubDB extends Dexie {
  transactions!: Table<LocalTransaction>;

  constructor() {
    super("SpendNubDB");
    this.version(1).stores({
      // Indexing syncStatus and date for fast lookups
      transactions: "++id, syncStatus, date, type",
    });
  }
}

export const db = new SpendNubDB();
