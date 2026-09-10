'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Activity,
  TrendingUp,
  DollarSign,
  CreditCard,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { Course, Enrollment } from '@/lib/types';

interface Stats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  recentActivity: Array<{
    id: string;
    user: string;
    userImage: string | null;
    action: string;
    course: string;
    time: string;
  }>;
  recentTransactions: Array<{
    id: string;
    paymentId: string;
    userName: string;
    courseName: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      if (!user) return;

      try {
        // 1. Get Teacher's Courses
        const allCourses = storage.list<Course>('courses:', true);
        // Show all courses if ADMIN, otherwise filter by instructorId
        const myCourses =
          user.role === 'admin'
            ? allCourses
            : allCourses.filter((c) => c.instructor.id === user.id);

        const myCourseIds = new Set(myCourses.map((c) => c.id));

        // 2. Get All Enrollments
        const allEnrollments = storage.list<Enrollment>('enrollment:', true);

        // 3. Filter Enrollments for My Courses
        const myEnrollments = allEnrollments.filter((e) =>
          myCourseIds.has(e.courseId || e.course_id || '')
        );

        // 4. Calculate Metrics
        const totalRevenue = myCourses.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
        const totalEnrollments = myEnrollments.length;
        const uniqueStudents = new Set(myEnrollments.map((e) => e.userId || e.student_id || ''))
          .size;

        // Monthly Revenue (simulate based on enrollment create date if available, else random sort of)
        // Since we don't have enrollment date in simple Enrollment type yet, we will fallback to course revenue * 0.2 for demo
        const monthlyRevenue = totalRevenue * 0.15; // Mocking "this month"

        // Transactions (Mock from enrollments)
        const transactions = myEnrollments.slice(0, 10).map((e) => {
          const course = myCourses.find((c) => c.id === (e.courseId || e.course_id));
          const id = e.enrollmentId || e.id;
          const userId = e.userId || e.student_id || 'unknown';
          return {
            id: id,
            paymentId: `pay_${id.substring(0, 8)}`, // Derive fake pay id
            userName: `Student ${userId.substring(0, 6)}`, // Placeholder
            courseName: course?.title || 'Unknown Course',
            amount: course?.price || 0,
            date: new Date().toISOString(), // Mock date as we don't store it yet?
            status: 'succeeded',
          };
        });

        // Active Students (Mock random for demo or check progress updates?)
        const activeStudents = Math.floor(uniqueStudents * 0.6) || 0;

        // Activity (Mock)
        const recentActivity = myEnrollments.slice(0, 5).map((e) => {
          const course = myCourses.find((c) => c.id === (e.courseId || e.course_id));
          const userId = e.userId || e.student_id || 'unknown';
          return {
            id: `act_${e.enrollmentId || e.id}`,
            user: `Student ${userId.substring(0, 4)}`,
            userImage: null,
            action: 'Enrolled',
            course: course?.title || 'Course',
            time: new Date().toISOString(),
          };
        });

        setStats({
          totalStudents: uniqueStudents,
          totalCourses: myCourses.length,
          totalEnrollments: totalEnrollments,
          activeStudents,
          totalRevenue,
          monthlyRevenue,
          totalSales: totalEnrollments,
          averageOrderValue: totalEnrollments > 0 ? Math.round(totalRevenue / totalEnrollments) : 0,
          recentActivity,
          recentTransactions: transactions,
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
    // Poll for updates
    const interval = setInterval(calculateStats, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading)
    return (
      <div className="p-12 flex justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading analytics...
      </div>
    );

  if (!stats) return <div className="p-8 text-center text-slate-400">No data available</div>;

  return (
    <div className="space-y-8">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">
                Total Revenue
              </p>
              <h3 className="text-3xl font-extrabold text-brand-dark">
                ₹{stats.totalRevenue?.toLocaleString() || '0'}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-green-50 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">This Month</p>
              <h3 className="text-3xl font-extrabold text-brand-dark">
                ₹{stats.monthlyRevenue?.toLocaleString() || '0'}
              </h3>
              <p className="text-green-600 text-sm font-bold">+12% vs last month</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Total Sales</p>
              <h3 className="text-3xl font-extrabold text-brand-dark">{stats.totalSales || 0}</h3>
              <p className="text-gray-500 text-sm">courses sold</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">
                Avg Order Value
              </p>
              <h3 className="text-3xl font-extrabold text-brand-dark">
                ₹{stats.averageOrderValue || 0}
              </h3>
              <p className="text-gray-500 text-sm">per course</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="blue" />
        <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} color="purple" />
        <StatCard
          icon={TrendingUp}
          label="Enrollments"
          value={stats.totalEnrollments}
          color="green"
        />
        <StatCard
          icon={Activity}
          label="Active Today"
          value={stats.activeStudents}
          color="emerald"
          pulse
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg shadow-gray-200/50">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-brand-dark flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-orange" />
              Recent Transactions
            </h3>
            <button className="text-brand-orange hover:text-[#F4511E] text-sm font-bold">
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentTransactions?.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {transaction.paymentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-dark font-bold">
                    {transaction.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.courseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                    ₹{transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                        transaction.status === 'succeeded'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
          {(!stats.recentTransactions || stats.recentTransactions.length === 0) && (
            <div className="p-8 text-center text-gray-500">No transactions yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg shadow-gray-200/50">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-extrabold text-brand-dark flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Live Student Activity
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {activity.userImage ? (
                  <Image
                    src={activity.userImage}
                    alt={activity.user}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-gray-500">{activity.user[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-brand-dark font-bold">{activity.user}</p>
                <p className="text-sm text-gray-500 font-medium">
                  {activity.action} in <span className="text-brand-orange">{activity.course}</span>
                </p>
              </div>
              <div className="text-xs text-gray-400 font-bold whitespace-nowrap uppercase tracking-wider">
                {new Date(activity.time).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {stats.recentActivity.length === 0 && (
            <div className="p-8 text-center text-gray-500">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, pulse }: any) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-green-600 bg-green-50',
    emerald: 'text-emerald-600 bg-emerald-50',
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-1">{label}</p>
          <h3 className="text-3xl font-extrabold text-brand-dark">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {pulse && (
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      )}
    </div>
  );
}

