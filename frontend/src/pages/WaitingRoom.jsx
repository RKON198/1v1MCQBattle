import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Pusher from "pusher-js";

export default function WaitingRoom() {
  const { room_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ✅ Connect to Pusher
    const joined = location.state?.joined;

    if (joined) {
      // ✅ Joiner doesn't need to wait
      setTimeout(() => navigate(`/game/${room_id}/battle`), 0);
      return;
    }

    // creator waits for joiner
    const pusher = new Pusher("e8afefdffd5b0356fe9f", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(`room-${room_id}`);

    // ✅ Listen for event
    channel.bind("player-joined", (data) => {
      console.log("Opponent joined:", data);
      // Redirect to battle or game screen
      navigate(`/game/${room_id}/battle`);
    });

    // ✅ Cleanup on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [room_id, navigate, location.state]);

  return (
    // <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex flex-col items-center justify-center text-white px-4">
    //   <div className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-xl p-8 space-y-6 text-center">
    //     <h2 className="text-2xl font-bold">Room Created 🎯</h2>
    //     <p className="text-lg">Room ID: <span className="font-mono">{room_id}</span></p>
    //     <p className="mt-4 text-blue-600 font-semibold animate-pulse">Waiting for opponent to join...</p>
    //   </div>
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex flex-col items-center justify-center text-white px-4">
      <div className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <h2 className="text-2xl font-bold">Room Created 🎯</h2>

        {/* ✅ Copyable Room ID Box */}
        <div>
          <p className="text-lg font-semibold mb-2">Room ID:</p>
          <div className="relative group flex justify-center">
            <div
              className="cursor-pointer select-all bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm font-mono text-gray-800 hover:bg-gray-200 transition"
              onClick={() => {
                navigator.clipboard.writeText(room_id);
              }}
            >
              {room_id}
            </div>
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 text-xs bg-black text-white px-2 py-1 rounded transition">
              Click to copy
            </span>
          </div>
        </div>

        {/* ✅ Status message */}
        <p className="mt-4 text-blue-600 font-semibold animate-pulse">
          Waiting for opponent to join...
        </p>
      </div>
    </div>
  );
}
