import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { notifyFinish, joinRoom } from "../services/room";
import Pusher from "pusher-js";

// Sample data structure (MCQ-style)
// const questions = [
//   // {
//   //   body: "What is the capital of France?",
//   //   explanation: "Paris is the capital city of France.",
//   //   options: [
//   //     { body: "Berlin", is_correct: false },
//   //     { body: "Madrid", is_correct: false },
//   //     { body: "Paris", is_correct: true },
//   //     { body: "Lisbon", is_correct: false },
//   //   ],
//   // },
//   // {
//   //   body: "Which planet is known as the Red Planet?",
//   //   explanation:
//   //     "Mars is called the Red Planet because of its reddish appearance.",
//   //   options: [
//   //     { body: "Earth", is_correct: false },
//   //     { body: "Mars", is_correct: true },
//   //     { body: "Jupiter", is_correct: false },
//   //     { body: "Saturn", is_correct: false },
//   //   ],
//   // },
// ];

export default function Battle() {
  const [questions, setQuestions] = useState([]);
  const { room_id } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [opponentStats, setOpponentStats] = useState(null);
  const [roomDeleted, setRoomDeleted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await joinRoom(room_id, localStorage.getItem("user_id"));
        const { questions } = res.data;

        if (!questions || questions.length === 0) {
          // Room exists but no questions? Maybe already deleted
          setRoomDeleted(true);
          return;
        }

        setQuestions(questions);
      } catch (err) {
        console.error("Failed to load questions", err);
        setRoomDeleted(true);
      }
    };
    loadQuestions();
  }, [room_id]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!finished) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [finished]);

  useEffect(() => {
    const pusher = new Pusher("e8afefdffd5b0356fe9f", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe(`room-${room_id}`);

    channel.bind("player-finished", (data) => {
      const myId = localStorage.getItem("user_id");
      if (data.user_id !== myId) {
        console.log("Opponent finished!");
        setOpponentFinished(true);
        setOpponentStats(data);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [room_id]);

  const handleFinish = async (finalScore, finalCorrect, finalWrong) => {
    setScore(finalScore);
    setCorrectCount(finalCorrect);
    setWrongCount(finalWrong);
    setFinished(true);

    try {
      await notifyFinish(room_id, {
        user_id: localStorage.getItem("user_id"),
        score: finalScore,
        correct: finalCorrect,
        wrong: finalWrong,
        name: localStorage.getItem("first_name"),
      });
      console.log("Notified that player finished");
    } catch (err) {
      console.error("Failed to notify:", err);
    }
  };

  const handleNext = () => {
    const selectedOption = currentQuestion.options.find(
      (opt) => opt.body === selected
    );

    let newScore = score;
    let newCorrect = correctCount;
    let newWrong = wrongCount;

    if (selectedOption) {
      if (selectedOption.is_correct) {
        setScore((prev) => prev + 10);
        setCorrectCount((prev) => prev + 1);
        newScore += 10;
        newCorrect += 1;
      } else {
        setScore((prev) => prev - 5);
        setWrongCount((prev) => prev + 1);
        newScore -= 5;
        newWrong += 1;
      }
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
    } else {
      handleFinish(newScore, newCorrect, newWrong);
    }
  };

  const getResultMessage = () => {
    if (!opponentStats) return null;

    if (score > opponentStats.score) {
      return `🏆 You Win!`;
    } else if (score < opponentStats.score) {
      return `🥈 ${opponentStats.name || "Opponent"} Wins!`;
    } else {
      return `🤝 It's a Draw!`;
    }
  };

  if (roomDeleted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-red-500 mb-4">
          ⚠️ Game not found
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          This game has already ended or doesn't exist anymore.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-semibold transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-green-400">
        Room: {room_id}
      </h1>

      <div className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-xl p-8 space-y-6">
        {finished ? (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-green-400">
              Quiz Finished 🎉
            </h2>

            {opponentFinished && opponentStats ? (
              // ✅ Show both players' stats side-by-side
              <>
                <p className="text-3xl text-green-300 font-semibold tracking-wide">
                  {getResultMessage()}
                </p>
                <div className="grid sm:grid-cols-2 gap-6 text-left">
                  {/* You */}
                  <div className="bg-slate-700 p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold mb-3 text-green-300">
                      You ({localStorage.getItem("first_name")})
                    </h3>
                    <p className="text-lg">
                      ✅ Correct:{" "}
                      <span className="font-bold">{correctCount}</span>
                    </p>
                    <p className="text-lg">
                      ❌ Wrong: <span className="font-bold">{wrongCount}</span>
                    </p>
                    <p className="text-lg">
                      Final Score: <span className="font-bold">{score}</span>
                    </p>
                  </div>

                  {/* Opponent */}
                  <div className="bg-slate-700 p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold mb-3 text-yellow-300">
                      {opponentStats.name || "Opponent"}
                    </h3>
                    <p className="text-lg">
                      ✅ Correct:{" "}
                      <span className="font-bold">{opponentStats.correct}</span>
                    </p>
                    <p className="text-lg">
                      ❌ Wrong:{" "}
                      <span className="font-bold">{opponentStats.wrong}</span>
                    </p>
                    <p className="text-lg">
                      Final Score:{" "}
                      <span className="font-bold">{opponentStats.score}</span>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Just show your own stats if opponent is still playing */}
                <p className="text-2xl">
                  ✅ Correct Answers:{" "}
                  <span className="font-bold">{correctCount}</span>
                </p>
                <p className="text-2xl">
                  ❌ Wrong Answers:{" "}
                  <span className="font-bold">{wrongCount}</span>
                </p>
                <p className="text-2xl">
                  Final Score: <span className="font-bold">{score}</span>
                </p>
                <p className="text-lg text-blue-300 mt-4 animate-pulse">
                  Waiting for your opponent to finish...
                </p>
              </>
            )}
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-semibold transition"
              >
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {questions.length == 0 ? (
              <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <p className="text-2xl text-green-400">Loading questions...</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">
                  Q{currentIndex + 1}. {currentQuestion.body}
                </h2>

                <div className="space-y-4">
                  {currentQuestion.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`block p-4 rounded-lg border transition cursor-pointer
                      ${
                        selected === opt.body
                          ? "border-green-500 bg-slate-700"
                          : "border-gray-500 hover:bg-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="option"
                        value={opt.body}
                        checked={selected === opt.body}
                        onChange={() => setSelected(opt.body)}
                        className="mr-3 accent-green-500 scale-125"
                      />
                      <span className="text-lg">{opt.body}</span>
                    </label>
                  ))}
                </div>

                <div className="text-right">
                  <button
                    onClick={handleNext}
                    disabled={!selected}
                    className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-lg font-semibold transition disabled:opacity-50"
                  >
                    {currentIndex + 1 === questions.length ? "Finish" : "Next"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
