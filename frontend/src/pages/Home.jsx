import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Section - Text */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            ⚔️ Battle of Wits: <span className="text-blue-400">1v1 MCQ Showdown</span>
          </h1>
          <p className="text-lg text-gray-300">
            Test your speed and brainpower in real-time battles. Compete with friends or strangers and climb the leaderboard!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 transition text-white font-semibold rounded-xl shadow-lg"
            >
                Sign Up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-800 transition text-white font-semibold rounded-xl shadow-lg"
            >
              Log In
            </button>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="flex justify-center">
          <img
            src="https://maang.in/_next/image?url=https%3A%2F%2Fd3pdqc0wehtytt.cloudfront.net%2Fcourses%2F3d7728c0-4462-44da-b731-f9fb07694854.png&w=828&q=75"
            alt="MCQ Battle"
            className="rounded-2xl shadow-2xl w-full max-w-md object-contain"
          />
        </div>
      </div>
    </div>
  );
}
