// src/pages/Login.jsx

import { useState } from "react";
import { supabase } from "../auth/supabaseClient";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg("Falscher Benutzername oder Passwort.");
    } else {
      onLogin();
    }
  };

  const handleRegister = async () => {
    const email = prompt("Neue Offiziers-Email?");
    const password = prompt("Neues Passwort?");
    if (!email || !password) return;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("Registrierung fehlgeschlagen: " + error.message);
    } else {
      alert("✅ Account erfolgreich erstellt – du kannst dich jetzt einloggen.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-obsDark p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Einloggen</h2>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded text-black"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 rounded text-black"
        />
        {errorMsg && <p className="text-red-400 mb-2">{errorMsg}</p>}

        <button
          onClick={handleLogin}
          className="bg-obsRed hover:bg-red-700 w-full py-2 rounded font-bold"
        >
          Login
        </button>

        {/* TEMPORÄRER Registrieren Button */}
        <p className="text-sm text-center mt-4">
          Noch kein Konto?{" "}
          <button
            onClick={handleRegister}
            className="underline text-obsRed hover:text-red-400"
          >
            Jetzt registrieren
          </button>
        </p>
      </div>
    </div>
  );
}
