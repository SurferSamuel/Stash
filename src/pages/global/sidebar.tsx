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
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceRounded";
import NotificationsIcon from "@mui/icons-material/NotificationsRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AddchartIcon from "@mui/icons-material/AddchartRounded";
import NoteAddIcon from "@mui/icons-material/NoteAddRounded";
import HomeIcon from "@mui/icons-material/HomeRounded";

// Custom logo icon
import LogoIcon from "../../assets/logo.svg"

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
      borderRight: `1px solid ${colors.grey[600]}`,
      background: `${colors.grey[900]} !important`,
    },
    "& .pro-sidebar-header": {
      borderBottom: `1px solid ${colors.grey[600]} !important`,
      marginTop: "8px",
    },
    "& .pro-sidebar-content": {
      marginTop: "-6px",
    },
    "& .pro-sidebar-footer": {
      borderTop: "none !important",
    },
    "& .pro-icon-wrapper": {
      marginLeft: "5px",
    },
    "& .pro-menu-item": {
      margin: "5px 12px 5px 12px !important",
      borderRadius: "8px",
    },
    "& .pro-inner-item": {
      padding: "2px 5px 2px 5px !important",
      borderRadius: "8px",
    },
    "& .pro-inner-item:hover": {
      color: `${colors.grey[100]} !important`,
      background: `${colors.grey[700]} !important`,
    },
    "& .pro-menu-item.active, & .pro-menu-item.active .pro-inner-item:hover": {
      color: `${colors.grey[100]} !important`,
      background: `${colors.grey[600]} !important`,
    },
    "& .pro-sidebar-header .pro-menu .pro-inner-item:hover": {
      background: "transparent !important", // Don't change bg color on logo
    }
  };

  return (
    <Box sx={overrideTheme}>
      <ProSidebar collapsed={isCollapsed} width={240}>
        <SidebarHeader>
          <Menu>
            {/* STASH Logo & Collapse Menu Button */}
            <MenuItem
              onClick={() => setIsCollapsed(!isCollapsed)}
              icon={isCollapsed ? <KeyboardDoubleArrowRightIcon /> : undefined}
              style={{
                color: colors.grey[100],
                height: "50px",
              }}
            >
              {!isCollapsed && (
                <Box display="flex" justifyContent="space-between" alignItems="center" ml="8px">
                  <Box display="flex" alignItems="center"> 
                    <LogoIcon style={{ width: '32px', height: '32px', marginRight: '10px', flexShrink: 0 }} />
                    <Typography variant="h2" fontWeight={500} color={colors.grey[100]}>
                      Stash
                    </Typography>
                  </Box>
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
