import React, {useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    type Theme,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import {
    Book as BookIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Comment as CommentIcon,
    Dashboard as DashboardIcon,
    Logout as LogoutIcon,
    People as PeopleIcon,
    SportsEsports as SportsEsportsIcon,
} from '@mui/icons-material';

import {useAuth} from "../contexts/UseAuth.tsx";

const drawerWidth = 240;
const miniDrawerWidth = 65;

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
}

const menuItems: MenuItem[] = [
    {text: 'Dashboard', icon: <DashboardIcon/>, path: '/dashboard'},
    {text: 'Users', icon: <PeopleIcon/>, path: '/users'},
    {text: 'Words', icon: <BookIcon/>, path: '/words'},
    {text: 'Games', icon: <SportsEsportsIcon/>, path: '/games'},
    {text: 'Comments', icon: <CommentIcon/>, path: '/comments'},
];

const Layout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(true);
    const [drawerExpanded, setDrawerExpanded] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const {logout} = useAuth();
    const navigate = useNavigate();
    const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

    const currentDrawerWidth = isDesktop
        ? (drawerExpanded || isHovering ? drawerWidth : miniDrawerWidth)
        : drawerWidth;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleMenuItemClick = (path: string) => {
        navigate(path);
        setMobileOpen(false);
    };

    const toggleDrawerExpanded = () => {
        setDrawerExpanded(!drawerExpanded);
    };

    const handleMouseEnter = () => {
        if (!drawerExpanded && isDesktop) {
            setIsHovering(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    const drawer = (
        <div>
            <Toolbar sx={{display: 'flex', justifyContent: 'space-between', px: 1}}>
                {(drawerExpanded || isHovering) && (
                    <Typography variant="h6" noWrap component="div">
                        WordsUz Admin
                    </Typography>
                )}
                {isDesktop && (
                    <IconButton onClick={toggleDrawerExpanded}>
                        {drawerExpanded ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                    </IconButton>
                )}
            </Toolbar>
            <Divider/>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <Tooltip title={(!drawerExpanded && !isHovering) ? item.text : ""} placement="right">
                            <ListItemButton onClick={() => handleMenuItemClick(item.path)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                {(drawerExpanded || isHovering) && (
                                    <ListItemText primary={item.text}/>
                                )}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>
            <Divider/>
            <List>
                <ListItem disablePadding>
                    <Tooltip title={(!drawerExpanded && !isHovering) ? "Logout" : ""} placement="right">
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon/>
                            </ListItemIcon>
                            {(drawerExpanded || isHovering) && (
                                <ListItemText primary="Logout"/>
                            )}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <Box
                component="nav"
                sx={{
                    width: {sm: currentDrawerWidth},
                    flexShrink: {sm: 0},
                    transition: theme => theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: {xs: 'block', sm: 'none'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: {xs: 'none', sm: 'block'},
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: currentDrawerWidth,
                            transition: theme => theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            overflowX: 'hidden',
                        },
                    }}
                    open
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    minHeight: '100vh',
                    flexGrow: 1,
                    p: 3,
                    width: {sm: `calc(100% - ${currentDrawerWidth}px)`},
                    transition: theme => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Outlet/>
            </Box>
        </Box>
    );
};

export default Layout;
