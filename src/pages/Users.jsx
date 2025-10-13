import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { useState } from "react";
import AccessControl from "../components/AccessControl";

// Import Modal-related components for the edit/add functionality
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// ---------------------- API CALLS ----------------------

const fetchCategories = async () => {
  // NOTE: Changed "Token" to "token" for consistency, though using "Token" from old code
  const { data } = await axios.get("http://localhost:3000/api/v1/categories", {
    headers: { Authorization: localStorage.getItem("token") },
  });
  return data.data;
};

const deleteCategory = async (id) => {
  const res = await axios.delete(
    `http://localhost:3000/api/v1/categories/${id}`,
    { headers: { Authorization: localStorage.getItem("token") } }
  );
  return res;
};

const addCategory = async (newCategory) => {
  const res = await axios.post(
    `http://localhost:3000/api/v1/categories`,
    newCategory,
    { headers: { Authorization: localStorage.getItem("token") } }
  );
  return res;
};

// New API call for updating a category
const updateCategory = async (category) => {
  const { id, name, slug } = category;
  const res = await axios.patch(
    `http://localhost:3000/api/v1/categories/${id}`,
    { name, slug }, // Data to update
    { headers: { Authorization: localStorage.getItem("token") } }
  );
  return res;
};

// ---------------------- ACTION RENDERER ----------------------

const renderActions = (params, handleDelete, handleEdit) => {
  const category = params.row;

  const handleDeleteClick = () => {
    if (
      window.confirm(
        `Are you sure you want to delete category ${category.name}?`
      )
    ) {
      handleDelete(category.id);
    }
  };

  const handleEditClick = () => {
    handleEdit(category);
  };

  return (
    <Box>
      <AccessControl requiredPerms={["admin"]}>
        <IconButton onClick={handleEditClick} color="primary" size="small">
          <EditIcon fontSize="inherit" />
        </IconButton>
      </AccessControl>
      <AccessControl requiredPerms={["admin"]}>
        <IconButton onClick={handleDeleteClick} color="error" size="small">
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </AccessControl>
    </Box>
  );
};

// ---------------------- COLUMNS DEFINITION ----------------------

const createColumns = (handleDelete, handleEdit) => [
  // Ensure the field matches the property name in your fetched data
  { field: "id", headerName: "ID", width: 200 },
  { field: "name", headerName: "NAME", width: 450 },
  { field: "slug", headerName: "SLUG", width: 450 },
  {
    field: "actions",
    headerName: "ACTIONS",
    width: 350,
    sortable: false,
    filterable: false,
    renderCell: (params) => renderActions(params, handleDelete, handleEdit),
  },
];

const paginationModel = { page: 0, pageSize: 5 };

// ---------------------- EDIT/ADD MODAL COMPONENT ----------------------

function CategoryModal({
  open,
  initialData,
  onClose,
  onSave,
  isSaving,
  isAdding,
}) {
  const [formData, setFormData] = useState(
    initialData || { name: "", slug: "" }
  );

  React.useEffect(() => {
    setFormData(initialData || { name: "", slug: "" });
  }, [initialData, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.name || !formData.slug) {
      toast.error("Name and Slug are required.");
      return;
    }
    onSave(formData);
  };

  const title = isAdding
    ? "Add New Category"
    : `Edit Category: ${initialData?.name}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Category Name"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name || ""}
          onChange={handleChange}
          sx={{ mt: 1 }}
        />
        <TextField
          margin="dense"
          name="slug"
          label="Category Slug"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.slug || ""}
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

// ---------------------- MAIN CATEGORIES COMPONENT ----------------------

export default function Categories() {
  const queryClient = useQueryClient();

  // State to manage the Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // --- QUERY: Fetch Categories ---
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // --- MUTATION: Delete Category ---
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (res) => {
      if (res.status === 200 || res.status === 204) {
        toast.success("✅ Category deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        toast.error("❌ Failed to delete category");
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`❌ Error deleting category: ${errorMessage}`);
    },
  });

  // --- MUTATION: Update Category ---
  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: (res) => {
      if (res.status === 200) {
        toast.success("✅ Category updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsModalOpen(false); // Close modal on success
      } else {
        toast.error("❌ Failed to update category");
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`❌ Error updating category: ${errorMessage}`);
    },
  });

  // --- MUTATION: Add Category ---
  const addMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success("✅ Category added successfully!");
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setIsModalOpen(false); // Close modal on success
      } else {
        toast.error("❌ Failed to add category");
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`❌ Error adding category: ${errorMessage}`);
    },
  });

  // --- HANDLERS for CRUD Operations ---

  const handleEdit = (category) => {
    setModalInitialData(category);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalInitialData({ name: "", slug: "" }); // Empty data for adding
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalInitialData(null);
    setIsAdding(false);
  };

  const handleSave = (categoryData) => {
    if (isAdding) {
      addMutation.mutate(categoryData);
    } else {
      updateMutation.mutate(categoryData);
    }
  };

  // ---------------------- RENDERING ----------------------

  // Pass mutation functions to createColumns
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
        Error fetching categories: {error.message}. Please check token/login.
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <>
      <Box className="mx-10 my-5">
        <Box className="flex justify-between items-center mb-5">
          <Typography variant="h4" component="h1">
            Categories Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add New Category
          </Button>
        </Box>
        <Paper>
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
      </Box>

      {/* The Edit/Add Modal Component */}
      <CategoryModal
        open={isModalOpen}
        initialData={modalInitialData}
        onClose={handleCloseModal}
        onSave={handleSave}
        isSaving={updateMutation.isPending || addMutation.isPending}
        isAdding={isAdding}
      />
    </>
  );
}
