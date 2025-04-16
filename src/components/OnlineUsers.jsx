import { useEffect, useState } from "react";
import { supabase } from "../auth/supabaseClient";

export default function OnlineUsers() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchOnline = async () => {
      const { data, error } = await supabase
        .from("online_users")
        .select("*")
        .gte("last_seen", new Date(Date.now() - 30000).toISOString());

      if (!error && data) {
        setCount(data.length);
      }
    };

    fetchOnline();
    const interval = setInterval(fetchOnline, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-xs text-green-400 bg-black/30 p-1 px-2 rounded shadow border border-green-700">
      🟢 {count} Offiziere online
    </div>
  );
}
