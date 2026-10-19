import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export default function useReminders(accountId) {
  const [snapshot, setSnapshot] = useState({
    accountId: null,
    data: [],
    loading: true,
    error: "",
  });
  const [reloadKey, setReloadKey] = useState(0);
  const requestVersion = useRef(0);
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);
  const currentAccount = snapshot.accountId === accountId;

  useEffect(() => {
    let active = true;
    const load = async () => {
      const version = ++requestVersion.current;
      try {
        const response = await api.reminders.list();
        if (active && version === requestVersion.current) {
          setSnapshot({
            accountId,
            data: response.reminders || [],
            loading: false,
            error: "",
          });
        }
      } catch (requestError) {
        if (active && version === requestVersion.current) {
          setSnapshot({
            accountId,
            data: [],
            loading: false,
            error: requestError.message || "Unable to load reminders.",
          });
        }
      }
    };

    load();
    window.addEventListener("prepbuddy-reminders-updated", load);
    return () => {
      active = false;
      requestVersion.current += 1;
      window.removeEventListener("prepbuddy-reminders-updated", load);
    };
  }, [accountId, reloadKey]);

  return {
    reminders: currentAccount ? snapshot.data : [],
    loading: !currentAccount || snapshot.loading,
    error: currentAccount ? snapshot.error : "",
    refresh,
  };
}
