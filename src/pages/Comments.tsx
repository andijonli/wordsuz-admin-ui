import React, {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {
    Clear as ClearIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {commentsService} from '../services/api';
import type {Comment} from '../types';

const generateMockComments = (count: number): Comment[] => {
    const mockWords = [
        {id: '1', titleEng: 'Hello', titleUz: 'Salom'},
        {id: '2', titleEng: 'Goodbye', titleUz: 'Xayr'},
        {id: '3', titleEng: 'Thank you', titleUz: 'Rahmat'},
        {id: '4', titleEng: 'Please', titleUz: 'Iltimos'},
        {id: '5', titleEng: 'Yes', titleUz: 'Ha'},
        {id: '6', titleEng: 'No', titleUz: 'Yo\'q'},
    ];

    const mockUsernames = [
        'user123', 'language_lover', 'student2023', 'teacher_john',
        'learner_smith', 'polyglot42', null, 'word_enthusiast'
    ];

    const mockTexts = [
        'This word is very useful in everyday conversations.',
        'I\'ve been struggling with the pronunciation of this word.',
        'Could someone provide more examples of how to use this in a sentence?',
        'The translation seems incorrect. I think it should be different.',
        'I love how this word sounds! It\'s so melodic.',
        'This is one of the first words I learned in this language.',
        'Is there a more formal version of this word for official settings?',
        'The example sentences really helped me understand the usage.',
        'Are there any idioms or expressions that use this word?',
        'I think the definition could be clearer with more context.',
    ];

    return Array.from({length: count}, (_, index) => {
        const randomWord = mockWords[Math.floor(Math.random() * mockWords.length)];
        const randomUsername = mockUsernames[Math.floor(Math.random() * mockUsernames.length)];
        const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

        const updatedAt = new Date(createdAt);
        if (Math.random() > 0.7) { // 30% chance the comment was updated
            updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 48)); // Updated within 48 hours
        }

        return {
            id: `mock-${index + 1}`,
            username: randomUsername,
            text: randomText,
            wordId: randomWord.id,
            Word: randomWord,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString()
        };
    });
};

