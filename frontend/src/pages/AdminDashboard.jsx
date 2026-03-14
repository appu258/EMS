import { useState, useContext, useEffect } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FloatingChat from "../components/FloatingChat";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    newTasks: 0,
    completed: 0,
    failed: 0
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
    assignedTo: ""
  });

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */

  const fetchStats = () => {
    axios.get("/tasks/admin-stats")
      .then(res => setStats(res.data))
      .catch(err => console.log(err));
  };

  const fetchAllEmployees = () => {
    axios.get("/tasks/admin-all")
      .then(res => setAllEmployees(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    axios.get("/auth/employees")
      .then(res => setEmployees(res.data));

    fetchStats();
    fetchAllEmployees();
  }, []);

  /* ================= CREATE TASK ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.assignedTo) {
      alert("Please select an employee");
      return;
    }

    await axios.post("/tasks", form);

    setForm({
      title: "",
      description: "",
      date: "",
      category: "",
      assignedTo: ""
    });

    fetchStats();
    fetchAllEmployees();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden flex flex-col">

      {/* Background Glow */}
      <div className="absolute w-[450px] h-[450px] bg-purple-600 opacity-20 blur-3xl rounded-full -top-32 -left-32"></div>
      <div className="absolute w-[450px] h-[450px] bg-green-500 opacity-20 blur-3xl rounded-full bottom-0 right-0"></div>

      {/* HEADER */}
      <div className="flex justify-between items-center px-12 py-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome, <span className="text-green-400">{user?.name}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-5 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 px-12 pb-10 relative z-10">

        {/* CREATE TASK */}
        <div className="lg:col-span-3 backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">
            Create New Task
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

            <InputField
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <InputField
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <InputField
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <select
              value={form.assignedTo}
              className="p-3 rounded-lg bg-black/40 border border-gray-600 focus:border-green-400 outline-none"
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <textarea
              className="col-span-2 p-3 rounded-lg bg-black/40 border border-gray-600 focus:border-green-400 outline-none"
              placeholder="Description"
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <button className="col-span-2 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition">
              Create Task
            </button>

          </form>
        </div>

        {/* STATS */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <StatCard title="Total Tasks" value={stats.total} gradient="from-purple-500 to-indigo-500" />
          <StatCard title="New Tasks" value={stats.newTasks} gradient="from-blue-500 to-cyan-500" />
          <StatCard title="Completed" value={stats.completed} gradient="from-green-500 to-emerald-600" />
          <StatCard title="Failed" value={stats.failed} gradient="from-red-500 to-pink-600" />
        </div>

      </div>

      {/* EMPLOYEE TABLE */}
      <div className="px-12 pb-16 relative z-10">
        <h2 className="text-2xl font-bold mb-6">
          Employee Overview
        </h2>

        <div className="overflow-hidden rounded-2xl border border-gray-700">

          <div className="grid grid-cols-5 bg-orange-600 text-white font-semibold px-6 py-4">
            <div>Employee Name</div>
            <div className="text-center">New</div>
            <div className="text-center">Active</div>
            <div className="text-center">Completed</div>
            <div className="text-center">Failed</div>
          </div>

          {allEmployees.map(emp => {

            const newCount = emp.tasks.filter(t => t.status === "new").length;
            const activeCount = emp.tasks.filter(t => t.status === "accepted").length;
            const completedCount = emp.tasks.filter(t => t.status === "completed").length;
            const failedCount = emp.tasks.filter(t => t.status === "failed").length;

            return (
              <div
                key={emp._id}
                className="grid grid-cols-5 px-6 py-4 bg-gray-900 border-t border-gray-800 hover:bg-gray-800 transition"
              >
                <div
                  className="text-orange-400 font-semibold cursor-pointer hover:underline"
                  onClick={() => setSelectedChatUser(emp)}
                >
                  {emp.name}
                </div>

                <div className="text-center text-blue-400 font-bold">{newCount}</div>
                <div className="text-center text-pink-400 font-bold">{activeCount}</div>
                <div className="text-center text-green-400 font-bold">{completedCount}</div>
                <div className="text-center text-red-400 font-bold">{failedCount}</div>
              </div>
            );
          })}

        </div>
      </div>

      {/* FLOATING CHAT */}
      <FloatingChat />

    </div>
  );
};

/* Reusable Components */

const InputField = ({ type = "text", placeholder, value, onChange }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="p-3 rounded-lg bg-black/40 border border-gray-600 focus:border-green-400 outline-none"
  />
);

const StatCard = ({ title, value, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center transition transform hover:scale-105`}>
    <h3 className="text-sm uppercase tracking-wide opacity-80">
      {title}
    </h3>
    <p className="text-4xl font-bold mt-3">
      {value}
    </p>
  </div>
);

export default AdminDashboard;