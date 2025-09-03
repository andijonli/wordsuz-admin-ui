import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { gamesService } from '../services/api';
import type { Game, GameAnswer, GameQuestion } from '../types';

const GameDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game & { questions?: (GameQuestion & { answers?: GameAnswer[] })[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [editGameOpen, setEditGameOpen] = useState(false);
  const [gameForm, setGameForm] = useState<Partial<Game>>({ title: '', description: '' });

  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<(GameQuestion & { answers?: GameAnswer[] }) | null>(null);
  const [questionForm, setQuestionForm] = useState<{ text: string }>({ text: '' });

  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [currentQuestionForAnswer, setCurrentQuestionForAnswer] = useState<GameQuestion | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<GameAnswer | null>(null);
  const [answerForm, setAnswerForm] = useState<{ text: string; isCorrect: boolean }>({ text: '', isCorrect: false });

  const fetchGame = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await gamesService.getGame(id);
      setGame(data as unknown as (Game & { questions?: (GameQuestion & { answers?: GameAnswer[] })[] }));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openEditGame = () => {
    if (!game) return;
    setGameForm({ title: game.title, description: game.description });
    setEditGameOpen(true);
  };

  const saveGame = async () => {
    if (!id) return;
    try {
      await gamesService.updateGame(id, gameForm);
      setEditGameOpen(false);
      await fetchGame();
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ text: '' });
    setQuestionDialogOpen(true);
  };

  const openEditQuestion = (q: GameQuestion) => {
    setEditingQuestion(q);
    setQuestionForm({ text: q.text });
    setQuestionDialogOpen(true);
  };

  const saveQuestion = async () => {
    if (!id) return;
    try {
      if (editingQuestion) {
        await gamesService.updateQuestion(editingQuestion.id, { text: questionForm.text });
      } else {
        await gamesService.addQuestion(id, { text: questionForm.text } as Partial<GameQuestion>);
      }
      setQuestionDialogOpen(false);
      await fetchGame();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await gamesService.deleteQuestion(questionId);
      await fetchGame();
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateAnswer = (q: GameQuestion) => {
    setCurrentQuestionForAnswer(q);
    setEditingAnswer(null);
    setAnswerForm({ text: '', isCorrect: false });
    setAnswerDialogOpen(true);
  };

  const openEditAnswer = (ans: GameAnswer) => {
    setEditingAnswer(ans);
    setAnswerForm({ text: ans.text, isCorrect: ans.isCorrect });
    setAnswerDialogOpen(true);
  };

  const saveAnswer = async () => {
    try {
      if (editingAnswer) {
        await gamesService.updateAnswer(editingAnswer.id, answerForm);
      } else if (currentQuestionForAnswer) {
        await gamesService.addAnswer(currentQuestionForAnswer.id, answerForm);
      }
      setAnswerDialogOpen(false);
      await fetchGame();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAnswer = async (answerId: string) => {
    if (!confirm('Delete this answer?')) return;
    try {
      await gamesService.deleteAnswer(answerId);
      await fetchGame();
    } catch (e) {
      console.error(e);
    }
  };

  const createdAt = useMemo(() => (game ? new Date(game.createdAt).toLocaleString() : ''), [game]);
  const updatedAt = useMemo(() => (game ? new Date(game.updatedAt).toLocaleString() : ''), [game]);

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Tooltip title="Back to Games">
          <IconButton onClick={() => navigate('/games')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5">Game Details</Typography>
        <Box flexGrow={1} />
        <Button variant="outlined" onClick={openEditGame} disabled={!game}>Edit Game</Button>
      </Stack>

      {loading && <LinearProgress />}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {game && (
        <Box component={Paper} sx={{ p: 2, mb: 3, width: '100%' }}>
          <Typography variant="h6" gutterBottom>{game.title}</Typography>
          {game.description && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {game.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Created: {createdAt} • Updated: {updatedAt}
          </Typography>
        </Box>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6">Questions</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openCreateQuestion} disabled={!game}>Add Question</Button>
      </Stack>

      <TableContainer component={Paper} sx={{ width: '100%' }} >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Answers</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {game?.questions?.map((q) => (
              <TableRow key={q.id} hover>
                <TableCell sx={{ width: '35%' }}>{q.text}</TableCell>
                <TableCell>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Answer</TableCell>
                        <TableCell>Correct</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {q.answers?.map((a) => (
                        <TableRow key={a.id} hover>
                          <TableCell>{a.text}</TableCell>
                          <TableCell><Checkbox checked={a.isCorrect} disabled /></TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => openEditAnswer(a)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteAnswer(a.id)}><DeleteIcon fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Button size="small" startIcon={<AddIcon />} onClick={() => openCreateAnswer(q)}>Add answer</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEditQuestion(q)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => deleteQuestion(q.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!game?.questions?.length && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No questions yet</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Game Dialog */}
      <Dialog open={editGameOpen} onClose={() => setEditGameOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Game</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Title" value={gameForm.title || ''} onChange={e => setGameForm(f => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField label="Description" value={gameForm.description || ''} onChange={e => setGameForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGameOpen(false)}>Cancel</Button>
          <Button onClick={saveGame} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Question Dialog */}
      <Dialog open={questionDialogOpen} onClose={() => setQuestionDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Question" value={questionForm.text} onChange={e => setQuestionForm({ text: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveQuestion} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Answer Dialog */}
      <Dialog open={answerDialogOpen} onClose={() => setAnswerDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingAnswer ? 'Edit Answer' : 'Add Answer'}</DialogTitle>
        <DialogContent>
          <Stack mt={1} spacing={2}>
            <TextField label="Answer" value={answerForm.text} onChange={e => setAnswerForm(f => ({ ...f, text: e.target.value }))} fullWidth />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Checkbox checked={answerForm.isCorrect} onChange={(_, c) => setAnswerForm(f => ({ ...f, isCorrect: c }))} />
              <Typography>Correct answer</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnswerDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveAnswer} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GameDetail;
