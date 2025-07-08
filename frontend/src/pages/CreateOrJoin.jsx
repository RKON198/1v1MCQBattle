import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../services/room";

export default function CreateOrJoin() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [category, setCategory] = React.useState("general knowledge");
  const [difficulty, setDifficulty] = React.useState("easy");
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState("5"); // default to 5
  const [numError, setNumError] = useState("");

  const user_id = localStorage.getItem("user_id");
  const name = localStorage.getItem("first_name");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_id");
    localStorage.removeItem("first_name");
    navigate("/");
  };

  const handleCreateRoom = async () => {
    const num = parseInt(numQuestions);

    if (!num || num < 1 || num > 30) {
      setNumError("Please choose between 1 and 30 questions.");
      setNumQuestions("");
      return;
    }

    setNumError(""); // clear previous errors

    setLoading(true); // Show waiting message immediately
    try {
      // creating room and storing questions in the backend
      // console.log(user_id, category, difficulty);
      const res = await createRoom(user_id, category, difficulty, num);
      console.log("Navigating with:", category, difficulty);

      navigate(`/game/${res.data.room_id}`);
    } catch (err) {
      console.log(err);
      alert("Failed to create room");
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    try {
      await joinRoom(roomCode, user_id);
      navigate(`/game/${roomCode}`, {
        state: { joined: true, category: category, difficulty: difficulty },
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join room");
    }
  };

  const handleNumChange = (e) => {
    const value = e.target.value;
    setNumQuestions(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition"
      >
        Logout
      </button>

      <div className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center">
          Let's Play{name ? `, ${name}` : ""}!
        </h2>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. General Knowledge"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white text-gray-900"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Number of Ques. */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              No. of Questions
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={numQuestions}
              onChange={handleNumChange}
              placeholder="Enter between 1 and 30"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition ${
                numError
                  ? "border-red-500 ring-red-200"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {numError && (
              <p className="mt-1 text-sm text-red-600">{numError}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Choose between <strong>1</strong> and <strong>30</strong>{" "}
              questions.
            </p>
          </div>
        </div>

        {loading && <p>Wait while we create the room...</p>}
        <button
          onClick={handleCreateRoom}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Room"}
        </button>

        <div className="flex items-center justify-between text-gray-500">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-sm">OR</span>
          <hr className="w-full border-gray-300" />
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-semibold">
              Enter Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              required
              placeholder="e.g. a1b2c3d4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
