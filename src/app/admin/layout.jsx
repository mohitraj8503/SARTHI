import { AdminProvider } from "@/lib/services/AdminContext";
import "./admin.css";

export const metadata = {
  title: "SARTHI – National Meteorological LMS Admin Console",
  description: "Real-time platform telemetry, user management, and operational growth analytics for India Meteorological Department (MoES).",
};

export default function AdminLayout({ children }) {
  return <AdminProvider>{children}</AdminProvider>;
}
