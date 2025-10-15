import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import AccessControl from "../components/AccessControl";

// Import Modal-related components for the edit functionality
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState } from "react"; // Ensure useState is imported

// ---------------------- API CALLS ----------------------

const fetchUsers = async () => {
  const { data } = await axios.get("http://localhost:3000/api/v1/user", {
    headers: {
      Authorization: `${localStorage.getItem("token")}`,
    },
  });
  return data.data;
};

const deleteUser = async (id) => {
  const res = await axios.delete(`http://localhost:3000/api/v1/user/${id}`, {
    headers: {
      Authorization: `${localStorage.getItem("token")}`,
    },
  });

  return res;
};

// New API call for updating a user
const updateUser = async (user) => {
  const { id, fullname, email } = user;
  const res = await axios.patch(
    `http://localhost:3000/api/v1/user/${id}`,
    { fullname, email }, // Data to update
    {
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
    }
  );
  return res;
};

// ---------------------- ACTION RENDERER ----------------------

// Update the renderActions function to accept the handleEdit function
const renderActions = (params, handleDelete, handleEdit) => {
  const user = params.row;

  const handleDeleteClick = () => {
    if (
      window.confirm(
        `Are you sure you want to delete user ${user.id} - ${user.fullname}?`
      )
    ) {
      handleDelete(user.id);
    }
  };

  const handleEditClick = () => {
    // Pass the entire user object to the parent handler
    handleEdit(user);
  };

  return (
    <Box>
      <AccessControl requiredPerms={["admin", "update-user-management"]}>
        <IconButton onClick={handleEditClick} color="primary" size="small">
          <EditIcon fontSize="inherit" />
        </IconButton>
      </AccessControl>
      <AccessControl requiredPerms={["admin", "delete-user-management"]}>
        <IconButton onClick={handleDeleteClick} color="error" size="small">
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </AccessControl>
    </Box>
  );
};

// ---------------------- COLUMNS DEFINITION ----------------------

// Update createColumns to accept both handlers
const createColumns = (handleDelete, handleEdit) => [
  { field: "id", headerName: "ID", width: 200 },
  { field: "fullname", headerName: "Name", width: 400 },
  { field: "email", headerName: "Email", width: 400 },
  {
    field: "actions",
    headerName: "Actions",
    width: 400,
    sortable: false,
    filterable: false,
    renderCell: (params) => renderActions(params, handleDelete, handleEdit),
  },
];

const paginationModel = { page: 0, pageSize: 5 };

// ---------------------- EDIT MODAL COMPONENT (Simple Example) ----------------------

function EditUserModal({ open, user, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState(
    user || { id: "", fullname: "", email: "" }
  );

  // Update form data when the 'user' prop changes (e.g., when a new user is selected for edit)
  React.useEffect(() => {
    setFormData(user || { id: "", fullname: "", email: "" });
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User: {user.fullname}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="fullname"
          label="Full Name"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.fullname}
          onChange={handleChange}
          sx={{ mt: 1 }}
        />
        <TextField
          margin="dense"
          name="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------- MAIN USERS COMPONENT ----------------------

export default function Categories() {
  const queryClient = useQueryClient();

  // State to manage the Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // --- QUERY: Fetch Users ---
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // --- MUTATION: Delete User ---
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (res) => {
      if (res.status === 200 || res.status === 204) {
        toast.success("✅ User deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error("❌ Failed to delete user");
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`❌ Error: ${errorMessage}`);
    },
  });

  // --- MUTATION: Update User ---
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (res) => {
      if (res.status === 200) {
        toast.success("✅ User updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setIsModalOpen(false); // Close modal on success
      } else {
        toast.error("❌ Failed to update user");
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`❌ Error updating user: ${errorMessage}`);
    },
  });

  // --- HANDLERS for Edit ---
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveEdit = (userData) => {
    // Trigger the update mutation with the form data
    updateMutation.mutate(userData);
  };

  // ---------------------- RENDERING ----------------------

  // Pass both mutation functions to createColumns
  const columns = createColumns(deleteMutation.mutate, handleEdit);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        Loading...
      </div>
    );

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        Error fetching users: {error.message}. Please check token/login.
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <>
      <Paper className="mx-10 my-5">
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            sx={{ border: 0, boxShadow: 1 }}
          />
        </div>
      </Paper>

      {/* The Edit Modal Component */}
      <EditUserModal
        open={isModalOpen}
        user={editingUser}
        onClose={handleCloseModal}
        onSave={handleSaveEdit}
        isSaving={updateMutation.isPending}
      />
    </>
  );
}
