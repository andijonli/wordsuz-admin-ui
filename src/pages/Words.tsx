import React, {type ChangeEvent, useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
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
    Stack,
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
    Add as AddIcon,
    ArrowForward as ArrowForwardIcon,
    Clear as ClearIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {wordsService} from '../services/api';
import type {PaginatedResponse, Word} from '../types';

// Generate mock words for testing
const generateMockWords = (count: number): Word[] => {
    const mockTitlesEng = [
        'Hello', 'Goodbye', 'Thank you', 'Please', 'Yes', 'No',
        'Book', 'Computer', 'Phone', 'Car', 'House', 'School',
        'Friend', 'Family', 'Love', 'Hate', 'Happy', 'Sad',
        'Big', 'Small', 'Fast', 'Slow', 'Hot', 'Cold'
    ];

    const mockTitlesUz = [
        'Salom', 'Xayr', 'Rahmat', 'Iltimos', 'Ha', 'Yo\'q',
        'Kitob', 'Kompyuter', 'Telefon', 'Mashina', 'Uy', 'Maktab',
        'Do\'st', 'Oila', 'Sevgi', 'Nafrat', 'Baxtli', 'Xafa',
        'Katta', 'Kichik', 'Tez', 'Sekin', 'Issiq', 'Sovuq'
    ];

    return Array.from({length: count}, (_, index) => {
        const randomIndex = Math.floor(Math.random() * mockTitlesEng.length);
        const titleEng = mockTitlesEng[randomIndex];
        const titleUz = mockTitlesUz[randomIndex];

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

        const updatedAt = new Date(createdAt);
        if (Math.random() > 0.7) { // 30% chance the word was updated
            updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 48)); // Updated within 48 hours
        }

        return {
            id: `mock-${index + 1}`,
            titleEng,
            titleUz,
            transcription: `/${titleEng.toLowerCase()}/`,
            usageFrequency: Math.floor(Math.random() * 100),
            synonyms: ['synonym1', 'synonym2', 'synonym3'].slice(0, Math.floor(Math.random() * 3) + 1),
            anagrams: ['anagram1', 'anagram2'].slice(0, Math.floor(Math.random() * 2) + 1),
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
            definitionsCount: Math.floor(Math.random() * 5) + 1,
            examplesCount: Math.floor(Math.random() * 10) + 1,
            verbFormsCount: Math.floor(Math.random() * 3),
            bookmarksCount: Math.floor(Math.random() * 20),
            commentsCount: Math.floor(Math.random() * 15)
        };
    });
};

