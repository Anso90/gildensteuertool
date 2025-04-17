import { useState, useEffect } from "react";
import Layout from "./components/Layout.jsx";
import MemberTable from "./components/MemberTable.jsx";
import MemberManager from "./components/MemberManager.jsx";
import TaxCalendar from "./components/TaxCalendar.jsx";
import TaxConfigPanel from "./components/TaxConfigPanel.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import LogoutButton from "./auth/LogoutButton.jsx";
import { supabase } from "./auth/supabaseClient.js";

export default function App() {
  const [members, setMembers] = useState([]);
  const [taxConfig, setTaxConfig] = useState({
    low: "50s",
    mid: "1g",
    high: "2g",
  });
  const [inactiveWeeks, setInactiveWeeks] = useState([]);
  const [classicView, setClassicView] = useState(false); // 🆕 Layout-Switch

  useEffect(() => {
    const channel = supabase
      .channel("inactivity-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "inactive_members" }, payload => {
        supabase.from("inactive_members").select("*").then(({ data }) => {
          setInactiveWeeks(data || []);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("obscuritas_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem("obscuritas_taxconfig", JSON.stringify(taxConfig));
  }, [taxConfig]);

  useEffect(() => {
    const updateLastSeen = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (user) {
        await supabase.from("online_users").upsert(
          {
            user_id: user.id,
            username: user.email,
            last_seen: new Date().toISOString(),
          },
          { onConflict: ["user_id"] }
        );
      }
    };

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsDark text-obsGray p-10">
        <div className="flex items-center gap-4 mb-6 justify-between">
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
          <button
            onClick={() => setClassicView(!classicView)}
            className="bg-gray-700 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
          >
            {classicView ? "🎨 Modernes Layout" : "📄 Klassisches Layout"}
          </button>
        </div>

        <Layout
          left={
            <MemberTable
              members={members}
              setMembers={setMembers}
              taxConfig={taxConfig}
              inactiveWeeks={inactiveWeeks}
              classicView={classicView}
            />
          }
          right={
            <div className="space-y-6">
              <TaxConfigPanel taxConfig={taxConfig} setTaxConfig={setTaxConfig} />
              <MemberManager setMembers={setMembers} taxConfig={taxConfig} />
              <TaxCalendar
                members={members}
                setMembers={setMembers}
                inactiveWeeks={inactiveWeeks}
                setInactiveWeeks={setInactiveWeeks}
              />
            </div>
          }
        />
      </div>
    </ProtectedRoute>
  );
}