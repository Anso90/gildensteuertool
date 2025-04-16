import { useState, useEffect } from "react";
import Layout from "./components/Layout.jsx";
import MemberTable from "./components/MemberTable.jsx";
import MemberManager from "./components/MemberManager.jsx";
import TaxCalendar from "./components/TaxCalendar.jsx";
import TaxConfigPanel from "./components/TaxConfigPanel.jsx";

// 🔐 Login-Schutz & Logout
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import LogoutButton from "./auth/LogoutButton.jsx";

// 🟢 Online-Anzeige
import OnlineUsers from "./components/OnlineUsers.jsx";

// 🔄 Supabase für Online-Tracking
import { supabase } from "./auth/supabaseClient.js";

const STORAGE_KEY_MEMBERS = "obscuritas_members";
const STORAGE_KEY_TAX = "obscuritas_taxconfig";

export default function App() {
  const [members, setMembers] = useState([]);
  const [taxConfig, setTaxConfig] = useState({
    low: "50s",
    mid: "1g",
    high: "2g",
  });

  // 💾 Beim Laden gespeicherte Daten aus localStorage holen
  useEffect(() => {
    const savedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
    const savedTax = localStorage.getItem(STORAGE_KEY_TAX);
    if (savedMembers) setMembers(JSON.parse(savedMembers));
    if (savedTax) setTaxConfig(JSON.parse(savedTax));
  }, []);

  // 💾 Änderungen in localStorage speichern
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TAX, JSON.stringify(taxConfig));
  }, [taxConfig]);

  // 🟢 Alle 10 Sekunden Online-Status aktualisieren
  useEffect(() => {
    const updateLastSeen = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        await supabase
          .from("online_users")
          .upsert(
            {
              user_id: user.id,
              username: user.email,
              last_seen: new Date().toISOString(),
            },
            { onConflict: ["user_id"] }
          );
      }
    };

    updateLastSeen(); // direkt beim Start
    const interval = setInterval(updateLastSeen, 10000); // alle 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsDark text-obsGray p-10">
        {/* 🧠 Header: Logo + Titel + Logout + Online-Anzeige */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Obscuritas Logo"
              className="h-16 w-16 rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-bold text-obsRed">
                [DE] Obscuritas – Gildensteuer Tool
              </h1>
              <LogoutButton />
            </div>
          </div>
          {/* Online User Count sichtbar */}
          <OnlineUsers />
        </div>

        <Layout
          left={
            <MemberTable
              members={members}
              setMembers={setMembers}
              taxConfig={taxConfig}
            />
          }
          right={
            <div className="space-y-6">
              <TaxConfigPanel
                taxConfig={taxConfig}
                setTaxConfig={setTaxConfig}
              />
              <MemberManager
                setMembers={setMembers}
                taxConfig={taxConfig}
              />
              <TaxCalendar
                members={members}
                setMembers={setMembers}
              />
            </div>
          }
        />
      </div>
    </ProtectedRoute>
  );
}
