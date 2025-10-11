import { useState } from "react";
import { adminLoginService, loginService } from "../services/auth.service";
import { useNavigate } from "react-router-dom";

import * as React from "react";
import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import Sheet from "@mui/joy/Sheet";
import CssBaseline from "@mui/joy/CssBaseline";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Link from "@mui/joy/Link";

export default function Login(props) {
  const [adminLogin, setAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    let res;
    if (adminLogin) {
      res = await adminLoginService(email, password);
    } else {
      res = await loginService(email, password);
    }
    if (res.success) navigate("/admin");
  };

  return (
    <main className="flex justify-center items-center h-screen">
      <CssVarsProvider {...props}>
        <CssBaseline />
        <Sheet
          sx={{
            width: 300,
            mx: "auto", // margin left & right
            my: 4, // margin top & bottom
            py: 3, // padding top & bottom
            px: 2, // padding left & right
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderRadius: "sm",
            boxShadow: "md",
          }}
          variant="outlined"
        >
          <div>
            <Typography level="h4" component="h1">
              <b>Welcome!</b>
            </Typography>
            <Typography level="body-sm">Sign in to continue.</Typography>
          </div>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              // html input attribute
              name="email"
              type="email"
              placeholder="johndoe@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              // html input attribute
              name="password"
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button onClick={handleLogin} sx={{ mt: 1 }}>
            Log in
          </Button>
          <div className="flex gap-3 items-center p-2 cursor-pointer">
            <input
              type="checkbox"
              name="isAdmin"
              id="isAdmin"
              value={adminLogin}
              onChange={() => setAdminLogin((state) => !state)}
            />
            <label htmlFor="isAdmin">ADMIN LOGIN</label>
          </div>
        </Sheet>
      </CssVarsProvider>
    </main>
  );
}
