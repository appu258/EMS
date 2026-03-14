import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FloatingChat from "../components/FloatingChat";

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({});
  const [adminUser, setAdminUser] = useState(null);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ================= FETCH TASKS & COUNTS ================= */

  const fetchData = async () => {
    const taskRes = await axios.get("/tasks/my");
    const countRes = await axios.get("/tasks/count");
    setTasks(taskRes.data);
    setCounts(countRes.data);
  };

  /* ================= FETCH ADMIN USER ================= */

  const fetchAdmin = async () => {
    try {
      const res = await axios.get("/auth/admin");
      setAdminUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAdmin();
  }, []);

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (id, status) => {
    await axios.put(`/tasks/${id}`, { status });
    fetchData();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-purple-600 opacity-20 blur-3xl rounded-full -top-20 -left-20 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-green-500 opacity-20 blur-3xl rounded-full bottom-0 right-0 animate-pulse"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-12 pt-10 relative z-10">
        <div>
          <h1 className="text-4xl font-bold">
            Welcome, <span className="text-green-400">{user?.name}</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Track your tasks and stay productive.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-5 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-12 mt-12 relative z-10">
        <StatCard title="New Tasks" value={counts.newTask} gradient="from-blue-500 to-indigo-500" />
        <StatCard title="Accepted" value={counts.acceptedTask} gradient="from-yellow-500 to-orange-500" />
        <StatCard title="Completed" value={counts.completedTask} gradient="from-green-500 to-emerald-500" />
        <StatCard title="Failed" value={counts.failedTask} gradient="from-red-500 to-pink-500" />
      </div>

      {/* Tasks Section */}
      <div className="px-12 mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {tasks.map(task => (
          <div
            key={task._id}
            className="backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl"
          >
            <h3 className="text-xl font-semibold mb-2">
              {task.title}
            </h3>

            <p className="text-gray-400 mb-4">
              {task.description}
            </p>

            <p className="mb-4 text-sm text-gray-300">
              Status: <span className="text-green-400">{task.status}</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => updateStatus(task._id, "accepted")}
                className="bg-yellow-500 px-3 py-1 rounded-lg text-black text-sm"
              >
                Accept
              </button>

              <button
                onClick={() => updateStatus(task._id, "completed")}
                className="bg-green-500 px-3 py-1 rounded-lg text-black text-sm"
              >
                Complete
              </button>

              <button
                onClick={() => updateStatus(task._id, "failed")}
                className="bg-red-500 px-3 py-1 rounded-lg text-black text-sm"
              >
                Fail
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Chat */}
      {adminUser && (
        <FloatingChat selectedUser={adminUser} />
      )}

    </div>
  );
};

/* Stat Card Component */

const StatCard = ({ title, value, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} p-6 rounded-2xl shadow-xl transform hover:scale-105 transition`}>
    <h3 className="text-sm uppercase tracking-wide opacity-80">
      {title}
    </h3>
    <p className="text-3xl font-bold mt-2">
      {value || 0}
    </p>
  </div>
);

export default EmployeeDashboard;