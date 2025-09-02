import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tabs,
    Typography,
} from '@mui/material';
import Grid2 from '@mui/material/GridLegacy';
import {BarChart as BarChartIcon, List as ListIcon, People as PeopleIcon} from '@mui/icons-material';
import {usersService} from '../services/api';
import type {User, UserStats} from '../types';

const Users: React.FC = () => {
    const [tabValue, setTabValue] = useState<number>(0);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statsLoading, setStatsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        if (newValue === 1 && !stats) {
            fetchStats();
        }
    };

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const data = await usersService.getUserStats();
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
            setError('Failed to fetch user statistics');
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchUsers = async (page: number, limit: number) => {
        try {
            const response = await usersService.getUsers(page + 1, limit);
            setUsers(response.data);
            setTotal(response.meta.total);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to fetch users');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                await fetchUsers(page, rowsPerPage);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Users Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            )}

            <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="user management tabs"
                    sx={{mb: 2}}
                >
                    <Tab icon={<ListIcon/>} label="Users List"/>
                    <Tab icon={<BarChartIcon/>} label="User Statistics"/>
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                            <CircularProgress/>
                        </Box>
                    ) : (
                        <Paper sx={{width: '100%', mb: 2, boxShadow: 3, borderRadius: 2, overflow: 'hidden'}}>
                            <TableContainer sx={{minHeight: 700, maxHeight: '75vh'}}>
                                <Table stickyHeader size="medium">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ 
                                                fontWeight: 'bold', 
                                                backgroundColor: '#f5f5f5',
                                                borderBottom: '2px solid #1976d2'
                                            }}>ID</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 'bold', 
                                                backgroundColor: '#f5f5f5',
                                                borderBottom: '2px solid #1976d2'
                                            }}>Email</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 'bold', 
                                                backgroundColor: '#f5f5f5',
                                                borderBottom: '2px solid #1976d2'
                                            }}>Bookmarks</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 'bold', 
                                                backgroundColor: '#f5f5f5',
                                                borderBottom: '2px solid #1976d2'
                                            }}>Created At</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 'bold', 
                                                backgroundColor: '#f5f5f5',
                                                borderBottom: '2px solid #1976d2'
                                            }}>Updated At</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow 
                                                key={user.id}
                                                sx={{ 
                                                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                                }}
                                            >
                                                <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.id}</TableCell>
                                                <TableCell sx={{ minWidth: 200 }}>{user.email}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>{user.bookmarksCount || 0}</TableCell>
                                                <TableCell sx={{ minWidth: 180 }}>{formatDate(user.createdAt)}</TableCell>
                                                <TableCell sx={{ minWidth: 180 }}>{formatDate(user.updatedAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {users.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    No users found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                                component="div"
                                count={total}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ 
                                    borderTop: '1px solid rgba(224, 224, 224, 1)',
                                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                        fontWeight: 'medium',
                                    }
                                }}
                            />
                        </Paper>
                    )}
                </>
            )}

            {tabValue === 1 && (
                <>
                    {statsLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                            <CircularProgress/>
                        </Box>
                    ) : stats ? (
                        <Grid2 container spacing={3} sx={{mb: 4}}>
                            <Grid2 item xs={12} sm={6} md={3}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Card sx={{height: '100%'}}>
                                        <CardContent sx={{textAlign: 'center'}}>
                                            <PeopleIcon fontSize="large" color="primary"/>
                                            <Typography variant="h5" component="div" sx={{mt: 2}}>
                                                {stats.total}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Users
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Paper>
                            </Grid2>
                            <Grid2 item xs={12} sm={6} md={3}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Card sx={{height: '100%'}}>
                                        <CardContent sx={{textAlign: 'center'}}>
                                            <PeopleIcon fontSize="large" color="primary"/>
                                            <Typography variant="h5" component="div" sx={{mt: 2}}>
                                                {stats.lastWeek}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                New Users (Last Week)
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Paper>
                            </Grid2>
                            <Grid2 item xs={12} sm={6} md={3}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Card sx={{height: '100%'}}>
                                        <CardContent sx={{textAlign: 'center'}}>
                                            <PeopleIcon fontSize="large" color="primary"/>
                                            <Typography variant="h5" component="div" sx={{mt: 2}}>
                                                {stats.lastMonth}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                New Users (Last Month)
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Paper>
                            </Grid2>
                            <Grid2 item xs={12} sm={6} md={3}>
                                <Paper elevation={3} sx={{height: '100%'}}>
                                    <Card sx={{height: '100%'}}>
                                        <CardContent sx={{textAlign: 'center'}}>
                                            <PeopleIcon fontSize="large" color="primary"/>
                                            <Typography variant="h5" component="div" sx={{mt: 2}}>
                                                {stats.lastYear}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                New Users (Last Year)
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Paper>
                            </Grid2>
                        </Grid2>
                    ) : (
                        <Alert severity="info">No statistics available</Alert>
                    )}
                </>
            )}
        </Box>
    );
};

export default Users;
