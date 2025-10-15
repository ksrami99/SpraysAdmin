import { useState } from "react";
import axios from "axios";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/* ===================== AXIOS INSTANCE ===================== */
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    Authorization: `${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});

/* ===================== API FUNCTIONS ===================== */
// Users
const getUsers = async () => (await axiosInstance.get("/user")).data;

// Roles
// const getRoles = async () => (await axiosInstance.get("/rbac/roles")).data;
const createRole = async (roleData) =>
  (await axiosInstance.post("/rbac/roles", roleData)).data;

// Permissions
// const getPermissions = async () =>
// (await axiosInstance.get("/rbac/permissions")).data;
const createPermission = async (permissionData) =>
  (await axiosInstance.post("/rbac/permissions", permissionData)).data;

// Assignments
const assignRole = async (assignData) =>
  (await axiosInstance.post("/rbac/roles/assign", assignData)).data;
const grantPermission = async (assignData) =>
  (await axiosInstance.post("/rbac/permissions/assign", assignData)).data;

/* ===================== REACT QUERY HOOK ===================== */
const useRbacQueries = () => {
  const queryClient = useQueryClient();

  // Queries
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: getUsers });
  // const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  // const permissionsQuery = useQuery({
  //   queryKey: ["permissions"],
  //   queryFn: getPermissions,
  // });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => queryClient.invalidateQueries(["roles"]),
  });
  const createPermissionMutation = useMutation({
    mutationFn: createPermission,
    onSuccess: () => queryClient.invalidateQueries(["permissions"]),
  });
  const assignRoleMutation = useMutation({ mutationFn: assignRole });
  const grantPermissionMutation = useMutation({ mutationFn: grantPermission });

  return {
    usersQuery,
    // rolesQuery,
    // permissionsQuery,
    createRoleMutation,
    createPermissionMutation,
    assignRoleMutation,
    grantPermissionMutation,
  };
};

/* ===================== PERMISSION MATRIX UI ===================== */
const MODULES = [
  "User Management",
  "Category Management",
  "Order Management",
  "Product Management",
];

const PERMISSIONS = ["Read", "Write", "Update", "Delete"];

const RBACMatrix = () => {
  const {
    usersQuery,
    createRoleMutation,
    createPermissionMutation,
    grantPermissionMutation,
    assignRoleMutation,
  } = useRbacQueries();

  const [selectedUser, setSelectedUser] = useState("");
  const [matrix, setMatrix] = useState({});

  // const togglePermission = (module, permission) => {
  //   setMatrix((prev) => {
  //     const current = prev[module] || {};
  //     const updated = { ...current, [permission]: !current[permission] };

  //     return { ...prev, [module]: updated };
  //   });
  // };

  const togglePermission = (module, permission) => {
    setMatrix((prev) => {
      const current = prev[module] || {};
      const updated = { ...current, [permission]: !current[permission] };

      // Remove false permissions
      const cleaned = Object.fromEntries(
        Object.entries(updated).filter(([_, value]) => value === true)
      );

      // If module has no true permissions, remove the module entirely
      if (Object.keys(cleaned).length === 0) {
        const { [module]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [module]: cleaned };
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return alert("Select a user first!");

    for (const module of MODULES) {
      const selectedPerms = matrix[module];
      if (!selectedPerms) continue;

      // Filter only TRUE permissions
      const truePermissions = Object.entries(selectedPerms)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

      // Skip module if no permissions are selected
      if (truePermissions.length === 0) continue;

      // 1️⃣ Create Role (backend generates slug automatically)
      const roleRes = await createRoleMutation.mutateAsync({
        role_name: module,
      });
      const roleId = roleRes?.data?.id || roleRes?.data?.insertId;

      // 2️⃣ Loop through selected permissions (only TRUE ones)
      for (const perm of truePermissions) {
        // 3️⃣ Create Permission (backend generates slug automatically)
        const permRes = await createPermissionMutation.mutateAsync({
          permission_name: `${perm} ${module}`,
        });
        const permissionId = permRes?.data?.id || permRes?.data?.insertId;

        // 4️⃣ Grant Permission to Role
        await grantPermissionMutation.mutateAsync({ roleId, permissionId });
      }

      // 5️⃣ Assign Role to User
      await assignRoleMutation.mutateAsync({ userId: selectedUser, roleId });
    }

    alert("✅ RBAC Matrix updated successfully!");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">
        RBAC Permission Matrix
      </h1>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow">
        {/* Select User */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Select User</label>
          {usersQuery.isLoading ? (
            <p>Loading users...</p>
          ) : usersQuery.isError ? (
            <p>Error loading users</p>
          ) : (
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
              }}
              className="border p-2 rounded w-full"
            >
              <option value="">-- Select a user --</option>
              {usersQuery.data?.data?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullname} ({user.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Permission Table */}
        <table className="w-full border text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-2 text-left">Module</th>
              <th className="p-2 text-center">All</th>
              {PERMISSIONS.map((p) => (
                <th key={p} className="p-2 text-center">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((module) => (
              <tr key={module} className="border-b">
                <td className="p-2 font-medium">{module}</td>
                <td className="text-center p-2">
                  <input
                    type="checkbox"
                    checked={
                      matrix[module] &&
                      Object.keys(matrix[module]).length > 0 &&
                      Object.values(matrix[module]).every(Boolean)
                    }
                    onChange={() => {
                      const modulePerms = matrix[module] || {};
                      const allChecked =
                        Object.keys(modulePerms).length > 0 &&
                        Object.values(modulePerms).every(Boolean);
                      const newPerms = PERMISSIONS.reduce(
                        (acc, p) => ({ ...acc, [p]: !allChecked }),
                        {}
                      );
                      setMatrix((prev) => ({ ...prev, [module]: newPerms }));
                    }}
                  />
                </td>
                {PERMISSIONS.map((perm) => (
                  <td key={perm} className="text-center p-2">
                    <input
                      type="checkbox"
                      checked={matrix[module]?.[perm] || false}
                      onChange={() => togglePermission(module, perm)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Save Button */}
        <div className="text-center mt-6">
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===================== APP WRAPPER ===================== */
const queryClient = new QueryClient();

const RBAC = () => (
  <QueryClientProvider client={queryClient}>
    <RBACMatrix />
  </QueryClientProvider>
);

export default RBAC;
