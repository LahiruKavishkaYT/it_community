
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserManagement } from "@/components/dashboard/users/UserManagement";

const Users = () => {
  return (
    <DashboardLayout>
      <UserManagement />
    </DashboardLayout>
  );
};

export default Users;
