import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useTheme,
  Button,
  ListItemButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useDevice } from "@/hooks/useDevice";
import { signOut } from "aws-amplify/auth";
import { useQueryClient } from "@tanstack/react-query";
import { usePublicNavigate } from "../../routes/usePublicNavigate";

const drawerWidth = 240;

const Layout = () => {
  const theme = useTheme();
  const location = useLocation();
  const { isTabletOrDown } = useDevice();
  const [mobileOpen, setMobileOpen] = useState(false);
  const authNavigate = usePublicNavigate();
  const queryClient = useQueryClient();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      // Amplify v6では signOut() のオプションが変更されています
      await signOut();
      // キャッシュ削除
      await queryClient.clear();
      authNavigate.login();
    } catch (error) {
      console.error("ログアウトエラー:", error);
      // エラーが発生してもログインページに遷移
      authNavigate.login();
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "#fff",
        color: "#424242",
      }}
    >
      <div>
        <Toolbar />
        <List sx={{ pt: 0 }}>
          {[
            { label: "Top", to: "/" },
            { label: "About", to: "/about" },
            { label: "Task", to: "/tasks" },
          ].map(({ label, to }) => (
            <ListItem disablePadding key={to}>
              <ListItemButton
                component={Link}
                to={to}
                selected={location.pathname === to}
                onClick={() => isTabletOrDown && setMobileOpen(false)}
                sx={{
                  color: "#424242",
                  "&.Mui-selected": {
                    bgcolor: "#dddddd",
                    fontWeight: "bold",
                  },
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
      {/* ログアウトボタン */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleLogout}
          sx={{
            borderColor: "#f44336",
            color: "#f44336",
            "&:hover": {
              backgroundColor: "#f44336",
              color: "#fff",
            },
          }}
        >
          ログアウト
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isTabletOrDown && (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              Taskfolio
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>

      {/* ─── Drawer（常時表示：デスクトップ） ─────────── */}
      {!isTabletOrDown && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* ─── Drawer（一時表示：タブレット以下） ───────── */}
      {isTabletOrDown && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // パフォーマンス向上
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* offset for AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
