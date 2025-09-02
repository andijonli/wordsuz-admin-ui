import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent
} from '@mui/material';
import {
  People as PeopleIcon,
  Bookmark as BookmarkIcon,
  Comment as CommentIcon,
  Book as BookIcon
} from '@mui/icons-material';

import { useAuth } from "../contexts/UseAuth.tsx";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { 
      title: 'Total Users', 
      value: '0', 
      icon: <PeopleIcon fontSize="large" color="primary" /> 
    },
    { 
      title: 'Total Words', 
      value: '0', 
      icon: <BookIcon fontSize="large" color="primary" /> 
    },
    { 
      title: 'Total Bookmarks', 
      value: '0', 
      icon: <BookmarkIcon fontSize="large" color="primary" /> 
    },
    { 
      title: 'Total Comments', 
      value: '0', 
      icon: <CommentIcon fontSize="large" color="primary" /> 
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Welcome back, {user?.username || user?.email || 'Admin'}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{ height: '100%' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  {stat.icon}
                  <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent activity to display.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
