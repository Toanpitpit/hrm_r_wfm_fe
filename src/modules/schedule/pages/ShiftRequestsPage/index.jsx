import { useNavigate } from "react-router-dom";
import DashboardShell from "@/shared/components/layout/DashboardShell";
import DashboardSidebar from "@/shared/components/layout/DashboardSidebar";
import DashboardTopbar from "@/shared/components/layout/DashboardTopbar";
import ShiftRequestsWorkspace from "../../components/ShiftRequestsWorkspace";
import {
  readRequestUser,
  getRequestIdentity,
} from "../../utils/shiftRequest.utils";

export default function ShiftRequestsPage() {
  const navigate = useNavigate();

  const storedUser = readRequestUser();
  const userRole = (storedUser?.role || storedUser?.Role || "").toUpperCase();
  const roleName = (storedUser?.roleName || "").toLowerCase();
  const { isStoreManager } = getRequestIdentity(storedUser);

  const isShiftLeader =
    userRole === "SHIFT_LEADER" ||
    userRole === "LEADER" ||
    roleName.includes("trưởng ca");

  let portalTitle = "EMPLOYEE PORTAL";
  let roleSubtitle = storedUser?.roleName || "Nhân sự Chi nhánh";

  if (isStoreManager) {
    portalTitle = "STORE MANAGER CONSOLE";
  } else if (isShiftLeader) {
    portalTitle = "SHIFT LEADER PORTAL";
  } else if (userRole === "CASHIER" || roleName.includes("thu ngân")) {
    portalTitle = "CASHIER PORTAL";
  } else if (userRole === "SALES_STAFF" || roleName.includes("bán hàng")) {
    portalTitle = "SALES PORTAL";
  } else if (
    userRole === "SECURITY_GUARD" ||
    userRole === "SECURITY" ||
    roleName.includes("bảo vệ")
  ) {
    portalTitle = "SECURITY PORTAL";
  }

  const handleSidebarNavigate = (id) => {
    if (id === "my-calendar") navigate("/employee/my-calendar");
    else if (id === "shift-requests") navigate("/employee/shift-requests");
    else if (id === "attendance-otp") navigate("/employee/attendance-otp");
    else if (id === "employee-attendance")
      navigate("/employee/attendance-history");
    else if (id === "live-roster") navigate("/store-manager/live-roster");
    else if (id === "store-schedules") navigate("/store-manager/schedules");
    else if (id === "employees") navigate("/employees");
    else if (id === "kiosk-codes") navigate("/store-manager/kiosk-codes");
    else if (id === "dispatches") navigate("/store-manager/dispatches");
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardSidebar
          page="shift-requests"
          activePath="/employee/shift-requests"
          onNavigate={handleSidebarNavigate}
          consoleLabel={portalTitle}
          defaultDisplayName={storedUser?.fullName || "Nhân viên Chi nhánh"}
          roleLabel={roleSubtitle}
          avatarLetter={
            storedUser?.fullName
              ? storedUser.fullName.charAt(0).toUpperCase()
              : "E"
          }
          brandName="RWFM Enterprise"
        />
      }
      topbar={
        <DashboardTopbar
          breadcrumbs={
            isStoreManager
              ? [
                  { label: "Store Manager", href: "/store-manager/schedules" },
                  { label: "Quản Lý Nhân Sự & Kiosk", href: "/employees" },
                  { label: "Duyệt Đơn Đổi Ca" },
                ]
              : [
                  { label: "Cá Nhân", href: "/employee/my-calendar" },
                  { label: "Tiện Ích", href: "/employee/shift-requests" },
                  { label: "Đơn Đổi & Xin Nghỉ" },
                ]
          }
        />
      }
    >
      <ShiftRequestsWorkspace user={storedUser} />
    </DashboardShell>
  );
}
