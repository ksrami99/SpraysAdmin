import AccessControl from "../components/AccessControl";
import TemporaryDrawer from "../components/Sidebar";

export default function AdminPanel() {
  return (
    <div>
      <TemporaryDrawer />
      <h2>Admin Panel</h2>

      <AccessControl requiredPerms={["create-product"]}>
        <button>Create Product</button>
      </AccessControl>

      <AccessControl requiredPerms={["delete-product"]}>
        <button>Delete Product</button>
      </AccessControl>
    </div>
  );
}
