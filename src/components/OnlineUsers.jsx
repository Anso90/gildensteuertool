import { useEffect, useState } from "react";
import { supabase } from "../auth/supabaseClient.js";

export default function OnlineUsers() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      const { data, error } = await supabase
        .from("online_users")
        .select("*");

      if (error) {
        console.error("Fehler beim Laden der Online-Nutzer:", error);
        return;
      }

      const now = new Date();
      const count = data.filter((user) => {
        const lastSeen = new Date(user.last_seen);
        return (now - lastSeen) / 1000 < 30;
      }).length;

      setOnlineCount(count);
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>{onlineCount} Offiziere online</span>
    </div>
  );
}
