import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateOrJoin from "./pages/CreateOrJoin";
import WaitingRoom from "./pages/WaitingRoom";
import Battle from "./pages/Battle";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/game" element={<PrivateRoute> <CreateOrJoin /> </PrivateRoute>} />
      <Route path="/game/:room_id" element={<PrivateRoute> <WaitingRoom /> </PrivateRoute>} />    
      <Route path="/game/:room_id/battle" element={<PrivateRoute> <Battle /> </PrivateRoute>} />
    </Routes>
  );
};

export default App;
