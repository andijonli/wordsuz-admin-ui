import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Box, Card, CardContent, CircularProgress, Paper, Typography,} from '@mui/material';
import Grid2 from '@mui/material/GridLegacy';
import {Book as BookIcon, Comment as CommentIcon, People as PeopleIcon} from '@mui/icons-material';

import {useAuth} from "../contexts/UseAuth.tsx";
import {commentsService, usersService, wordsService} from '../services/api';
import type {Comment, PaginatedResponse, UserStats, Word} from '../types';

const Dashboard: React.FC = () => {
    const {user} = useAuth();

    const [usersTotal, setUsersTotal] = useState<number>(0);
    const [wordsTotal, setWordsTotal] = useState<number>(0);
    const [commentsTotal, setCommentsTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const [userStats, wordsPage, commentsPage] = (await Promise.all([
                    usersService.getUserStats(),
                    wordsService.getWords(1, 1),
                    commentsService.getComments(1, 1),
                ])) as [UserStats, PaginatedResponse<Word>, PaginatedResponse<Comment>];
                if (!isMounted) return;
                setUsersTotal(userStats.total ?? 0);
                setWordsTotal(wordsPage?.meta?.total ?? 0);
                setCommentsTotal(commentsPage?.meta?.total ?? 0);
            } catch (e) {
                console.error('Failed to load dashboard stats', e);
                if (!isMounted) return;
                setError('Failed to load dashboard statistics');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadStats();
        return () => {
            isMounted = false;
        };
    }, []);

    const stats = useMemo(() => ([
        {
            title: 'Total Users',
            value: usersTotal.toLocaleString(),
            icon: <PeopleIcon fontSize="large" color="primary"/>
        },
        {
            title: 'Total Words',
            value: wordsTotal.toLocaleString(),
            icon: <BookIcon fontSize="large" color="primary"/>
        },
        {
            title: 'Total Comments',
            value: commentsTotal.toLocaleString(),
            icon: <CommentIcon fontSize="large" color="primary"/>
        },
    ]), [usersTotal, wordsTotal, commentsTotal]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
                Welcome back, {user?.username || user?.email || 'Admin'}!
            </Typography>

            {error && (
                <Alert severity="error" sx={{mb: 2}}>{error}</Alert>
            )}

            <Grid2 container spacing={3} sx={{mt: 2}}>
                {stats.map((stat, index) => (
                    <Grid2 item xs={12} sm={6} md={3} key={index}>
                        <Paper elevation={3} sx={{height: '100%'}}>
                            <Card sx={{height: '100%'}}>
                                <CardContent sx={{
                                    textAlign: 'center',
                                    minHeight: 140,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    {stat.icon}
                                    <Typography variant="h5" component="div" sx={{mt: 2}}>
                                        {loading ? <CircularProgress size={24}/> : stat.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.title}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Paper>
                    </Grid2>
                ))}
            </Grid2>

            <Grid2 container spacing={3} sx={{mt: 3}}>
                <Grid2 item xs={12} md={6}>
                    <Paper elevation={3} sx={{p: 2}}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activity
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No recent activity to display.
                        </Typography>
                    </Paper>
                </Grid2>

                <Grid2 item xs={12} md={6}>
                    <Paper elevation={3} sx={{p: 2}}>
                        <Typography variant="h6" gutterBottom>
                            System Information
                        </Typography>
                        <Typography variant="body2">
                            <strong>Environment:</strong> Development
                        </Typography>
                        <Typography variant="body2">
                            <strong>Version:</strong> 0.1.0
                        </Typography>
                        <Typography variant="body2">
                            <strong>API Status:</strong> Online
                        </Typography>
                    </Paper>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default Dashboard;
