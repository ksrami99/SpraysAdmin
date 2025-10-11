import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccessControl from "../components/AccessControl";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  const [open, setOpen] = React.useState(true);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 300 }} role="presentation" onClick={toggleDrawer(false)}>
      <h1 className="text-4xl font-semibold py-5 mx-3">Admin Panel</h1>
      <Divider />
      <AccessControl requiredPerms={["admin"]}>
        <List className="text-2xl font-semibold">
          <ListItemButton>
            <Link to={"/admin/users"}>Users</Link>
          </ListItemButton>
        </List>
      </AccessControl>
      <AccessControl requiredPerms={["admin"]}>
        <List className="text-2xl font-semibold">
          <ListItemButton>
            <List to="/admin/products">Products</List>
          </ListItemButton>
        </List>
      </AccessControl>
      <AccessControl requiredPerms={["admin"]}>
        <List className="text-2xl font-semibold">
          <ListItemButton>
            <Link to={"/admin/categories"}>Categories</Link>
          </ListItemButton>
        </List>
      </AccessControl>
      <AccessControl requiredPerms={["admin"]}>
        <List className="text-2xl font-semibold">
          <ListItemButton>
            <Link to={"admin/orders"}>Orders</Link>
          </ListItemButton>
        </List>
      </AccessControl>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#000", color: "#fff" }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            aria-label="menu"
            sx={{ mr: 2, color: "#fff" }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ADMIN PANEL
          </Typography>
          <Button color="inherit">
            <Link to="/">Login</Link>
          </Button>
        </Toolbar>
      </AppBar>
      <div></div>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </Box>
  );
}

{
  /* <TemporaryDrawer /> */
}
{
  /* <h2>Admin Panel</h2>

      <AccessControl requiredPerms={["create-product"]}>
        <button>Create Product</button>
      </AccessControl>

      <AccessControl requiredPerms={["delete-product"]}>
        <button>Delete Product</button>
      </AccessControl> */
}
