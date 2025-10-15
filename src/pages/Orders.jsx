import { useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

// MUI Icons
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // Pending
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Delivered
import CancelIcon from "@mui/icons-material/Cancel"; // Canceled
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";

// ---------------------- API CALLS ----------------------

const fetchOrders = async () => {
  const { data } = await axios.get("http://localhost:3000/api/v1/orders/all", {
    headers: { Authorization: localStorage.getItem("token") },
  });
  // Ensure the orders are correctly shaped with an 'id' field for DataGrid
  return data.data.orders.map((order) => ({
    ...order,
    id: order.order_id, // Map order_id to DataGrid's required 'id'
    userName: order.user.name,
    userEmail: order.user.email,
  }));
};

const updateOrderStatus = async ({ orderId, status }) => {
  const res = await axios.put(
    `http://localhost:3000/api/v1/orders/${orderId}/status`,
    { status },
    { headers: { Authorization: localStorage.getItem("token") } }
  );
  return res;
};

// ---------------------- RENDERERS & HELPERS ----------------------

const getStatusChip = (status) => {
  const normalizedStatus = status.toLowerCase();
  const map = {
    pending: { label: "Pending", color: "warning", icon: <AccessTimeIcon /> },
    delivered: {
      label: "Delivered",
      color: "success",
      icon: <CheckCircleIcon />,
    },
    canceled: { label: "Canceled", color: "error", icon: <CancelIcon /> },
  };
  return map[normalizedStatus] || { label: normalizedStatus, color: "default" };
};

// ---------------------- MODAL/DETAIL COMPONENT (Simplified) ----------------------

const OrderDetailModal = ({ open, order, onClose }) => {
  if (!open || !order) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Order Details: #{order.id}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>
          Customer: {order.userName} ({order.userEmail})
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Order Items ({order.items.length})
        </Typography>
        <table className="table w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.order_item_id}>
                <td>{item.title}</td>
                <td>{item.quantity}</td>
                <td>${item.price_at_purchase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// NOTE: Add Dialog imports here (omitted for brevity, assume they are available)
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AccessControl from "../components/AccessControl";

// ---------------------- COLUMNS DEFINITION ----------------------

// Function to generate the DataGrid columns
const createColumns = (handleStatusChange, isMutationPending, toggleModal) => [
  { field: "id", headerName: "Order ID", width: 150 },
  { field: "userName", headerName: "Customer", width: 300 },
  { field: "userEmail", headerName: "Email", width: 300 },
  {
    field: "total_amount",
    headerName: "Total",
    width: 150,
    type: "number",
    valueFormatter: (params) => {
      `${params || "0.00"}`;
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 180,
    renderCell: (params) => {
      const chipProps = getStatusChip(params.value);
      return (
        <Chip
          label={chipProps.label}
          color={chipProps.color}
          icon={chipProps.icon}
          size="small"
        />
      );
    },
  },
  {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 300,
    getActions: (params) => [
      <div>
        <AccessControl requiredPerms={["admin", "update-product-management"]}>
          <Select
            value={
              params.row.status.charAt(0).toUpperCase() +
              params.row.status.slice(1)
            }
            onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
            variant="standard"
            size="small"
            disabled={isMutationPending}
            sx={{ minWidth: 100, fontSize: "0.875rem" }}
          >
            <MenuItem value={"Pending"}>Pending</MenuItem>
            <MenuItem value={"Delivered"}>Delivered</MenuItem>
            <MenuItem value={"Canceled"}>Canceled</MenuItem>
          </Select>
        </AccessControl>
      </div>,
    ],
  },
];

const paginationModel = { page: 0, pageSize: 10 };

// ---------------------- MAIN COMPONENT ----------------------

export default function Orders() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- QUERY: Fetch Orders ---
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  // --- MUTATION: Update Status ---
  const mutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (res) => {
      if (res.status === 200) {
        toast.success("✅ Order status updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      } else {
        toast.error("❌ Failed to update order status.");
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`❌ Error updating status: ${errorMessage}`);
    },
  });

  // --- Handlers ---
  const handleStatusChange = (orderId, newStatus) => {
    mutation.mutate({ orderId, status: newStatus.toLowerCase() });
  };

  const toggleModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const isMutationPending = mutation.isPending;

  // Generate columns with handlers and state
  const columns = createColumns(
    handleStatusChange,
    isMutationPending,
    toggleModal
  );
  const rows = Array.isArray(data) ? data : [];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-500">
        Something went wrong. Please login.
      </div>
    );

  return (
    <Box className="mx-10 my-5">
      <Box className="flex justify-between items-center mb-5">
        <Typography variant="h4" component="h1">
          Orders Management
        </Typography>
      </Box>

      <Paper>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowHeight={() => "auto"} // Allow rows to adjust height
            initialState={{
              pagination: { paginationModel },
              sorting: { sortModel: [{ field: "id", sort: "desc" }] },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            loading={isMutationPending}
            sx={{ border: 0, boxShadow: 1 }}
          />
        </div>
      </Paper>

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={isModalOpen}
        order={selectedOrder}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
}
