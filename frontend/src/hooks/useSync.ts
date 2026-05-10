import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const useSync = () => {
  const { token } = useAuthStore();
  const pendingTransactions = useLiveQuery(() =>
    db.transactions.where("syncStatus").equals("pending").toArray()
  );

  const syncData = async () => {
    if (!navigator.onLine || !token || !pendingTransactions?.length) return;

    for (const tx of pendingTransactions) {
      try {
        const endpoint = tx.type === "income" ? "/income" : "/expenses";
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
          tx,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update local record as synced and store the backend ID
        await db.transactions.update(tx.id!, {
          syncStatus: "synced",
          backendId: response.data._id,
        });
      } catch (error) {
        console.error("Sync failed for transaction:", tx.id);
        await db.transactions.update(tx.id!, { syncStatus: "failed" });
      }
    }
  };

  return { syncData, pendingCount: pendingTransactions?.length || 0 };
};