const Words: React.FC = () => {
    const navigate = useNavigate();
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [useMockData, setUseMockData] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchInputValue, setSearchInputValue] = useState<string>('');
    const [mockWords, setMockWords] = useState<Word[]>([]);

    // Dialog states
    const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Word>>({
        titleEng: '',
        titleUz: '',
        transcription: '',
        usageFrequency: 0,
        synonyms: [],
        anagrams: []
    });

    const fetchWords = useCallback(async (page: number, limit: number, search: string = searchQuery) => {
        try {
            setLoading(true);

            if (useMockData) {
                const filteredWords = search
                    ? mockWords.filter(word =>
                        word.titleEng.toLowerCase().includes(search.toLowerCase()) ||
                        word.titleUz.toLowerCase().includes(search.toLowerCase())
                    )
                    : mockWords;

                const startIndex = page * limit;
                const endIndex = startIndex + limit;
                const paginatedWords = filteredWords.slice(startIndex, endIndex);

                await new Promise(resolve => setTimeout(resolve, 500));

                setWords(paginatedWords);
                setTotal(filteredWords.length);
                setError(null);
            } else {
                const response = await wordsService.getWords(page + 1, limit, search);
                setWords(response.data);
                setTotal(response.meta.total);
                setError(null);
            }
        } catch (err) {
            console.error('Failed to fetch words:', err);
            setError('Failed to fetch words');
        } finally {
            setLoading(false);
        }
    }, [useMockData, mockWords, searchQuery]);

    const handleToggleMockData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setUseMockData(isChecked);
        setPage(0);

        if (isChecked) {
            setMockWords(generateMockWords(50));
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
        if (useMockData && mockWords.length === 0) {
            setMockWords(generateMockWords(50));
        }
    }, []);

    // Fetch words when page, rowsPerPage, useMockData, or searchQuery changes
    useEffect(() => {
        fetchWords(page, rowsPerPage);
    }, [page, rowsPerPage, useMockData, searchQuery, fetchWords]);

    const handleChangePage = (event: unknown, newPage: number) => {
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

    // View word
    const handleViewWord = (word: Word) => {
        setSelectedWord(word);
        setOpenViewDialog(true);
    };

    // Navigate to word details page
    const handleNavigateToWordDetail = (wordId: string) => {
        navigate(`/words/${wordId}`);
    };

    // Edit word
    const handleEditClick = (word: Word) => {
        setSelectedWord(word);
        setEditFormData({
            titleEng: word.titleEng,
            titleUz: word.titleUz,
            transcription: word.transcription || '',
            usageFrequency: word.usageFrequency || 0,
            synonyms: word.synonyms || [],
            anagrams: word.anagrams || []
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

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'synonyms' | 'anagrams') => {
        const value = e.target.value;
        setEditFormData(prev => ({
            ...prev,
            [field]: value.split(',')?.map(item => item.trim()).filter(item => item !== '')
        }));
    };

    const handleEditSubmit = async () => {
        if (!selectedWord) return;

        try {
            setLoading(true);
            if (useMockData) {
                // Update mock data
                const updatedMockWords = mockWords?.map(word =>
                    word.id === selectedWord.id ? {...word, ...editFormData} : word
                );
                setMockWords(updatedMockWords);
                setOpenEditDialog(false);
                fetchWords(page, rowsPerPage);
            } else {
                await wordsService.updateWord(selectedWord.id, editFormData);
                setOpenEditDialog(false);
                fetchWords(page, rowsPerPage);
            }
        } catch (err) {
            console.error('Failed to update word:', err);
            setError('Failed to update word');
        } finally {
            setLoading(false);
        }
    };

    // Delete word
    const handleDeleteClick = (word: Word) => {
        setSelectedWord(word);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedWord) return;

        try {
            setLoading(true);
            if (useMockData) {
                // Delete from mock data
                const updatedMockWords = mockWords.filter(word => word.id !== selectedWord.id);
                setMockWords(updatedMockWords);
                setOpenDeleteDialog(false);
                fetchWords(page, rowsPerPage);
            } else {
                await wordsService.deleteWord(selectedWord.id);
                setOpenDeleteDialog(false);
                fetchWords(page, rowsPerPage);
            }
        } catch (err) {
            console.error('Failed to delete word:', err);
            setError('Failed to delete word');
        } finally {
            setLoading(false);
        }
    };

    // Add word
    const handleAddClick = () => {
        setEditFormData({
            titleEng: '',
            titleUz: '',
            transcription: '',
            usageFrequency: 0,
            synonyms: [],
            anagrams: []
        });
        setOpenAddDialog(true);
    };

    const handleAddSubmit = async () => {
        try {
            setLoading(true);
            if (useMockData) {
                // Add to mock data
                const newWord: Word = {
                    id: `mock-${mockWords.length + 1}`,
                    titleEng: editFormData.titleEng || '',
                    titleUz: editFormData.titleUz || '',
                    transcription: editFormData.transcription,
                    usageFrequency: editFormData.usageFrequency,
                    synonyms: editFormData.synonyms || [],
                    anagrams: editFormData.anagrams || [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    definitionsCount: 0,
                    examplesCount: 0,
                    verbFormsCount: 0,
                    bookmarksCount: 0,
                    commentsCount: 0
                };
                setMockWords([newWord, ...mockWords]);
                setOpenAddDialog(false);
                fetchWords(page, rowsPerPage);
            } else {
                await wordsService.createWord(editFormData);
                setOpenAddDialog(false);
                fetchWords(page, rowsPerPage);
            }
        } catch (err) {
            console.error('Failed to add word:', err);
            setError('Failed to add word');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{height: '100%'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h4">
                    Words Management
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
                            placeholder="Search words..."
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

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={handleAddClick}
                        sx={{ml: 2}}
                    >
                        Add Word
                    </Button>
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
                                    }}>English</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Uzbek</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Transcription</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Usage</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Definitions</TableCell>
                                    <TableCell sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '2px solid #1976d2'
                                    }}>Examples</TableCell>
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
                                {words?.map((word) => (
                                    <TableRow
                                        key={word.id}
                                        sx={{
                                            '&:nth-of-type(odd)': {backgroundColor: 'rgba(0, 0, 0, 0.02)'},
                                            '&:hover': {backgroundColor: 'rgba(0, 0, 0, 0.04)'}
                                        }}
                                    >
                                        <TableCell sx={{maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                            {word.id}
                                        </TableCell>
                                        <TableCell sx={{minWidth: 120}}>
                                            {word.titleEng}
                                        </TableCell>
                                        <TableCell sx={{minWidth: 120}}>
                                            {word.titleUz}
                                        </TableCell>
                                        <TableCell sx={{minWidth: 120}}>
                                            {word.transcription || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {word.usageFrequency || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {word.definitionsCount || 0}
                                        </TableCell>
                                        <TableCell>
                                            {word.examplesCount || 0}
                                        </TableCell>
                                        <TableCell sx={{minWidth: 150}}>{formatDate(word.createdAt)}</TableCell>
                                        <TableCell sx={{minWidth: 150}}>
                                            <Tooltip title="Quick View">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleViewWord(word)}
                                                    sx={{mr: 1}}
                                                >
                                                    <VisibilityIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Details Page">
                                                <IconButton
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => handleNavigateToWordDetail(word.id)}
                                                    sx={{mr: 1}}
                                                >
                                                    <ArrowForwardIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEditClick(word)}
                                                    sx={{mr: 1}}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(word)}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {words.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            No words found
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
                <DialogTitle>View Word</DialogTitle>
                <DialogContent>
                    {selectedWord && (
                        <Box>
                            <Typography variant="subtitle1">ID: {selectedWord.id}</Typography>
                            <Typography variant="subtitle1">
                                English: {selectedWord.titleEng}
                            </Typography>
                            <Typography variant="subtitle1">
                                Uzbek: {selectedWord.titleUz}
                            </Typography>
                            <Typography variant="subtitle1">
                                Transcription: {selectedWord.transcription || '-'}
                            </Typography>
                            <Typography variant="subtitle1">
                                Usage Frequency: {selectedWord.usageFrequency || '-'}
                            </Typography>
                            <Typography variant="subtitle1">
                                Created: {formatDate(selectedWord.createdAt)}
                            </Typography>
                            <Typography variant="subtitle1">
                                Updated: {formatDate(selectedWord.updatedAt)}
                            </Typography>

                            <Typography variant="subtitle1" sx={{mt: 2}}>Synonyms:</Typography>
                            <Box sx={{mt: 1}}>
                                {selectedWord.synonyms && selectedWord.synonyms.length > 0 ? (
                                    <Stack direction="row" spacing={1}>
                                        {selectedWord.synonyms?.map((synonym, index) => (
                                            <Chip key={index} label={synonym}/>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2">No synonyms</Typography>
                                )}
                            </Box>

                            <Typography variant="subtitle1" sx={{mt: 2}}>Anagrams:</Typography>
                            <Box sx={{mt: 1}}>
                                {selectedWord.anagrams && selectedWord.anagrams.length > 0 ? (
                                    <Stack direction="row" spacing={1}>
                                        {selectedWord.anagrams?.map((anagram, index) => (
                                            <Chip key={index} label={anagram}/>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2">No anagrams</Typography>
                                )}
                            </Box>

                            <Typography variant="subtitle1" sx={{mt: 2}}>Statistics:</Typography>
                            <Box sx={{mt: 1}}>
                                <Typography
                                    variant="body2">Definitions: {selectedWord.definitionsCount || 0}</Typography>
                                <Typography variant="body2">Examples: {selectedWord.examplesCount || 0}</Typography>
                                <Typography variant="body2">Verb Forms: {selectedWord.verbFormsCount || 0}</Typography>
                                <Typography variant="body2">Bookmarks: {selectedWord.bookmarksCount || 0}</Typography>
                                <Typography variant="body2">Comments: {selectedWord.commentsCount || 0}</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Word</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="titleEng"
                        label="English Title"
                        fullWidth
                        variant="outlined"
                        value={editFormData.titleEng}
                        onChange={handleEditChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="titleUz"
                        label="Uzbek Title"
                        fullWidth
                        variant="outlined"
                        value={editFormData.titleUz}
                        onChange={handleEditChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="transcription"
                        label="Transcription"
                        fullWidth
                        variant="outlined"
                        value={editFormData.transcription}
                        onChange={handleEditChange}
                    />
                    <TextField
                        margin="dense"
                        name="usageFrequency"
                        label="Usage Frequency"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editFormData.usageFrequency}
                        onChange={handleEditChange}
                    />
                    <TextField
                        margin="dense"
                        name="synonyms"
                        label="Synonyms (comma-separated)"
                        fullWidth
                        variant="outlined"
                        value={editFormData.synonyms?.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'synonyms')}
                        helperText="Enter synonyms separated by commas"
                    />
                    <TextField
                        margin="dense"
                        name="anagrams"
                        label="Anagrams (comma-separated)"
                        fullWidth
                        variant="outlined"
                        value={editFormData.anagrams?.join(', ')}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleArrayChange(e, 'anagrams')}
                        helperText="Enter anagrams separated by commas"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Word</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="titleEng"
                        label="English Title"
                        fullWidth
                        variant="outlined"
                        value={editFormData.titleEng}
                        onChange={handleEditChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="titleUz"
                        label="Uzbek Title"
                        fullWidth
                        variant="outlined"
                        value={editFormData.titleUz}
                        onChange={handleEditChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="transcription"
                        label="Transcription"
                        fullWidth
                        variant="outlined"
                        value={editFormData.transcription}
                        onChange={handleEditChange}
                    />
                    <TextField
                        margin="dense"
                        name="usageFrequency"
                        label="Usage Frequency"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={editFormData.usageFrequency}
                        onChange={handleEditChange}
                    />
                    <TextField
                        margin="dense"
                        name="synonyms"
                        label="Synonyms (comma-separated)"
                        fullWidth
                        variant="outlined"
                        value={editFormData.synonyms?.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'synonyms')}
                        helperText="Enter synonyms separated by commas"
                    />
                    <TextField
                        margin="dense"
                        name="anagrams"
                        label="Anagrams (comma-separated)"
                        fullWidth
                        variant="outlined"
                        value={editFormData.anagrams?.join(', ')}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleArrayChange(e, 'anagrams')}
                        helperText="Enter anagrams separated by commas"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddSubmit} variant="contained" color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Word</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the word "{selectedWord?.titleEng}"? This action cannot be
                        undone.
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

export default Words;
