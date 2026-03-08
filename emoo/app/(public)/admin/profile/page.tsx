"use client";

import Image from "next/image";

const loginHistory = [
  { username: "admin", email: "informzqa@gmail.com", date: "3/6/2019 11:53 AM", ip: "194.44.234.160", browser: "Mozilla/5.0 (Windows)" },
  { username: "admin", email: "informzqa@gmail.com", date: "3/6/2019 11:54 AM", ip: "194.44.234.160", browser: "Mozilla/5.0 (Windows)" },
  { username: "admin", email: "informzqa@gmail.com", date: "3/6/2019 11:54 AM", ip: "194.44.234.160", browser: "Mozilla/5.0 (Windows)" },
  { username: "admin", email: "informzqa@gmail.com", date: "3/6/2019 11:54 AM", ip: "194.44.234.160", browser: "Mozilla/5.0 (Windows)" },
  { username: "admin", email: "informzqa@gmail.com", date: "3/6/2019 11:55 AM", ip: "194.44.234.160", browser: "Mozilla/5.0 (Windows)" },
  { username: "admin", email: "informzqa@gmail.com", date: "3/6/2019 11:55 AM", ip: "194.44.234.160", browser: "Mozilla/5.0 (Windows)" },
  { username: "admin", email: "informzqa@gmail.com", date: "3/6/2019 11:56 AM", ip: "194.44.234.160", browser: "Mozilla/5.0 (Windows)" },
];

export default function AdminProfile() {
  return (
    <div className="min-h-screen bg-[#2d2a4a] p-10 ml-16 text-sm">

      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-14 h-14 rounded-full overflow-hidden relative bg-gradient-to-br from-yellow-300 to-pink-400 flex items-center justify-center text-4xl">
          👩
        </div>
        <h1 className="text-2xl font-bold text-white">USERNAME</h1>
      </div>

      {/* Login History Table */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#1e1b4b] mb-4">Login History</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#1e1b4b] font-bold border-b border-gray-200">
                <th className="py-3 pr-6">User Name</th>
                <th className="py-3 pr-6">Email Address</th>
                <th className="py-3 pr-6">Last Login Date/Ti...</th>
                <th className="py-3 pr-6">IP Address</th>
                <th className="py-3">Browser</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((log, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-6 text-[#1e1b4b]">{log.username}</td>
                  <td className="py-3 pr-6 text-[#1e1b4b]">{log.email}</td>
                  <td className="py-3 pr-6 text-[#1e1b4b]">{log.date}</td>
                  <td className="py-3 pr-6 text-[#1e1b4b]">{log.ip}</td>
                  <td className="py-3 text-[#1e1b4b] truncate max-w-[200px]">{log.browser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}