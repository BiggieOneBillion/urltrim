"use client";

interface DashboardWelcomeProps {
  userName?: string;
}

export const DashboardWelcome = ({ userName }: DashboardWelcomeProps) => {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h2 style={{ marginBottom: "2px", color: "#d1d1d1ff" }} className="text-3xl font-bold text-gray-800">
        Welcome, {userName || "User"}
      </h2>
      <p style={{ color: "#666" }} className="text-lg text-gray-400">
        Your personal URL shortening dashboard
      </p>
    </div>
  );
};
