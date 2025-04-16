import { supabase } from "./supabaseClient";

export default function LogoutButton() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <button onClick={logout} className="text-sm text-obsGray underline hover:text-white mt-4">
      🔓 Logout
    </button>
  );
}
