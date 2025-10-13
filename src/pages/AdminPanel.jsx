import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccessControl from "../components/AccessControl";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Users from "./Users";
import Categories from "./Categories";
import Products from "./products";
import Orders from "./Orders";
import RBAC from "./RBAC";

export default function AdminPanel() {
  const [open, setOpen] = useState(true);

  const [isOpen, setIsOpen] = useState("Users");

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
            <button onClick={() => setIsOpen("Users")}>Users</button>
          </ListItemButton>
        </List>
      </AccessControl>
      <AccessControl requiredPerms={["admin"]}>
        <List className="text-2xl font-semibold">
          <ListItemButton>
            <button onClick={() => setIsOpen("Products")}>Products</button>
          </ListItemButton>
        </List>
      </AccessControl>
      <AccessControl requiredPerms={["admin"]}>
        <List className="text-2xl font-semibold">
          <ListItemButton>
            <button onClick={() => setIsOpen("Categories")}>Categories</button>
          </ListItemButton>
        </List>
      </AccessControl>
      <AccessControl requiredPerms={["admin"]}>
        <List className="text-2xl font-semibold">
          <ListItemButton>
            <button onClick={() => setIsOpen("Orders")}>Orders</button>
          </ListItemButton>
        </List>
      </AccessControl>
      <AccessControl requiredPerms={["admin"]}>
        <List className="text-2xl font-semibold">
          <ListItemButton>
            <button onClick={() => setIsOpen("RBAC")}>Access Control</button>
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
      <div>
        {isOpen === "Users" && <Users />}
        {isOpen === "Categories" && <Categories />}
        {isOpen === "Products" && <Products />}
        {isOpen === "Orders" && <Orders />}
        {isOpen === "RBAC" && <RBAC />}
      </div>
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
