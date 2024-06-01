import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";

// Material UI Icons
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddchartIcon from '@mui/icons-material/Addchart';
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import HomeIcon from "@mui/icons-material/Home";

interface Props {
  title: string;
  to: string;
  icon: ReactNode;
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

// Helper function for menu items
const Item = (props: Props) => {
  const { title, to, icon, selected, setSelected } = props;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography fontSize={16}>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  // Override specific themes
  const overrideTheme = {
    "& .pro-sidebar-inner": {
      background: `${colors.primary[600]} !important`,
    },
    "& .pro-icon-wrapper": {
      background: "transparent !important",
    },
    "& .pro-menu-item": {
      margin: "4px 12px 4px 12px !important",
      borderRadius: "10px",
    },
    "& .pro-inner-item": {
      padding: "5px 35px 5px 10px !important",
      borderRadius: "10px",
    },
    "& .pro-inner-item:hover": {
      color: `${colors.blueAccent[400]} !important`,
      background: `${colors.blueAccent[900]} !important`,
    },
    "& .pro-menu-item.active, & .pro-menu-item.active .pro-inner-item:hover": {
      color: "white !important",
      background: `${colors.blueAccent[500]} !important`,
    },
    "& .pro-sidebar-header .pro-menu .pro-inner-item:hover": {
      background: "transparent !important", // Don't change bg color on logo
    },
  };

  return (
    <Box sx={overrideTheme}>
      <ProSidebar collapsed={isCollapsed} width={260}>
        <SidebarHeader>
          <Menu>
            {/* STASH Logo & Collapse Menu Button */}
            <MenuItem
              onClick={() => setIsCollapsed(!isCollapsed)}
              icon={isCollapsed ? <KeyboardDoubleArrowRightIcon /> : undefined}
              style={{
                margin: "10px 0 10px 0",
                color: colors.grey[100],
                height: "50px",
              }}
            >
              {!isCollapsed && (
                <Box display="flex" justifyContent="space-between" alignItems="center" ml="24px">
                  <Typography variant="h2" fontWeight={500} color={colors.grey[100]}>
                    STASH
                  </Typography>
                  <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <KeyboardDoubleArrowLeftIcon />
                  </IconButton>
                </Box>
              )}
            </MenuItem>
          </Menu>
        </SidebarHeader>
        <SidebarContent>
          <Menu>
            <Box pt="8px">
              {/* Dashboard Button */}
              <Item
                title="Dashboard"
                to="/"
                icon={<HomeIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              {/* Notifications Button */}
              <Item
                title="Notifications"
                to="/"
                icon={<NotificationsIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              {/* Manage Text */}
              {!isCollapsed && (
                <Typography
                  variant="h6"
                  color={colors.grey[200]}
                  fontWeight={300}
                  sx={{ m: "15px 0 10px 20px" }}
                >
                  Manage
                </Typography>
              )}
              {/* Add Company Button */}
              <Item
                title="Add Company"
                to="/addCompany"
                icon={<NoteAddIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              {/* Add Trade Button */}
              <Item
                title="Add Trade"
                to="/addTrade"
                icon={<AddchartIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              {/* Portfolio Button */}
              <Item
                title="Portfolio"
                to="/portfolio"
                icon={<AccountBalanceIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              {/* TODO: Add more menu items here */}
            </Box>
          </Menu>
        </SidebarContent>
        <SidebarFooter>
          <Menu>
            <Box>
              {/* Settings Button */}
              <Item
                title="Settings"
                to="/settings"
                icon={<SettingsOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
          </Menu>
        </SidebarFooter>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
