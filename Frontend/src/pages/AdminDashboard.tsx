import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "../context/AuthContext";

import {
  getComplaintStatistics,
  getStaffWorkload,
  getRecentComplaints,
  getRecentActivity,
} from "../services/analyticsService";

import type {
  ComplaintStatistics,
  StaffWorkload,
  Complaint,
  AuditActivity,
} from "../types/analytics";

import "./AdminDashboard.css";

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [statistics, setStatistics] =
    useState<ComplaintStatistics | null>(null);

  const [staffWorkload, setStaffWorkload] =
    useState<StaffWorkload[]>([]);

  const [recentComplaints, setRecentComplaints] =
    useState<Complaint[]>([]);

  const [recentActivity, setRecentActivity] =
    useState<AuditActivity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          statisticsData,
          workloadData,
          complaintsData,
          activityData,
        ] = await Promise.all([
          getComplaintStatistics(),
          getStaffWorkload(),
          getRecentComplaints(10),
          getRecentActivity(10),
        ]);

        setStatistics(statisticsData);
        setStaffWorkload(workloadData);
        setRecentComplaints(complaintsData);
        setRecentActivity(activityData);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-message">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-message">
        {error}
      </div>
    );
  }

  const statusData = statistics
    ? [
        {
          name: "Submitted",
          value: statistics.summary.submitted,
        },
        {
          name: "Assigned",
          value: statistics.summary.assigned,
        },
        {
          name: "In Progress",
          value: statistics.summary.in_progress,
        },
        {
          name: "Resolved",
          value: statistics.summary.resolved,
        },
      ]
    : [];

  const priorityData = statistics
    ? Object.entries(statistics.by_priority).map(
        ([name, value]) => ({
          name,
          value,
        }),
      )
    : [];

  const departmentData = statistics
    ? Object.entries(statistics.by_department).map(
        ([name, value]) => ({
          name,
          value,
        }),
      )
    : [];

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          ResolveX
        </div>

        <div className="sidebar-label">
          Management
        </div>

        <button className="sidebar-item active">
          Dashboard
        </button>

        <button className="sidebar-item">
          Complaints
        </button>

        <button className="sidebar-item">
          Users
        </button>

        <button className="sidebar-item">
          Analytics
        </button>

        <div className="sidebar-label">
          System
        </div>

        <button className="sidebar-item">
          Notifications
        </button>

        <button className="sidebar-item">
          Audit Logs
        </button>
      </aside>

      {/* Main */}
      <main className="admin-main">

        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back, {user?.name}
            </p>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </header>

        {/* KPI Cards */}
        {statistics && (
          <section className="kpi-grid">

            <div className="kpi-card">
              <h3>Total Complaints</h3>
              <div className="kpi-value">
                {statistics.summary.total}
              </div>
            </div>

            <div className="kpi-card">
              <h3>Submitted</h3>
              <div className="kpi-value">
                {statistics.summary.submitted}
              </div>
            </div>

            <div className="kpi-card">
              <h3>Assigned</h3>
              <div className="kpi-value">
                {statistics.summary.assigned}
              </div>
            </div>

            <div className="kpi-card">
              <h3>In Progress</h3>
              <div className="kpi-value">
                {statistics.summary.in_progress}
              </div>
            </div>

            <div className="kpi-card">
              <h3>Resolved</h3>
              <div className="kpi-value">
                {statistics.summary.resolved}
              </div>
            </div>

          </section>
        )}

        {/* Charts */}
        <section className="chart-grid">

          {/* Complaint Status */}
          <div className="dashboard-card">
            <h2>Complaint Status</h2>

            <div className="chart-container">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {statusData.map(
                      (_, index) => (
                        <Cell
                          key={index}
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority */}
          <div className="dashboard-card">
            <h2>Priority Distribution</h2>

            <div className="chart-container">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={priorityData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar dataKey="value">
                    {priorityData.map(
                      (_, index) => (
                        <Cell
                          key={index}
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>

        {/* Department */}
        <section className="dashboard-card">
          <h2>Complaints by Department</h2>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={departmentData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar dataKey="value">
                  {departmentData.map(
                    (_, index) => (
                      <Cell
                        key={index}
                      />
                    ),
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Staff Workload */}
        <section className="table-card">
          <h2>Staff Workload</h2>

          {staffWorkload.length === 0 ? (
            <p>No active staff members found.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Assigned</th>
                  <th>In Progress</th>
                  <th>Resolved</th>
                  <th>Active Workload</th>
                </tr>
              </thead>

              <tbody>
                {staffWorkload.map(
                  (staff) => (
                    <tr key={staff.staff_id}>
                      <td>{staff.name}</td>

                      <td>
                        {staff.department ?? "-"}
                      </td>

                      <td>
                        {staff.assigned}
                      </td>

                      <td>
                        {staff.in_progress}
                      </td>

                      <td>
                        {staff.resolved}
                      </td>

                      <td>
                        {staff.active_workload}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Recent Complaints */}
        <section className="table-card">
          <h2>Recent Complaints</h2>

          {recentComplaints.length === 0 ? (
            <p>No complaints found.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Department</th>
                </tr>
              </thead>

              <tbody>
                {recentComplaints.map(
                  (complaint) => (
                    <tr
                      key={complaint.id}
                    >
                      <td>
                        {complaint.title}
                      </td>

                      <td>
                        {complaint.status}
                      </td>

                      <td>
                        {complaint.priority}
                      </td>

                      <td>
                        {complaint.department}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Recent Activity */}
        <section className="table-card">
          <h2>Recent Activity</h2>

          {recentActivity.length === 0 ? (
            <p>No recent activity.</p>
          ) : (
            <ul className="activity-list">
              {recentActivity.map(
                (activity) => (
                  <li
                    key={activity.id}
                    className="activity-item"
                  >
                    <div className="activity-action">
                      {activity.action}
                    </div>

                    <div className="activity-description">
                      {activity.description}
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;