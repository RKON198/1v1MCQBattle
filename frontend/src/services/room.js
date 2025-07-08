import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const createRoom = async (user_id, category = "general  knowledge", difficulty = "easy", num = 5) => {
  console.log("room services", category, difficulty, user_id, num)
  return await axios.post(`${BASE_URL}/game/create-room`, {
    user_id,
    category,
    difficulty,
    num
  });
};

export const joinRoom = async (room_id, user_id) => {
  return await axios.post(`${BASE_URL}/game/join-room`, {
    room_id,
    user_id,
  });
};

export const leaveRoom = async (room_id, user_id) => {
  return await axios.post(
    `${BASE_URL}/game/leave-room`,
    { room_id, user_id },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    }
  );
};

export const notifyFinish = async (room_id, data) => {
  return axios.post(`${BASE_URL}/game/player-finished`, {
    room_id,
    ...data,
  });
};
