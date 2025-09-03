import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Stack, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { gamesService } from '../services/api';
import type {Game} from '../types';

const Games: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await gamesService.getGames(page, limit);
      setGames(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleOpenCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = (game: Game) => {
    setEditing(game);
    setForm({ title: game.title, description: game.description || '' });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await gamesService.updateGame(editing.id, form);
      } else {
        await gamesService.createGame(form);
      }
      setOpenDialog(false);
      fetchGames();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this game?')) return;
    try {
      await gamesService.deleteGame(id);
      fetchGames();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', minHeight: 'calc(100vh - 24px)' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Games</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={handleOpenCreate}>New Game</Button>
      </Stack>

      {loading && <LinearProgress />}

      <TableContainer component={Paper} sx={{ width: '100%' }} >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map(g => (
              <TableRow key={g.id} hover>
                <TableCell>
                  <Tooltip title="Open game details">
                    <Button variant="text" onClick={() => navigate(`/games/${g.id}`)}>{g.title}</Button>
                  </Tooltip>
                </TableCell>
                <TableCell>{g.description}</TableCell>
                <TableCell>{new Date(g.createdAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit" onClick={() => handleOpenEdit(g)}><EditIcon /></IconButton>
                  <IconButton aria-label="delete" color="error" onClick={() => handleDelete(g.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!games.length && (
              <TableRow>
                <TableCell colSpan={4} align="center">No games found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={Math.max(0, page - 1)}
          onPageChange={(_, p) => setPage(p + 1)}
          rowsPerPage={limit}
          onRowsPerPageChange={() => {}}
          rowsPerPageOptions={[limit]}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Game' : 'Create Game'}</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Games;
