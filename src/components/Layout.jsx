import OnlineUsers from "./OnlineUsers";

export default function Layout({ left, right }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>{left}</div>
      <div className="relative">
        {/* 🟢 Anzeige wie viele Offiziere online sind */}
        <div className="absolute right-0 top-0 mb-2 text-sm text-green-400">
          <OnlineUsers />
        </div>
        {right}
      </div>
    </div>
  );
}
