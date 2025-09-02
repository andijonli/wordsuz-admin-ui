import React, {useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {
    AppBar,
    Box,
    Button,
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
    Bookmark as BookmarkIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Comment as CommentIcon,
    Dashboard as DashboardIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    People as PeopleIcon,
    Translate as TranslateIcon,
} from '@mui/icons-material';

import {useAuth} from "../contexts/UseAuth.tsx";

const drawerWidth = 240;
const miniDrawerWidth = 65; // Width when collapsed

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
}

const menuItems: MenuItem[] = [
    {text: 'Dashboard', icon: <DashboardIcon/>, path: '/dashboard'},
    {text: 'Users', icon: <PeopleIcon/>, path: '/users'},
    {text: 'Words', icon: <BookIcon/>, path: '/words'},
    {text: 'Bookmarks', icon: <BookmarkIcon/>, path: '/bookmarks'},
    {text: 'Comments', icon: <CommentIcon/>, path: '/comments'},
    {text: 'Translators', icon: <TranslateIcon/>, path: '/translators'},
];

const Layout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerExpanded, setDrawerExpanded] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

    // Calculate current drawer width based on state
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
            <AppBar
                position="fixed"
                sx={{
                    width: {sm: `calc(100% - ${currentDrawerWidth}px)`},
                    ml: {sm: `${currentDrawerWidth}px`},
                    transition: theme => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{mr: 2, display: {sm: 'none'}}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{flexGrow: 1}}>
                        Admin Panel
                    </Typography>
                    {user && (
                        <Typography variant="body1" sx={{mr: 2}}>
                            {user.email}
                        </Typography>
                    )}
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
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
                    flexGrow: 1,
                    p: 3,
                    width: {sm: `calc(100% - ${currentDrawerWidth}px)`},
                    transition: theme => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Toolbar/>
                <Outlet/>
            </Box>
        </Box>
    );
};

export default Layout;