const Comments: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [useMockData, setUseMockData] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchInputValue, setSearchInputValue] = useState<string>('');
    const [mockComments, setMockComments] = useState<Comment[]>([]);

    const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [editFormData, setEditFormData] = useState({
        username: '',
        text: '',
        wordId: ''
    });

    const fetchComments = useCallback(async (page: number, limit: number, search: string = searchQuery) => {
        try {
            setLoading(true);

            if (useMockData) {
                const filteredComments = search
                    ? mockComments.filter(comment =>
                        comment.text.toLowerCase().includes(search.toLowerCase())
                    )
                    : mockComments;

                const startIndex = page * limit;
                const endIndex = startIndex + limit;
                const paginatedComments = filteredComments.slice(startIndex, endIndex);

                await new Promise(resolve => setTimeout(resolve, 500));

                setComments(paginatedComments);
                setTotal(filteredComments.length);
                setError(null);
            } else {
                const response = await commentsService.getComments(page + 1, limit, search);
                setComments(response.data);
                setTotal(response.meta.total);
                setError(null);
            }
        } catch (err) {
            console.error('Failed to fetch comments:', err);
            setError('Failed to fetch comments');
        } finally {
            setLoading(false);
        }
    }, [useMockData, mockComments, searchQuery]);

    const handleToggleMockData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setUseMockData(isChecked);
        setPage(0);

        if (isChecked) {
            setMockComments(generateMockComments(50));
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInputValue(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setSearchQuery(searchInputValue);
        setPage(0);
    };

    const handleClearSearch = () => {
        setSearchInputValue('');
        setSearchQuery('');
        setPage(0);
    };

    useEffect(() => {
        if (useMockData && mockComments.length === 0) {
            setMockComments(generateMockComments(50)); // Generate 50 mock comments
        }
    }, []);

    useEffect(() => {
        fetchComments(page, rowsPerPage);
    }, [page, rowsPerPage, useMockData, searchQuery, fetchComments]);

    // eslint-disable-next-line
    const handleChangePage = (_event: unknown, newPage: number) => {
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

    const handleViewComment = (comment: Comment) => {
        setSelectedComment(comment);
        setOpenViewDialog(true);
    };

    const handleEditClick = (comment: Comment) => {
        setSelectedComment(comment);
        setEditFormData({
            username: comment.username || '',
            text: comment.text,
            wordId: comment.wordId || ''
        });
        setOpenEditDialog(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async () => {
        if (!selectedComment) return;

        try {
            setLoading(true);
            await commentsService.updateComment(selectedComment.id, editFormData);
            setOpenEditDialog(false);
            fetchComments(page, rowsPerPage);
        } catch (err) {
            console.error('Failed to update comment:', err);
            setError('Failed to update comment');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (comment: Comment) => {
        setSelectedComment(comment);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedComment) return;

        try {
            setLoading(true);
            await commentsService.deleteComment(selectedComment.id);
            setOpenDeleteDialog(false);
            fetchComments(page, rowsPerPage);
        } catch (err) {
            console.error('Failed to delete comment:', err);
            setError('Failed to delete comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{height: '100%'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h4">
                    Comments Management
                </Typography>

                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={useMockData}
                                onChange={handleToggleMockData}
                                color="primary"
                            />
                        }
                        label="Use Mock Data"
                        sx={{mr: 2}}
                    />

                    <Box component="form" onSubmit={handleSearchSubmit} sx={{display: 'flex', alignItems: 'center'}}>
                        <TextField
                            size="small"
                            placeholder="Search in comments..."
                            value={searchInputValue}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon/>
                                    </InputAdornment>
                                ),
                                endAdornment: searchInputValue && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="clear search"
                                            onClick={handleClearSearch}
                                            edge="end"
                                            size="small"
                                        >
                                            <ClearIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{width: 250}}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ml: 1}}
                        >
                            Search
                        </Button>
                    </Box>
                </Box>
            </Box>

            {searchQuery && (
                <Box sx={{mb: 2, display: 'flex', alignItems: 'center'}}>
                    <Alert severity="info" sx={{flexGrow: 1}}>
                        Showing results for: <strong>{searchQuery}</strong>
                    </Alert>
                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon/>}
                        onClick={handleClearSearch}
                        sx={{ml: 2}}
                    >
                        Clear
                    </Button>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="600px">
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
                                    }}>Username</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Text</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Word</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Created At</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {comments.map((comment) => (
                                    <TableRow
                                        key={comment.id}
                                        sx={{
                                            '&:nth-of-type(odd)': {backgroundColor: 'rgba(0, 0, 0, 0.02)'},
                                            '&:hover': {backgroundColor: 'rgba(0, 0, 0, 0.04)'}
                                        }}
                                    >
                                        <TableCell sx={{maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                            {comment.id}
                                        </TableCell>
                                        <TableCell sx={{minWidth: 120}}>
                                            {comment.username || 'Anonymous'}
                                        </TableCell>
                                        <TableCell sx={{minWidth: 250}}>
                                            {comment.text.length > 80
                                                ? `${comment.text.substring(0, 80)}...`
                                                : comment.text}
                                        </TableCell>
                                        <TableCell sx={{minWidth: 150}}>
                                            {comment.Word
                                                ? `${comment.Word.titleEng} (${comment.Word.titleUz})`
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{minWidth: 150}}>{formatDate(comment.createdAt)}</TableCell>
                                        <TableCell sx={{minWidth: 150}}>
                                            <Tooltip title="View">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleViewComment(comment)}
                                                    sx={{mr: 1}}
                                                >
                                                    <VisibilityIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEditClick(comment)}
                                                    sx={{mr: 1}}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(comment)}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {comments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No comments found
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

            {/* View Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>View Comment</DialogTitle>
                <DialogContent>
                    {selectedComment && (
                        <Box>
                            <Typography variant="subtitle1">ID: {selectedComment.id}</Typography>
                            <Typography variant="subtitle1">
                                Username: {selectedComment.username || 'Anonymous'}
                            </Typography>
                            <Typography variant="subtitle1">
                                Word: {selectedComment.Word
                                ? `${selectedComment.Word.titleEng} (${selectedComment.Word.titleUz})`
                                : 'N/A'}
                            </Typography>
                            <Typography variant="subtitle1">
                                Created: {formatDate(selectedComment.createdAt)}
                            </Typography>
                            <Typography variant="subtitle1">
                                Updated: {formatDate(selectedComment.updatedAt)}
                            </Typography>
                            <Typography variant="subtitle1" sx={{mt: 2}}>Comment:</Typography>
                            <Paper elevation={1} sx={{p: 2, mt: 1, backgroundColor: '#f5f5f5'}}>
                                <Typography variant="body1">{selectedComment.text}</Typography>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Comment</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="username"
                        label="Username"
                        fullWidth
                        variant="outlined"
                        value={editFormData.username}
                        onChange={handleEditChange}
                        helperText="Leave empty for anonymous"
                    />
                    <TextField
                        margin="dense"
                        name="text"
                        label="Comment Text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editFormData.text}
                        onChange={handleEditChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="wordId"
                        label="Word ID"
                        fullWidth
                        variant="outlined"
                        value={editFormData.wordId}
                        onChange={handleEditChange}
                        helperText="UUID of the word this comment is associated with"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Comment</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this comment? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Comments;
