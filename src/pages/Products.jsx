import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ProductModal from "../components/ProductModal";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessControl from "../components/AccessControl";

const fetchProducts = async () => {
  const { data } = await axios.get("http://localhost:3000/api/v1/product", {
    headers: { Authorization: localStorage.getItem("token") },
  });
  return data.data.products;
};

const saveProduct = (formData, selectedProductId) => {
  // ... (Your existing FormData construction logic remains here)
  const fd = new FormData();

  fd.append("title", formData.title);
  fd.append("slug", formData.slug);
  fd.append("description", formData.description);
  fd.append("price", Number(formData.price));
  fd.append("stock", Number(formData.stock));
  fd.append("sku", formData.sku);
  fd.append("category_id", Number(formData.category_id));
  fd.append("is_active", Number(formData.is_active));

  if (formData.images && formData.images.length > 0) {
    Array.from(formData.images).forEach((file) => fd.append("images", file));
  }

  const headers = {
    Authorization: localStorage.getItem("token"),
    "Content-Type": "multipart/form-data",
  };

  if (selectedProductId) {
    return axios.put(
      `http://localhost:3000/api/v1/product/${selectedProductId}`,
      fd,
      { headers }
    );
  } else {
    return axios.post("http://localhost:3000/api/v1/product", fd, { headers });
  }
};

const deleteProduct = async (productId) => {
  return axios.delete(`http://localhost:3000/api/v1/product/${productId}`, {
    headers: { Authorization: localStorage.getItem("token") },
  });
};

// ---------------------- RENDERER & COLUMN DEFINITION ----------------------

// Helper function to render the Action buttons in the DataGrid
const renderActions = (
  params,
  handleDeleteProduct,
  handleOpenEditModal,
  isSaving,
  isDeleting
) => {
  const product = params.row;

  return (
    <Box>
      <AccessControl requiredPerms={["admin", "update-product-management"]}>
        <IconButton
          onClick={() => handleOpenEditModal(product)}
          color="primary"
          size="small"
          disabled={isSaving || isDeleting}
        >
          <EditIcon fontSize="inherit" />
        </IconButton>
      </AccessControl>
      <AccessControl requiredPerms={["admin", "delete-product-management"]}>
        <IconButton
          onClick={() => handleDeleteProduct(product.id, product.title)}
          color="error"
          size="small"
          disabled={isSaving || isDeleting}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </AccessControl>
    </Box>
  );
};

// Helper function to create the columns array
const createColumns = (
  handleDeleteProduct,
  handleOpenEditModal,
  isSaving,
  isDeleting
) => [
  { field: "id", headerName: "ID", width: 100 },
  {
    field: "thumbnail",
    headerName: "Image",
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <img
        src={params.row.images?.[0]?.url || "https://via.placeholder.com/60"} // Fallback image
        alt={params.row.title}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ),
  },
  { field: "title", headerName: "Title", width: 250 },
  {
    field: "category",
    headerName: "Category",
    width: 200,
    renderCell: (params) => {
      return params.value.name;
    },
  },
  {
    field: "price",
    headerName: "Price",
    width: 150,
    type: "number",
    renderCell: (params) => (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <AttachMoneyIcon fontSize="small" color="success" />
        {params.value}
      </Box>
    ),
  },
  {
    field: "stock",
    headerName: "Stock",
    width: 150,
    type: "number",
    renderCell: (params) => (
      <Typography color={params.value > 0 ? "success.main" : "error.main"}>
        {params.value}
      </Typography>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 200,
    sortable: false,
    filterable: false,
    renderCell: (params) =>
      renderActions(
        params,
        handleDeleteProduct,
        handleOpenEditModal,
        isSaving,
        isDeleting
      ),
  },
];

const paginationModel = { page: 0, pageSize: 10 };

// ---------------------- MAIN COMPONENT ----------------------

const Products = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- Queries ---
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // --- Mutations ---
  const saveMutation = useMutation({
    mutationFn: (formData) => saveProduct(formData, selectedProduct?.id),
    onSuccess: (res) => {
      if (res.status === 200 || res.status === 201) {
        const action = selectedProduct ? "updated" : "added";
        toast.success(`✅ Product successfully ${action}!`);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setIsModalOpen(false);
        setSelectedProduct(null);
      } else {
        toast.error("❌ Failed to save product.");
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`❌ Error saving product: ${errorMessage}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (res) => {
      if (res.status === 200 || res.status === 204) {
        toast.success("✅ Product deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error("❌ Failed to delete product.");
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`❌ Error deleting product: ${errorMessage}`);
    },
  });

  // --- Handlers ---
  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId, productTitle) => {
    if (window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      deleteMutation.mutate(productId);
    }
  };

  const handleModalSubmit = (formData) => {
    saveMutation.mutate(formData);
  };

  const isSaving = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Generate columns, passing handlers and mutation states
  const columns = createColumns(
    handleDeleteProduct,
    handleOpenEditModal,
    isSaving,
    isDeleting
  );
  const rows = Array.isArray(data) ? data : [];

  // --- Render Logic ---
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[70vh] text-error">
        Something went wrong: {error.message}. Please login.
      </div>
    );

  return (
    <Box className="mx-10 my-5">
      {/* Header and Add Button */}
      <Box className="flex justify-between items-center mb-5">
        <Typography variant="h4" component="h1">
          Products Management
        </Typography>
        <AccessControl requiredPerms={["admin", "create-product-management"]}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            disabled={isSaving || isDeleting}
          >
            Add New Product
          </Button>
        </AccessControl>
      </Box>

      {/* DataGrid Table */}
      <Paper>
        <div style={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { paginationModel },
              sorting: { sortModel: [{ field: "title", sort: "asc" }] }, // Default sort
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            loading={isSaving || isDeleting} // Show loading state when mutating
            sx={{ border: 0, boxShadow: 1 }}
          />
        </div>
      </Paper>

      {/* Product Modal Component */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleModalSubmit}
        product={selectedProduct}
        isSaving={isSaving}
      />
    </Box>
  );
};

export default Products;
