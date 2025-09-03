import React, {type ChangeEvent, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import Grid2 from '@mui/material/GridLegacy';
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {wordsService} from '../services/api';
import type {Example, VerbForm, Word, WordDefinition, WordDefinitionExample} from '../types';

interface WordDetailParams {
    wordId: string;
}

const WordDetail: React.FC = () => {
    const {wordId} = useParams<keyof WordDetailParams>() as WordDetailParams;
    const navigate = useNavigate();

    const [word, setWord] = useState<Word | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState<number>(0);

    const [editingWord, setEditingWord] = useState<boolean>(false);
    const [wordFormData, setWordFormData] = useState<Partial<Word>>({});

    const [openDefinitionDialog, setOpenDefinitionDialog] = useState<boolean>(false);
    const [editingDefinitionId, setEditingDefinitionId] = useState<string | null>(null);
    const [definitionFormData, setDefinitionFormData] = useState<Partial<WordDefinition>>({
        typeEn: '',
        typeUz: '',
        meaning: '',
        plural: ''
    });

    const [openExampleDialog, setOpenExampleDialog] = useState<boolean>(false);
    const [editingExampleId, setEditingExampleId] = useState<string | null>(null);
    const [exampleFormData, setExampleFormData] = useState<Partial<Example>>({
        phrase: '',
        translation: ''
    });

    const [openVerbFormDialog, setOpenVerbFormDialog] = useState<boolean>(false);
    const [editingVerbFormId, setEditingVerbFormId] = useState<string | null>(null);
    const [verbFormFormData, setVerbFormFormData] = useState<Partial<VerbForm>>({
        tense: '',
        content: [{
            title: '',
            forms: [{singular: '', plural: ''}]
        }]
    });

    const [openDeleteDefinitionDialog, setOpenDeleteDefinitionDialog] = useState<boolean>(false);
    const [openDeleteExampleDialog, setOpenDeleteExampleDialog] = useState<boolean>(false);
    const [openDeleteVerbFormDialog, setOpenDeleteVerbFormDialog] = useState<boolean>(false);
    const [definitionToDelete, setDefinitionToDelete] = useState<string | null>(null);
    const [exampleToDelete, setExampleToDelete] = useState<string | null>(null);
    const [verbFormToDelete, setVerbFormToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchWordDetails = async () => {
            try {
                setLoading(true);
                const wordData = await wordsService.getWord(wordId);
                console.log("wordData: ", wordData);

                if (wordData.titleEng) {
                    try {
                        const detailedWordData = await wordsService.getWordDetails(wordData.titleEng);
                        setWord({
                            ...wordData,
                            definitions: detailedWordData.definitions || [],
                            examples: detailedWordData.examples || [],
                            verbForms: detailedWordData.verbForms || [] // Note: backend uses verbforms, frontend uses verbForms
                        });
                    } catch (detailError) {
                        console.error('Failed to fetch detailed word data:', detailError);
                        setWord(wordData);
                    }
                } else {
                    setWord(wordData);
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch word:', err);
                setError('Failed to fetch word details');
            } finally {
                setLoading(false);
            }
        };

        fetchWordDetails();
    }, [wordId]);

    // Initialize form data when word data is loaded
    useEffect(() => {
        if (word) {
            setWordFormData({
                titleEng: word.titleEng,
                titleUz: word.titleUz,
                transcription: word.transcription,
                usageFrequency: word.usageFrequency,
                synonyms: word.synonyms,
                anagrams: word.anagrams
            });
        }
    }, [word]);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleGoBack = () => {
        navigate('/words');
    };

    // Word edit handlers
    const handleEditWord = () => {
        setEditingWord(true);
    };

    const handleWordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setWordFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'synonyms' | 'anagrams') => {
        const value = e.target.value;
        setWordFormData(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(item => item !== '')
        }));
    };

    const handleSaveWord = async () => {
        if (!word) return;

        try {
            setLoading(true);
            const updatedWord = await wordsService.updateWord(word.id, wordFormData);
            setWord({
                ...word,
                ...updatedWord
            });
            setEditingWord(false);
            setError(null);
        } catch (err) {
            console.error('Failed to update word:', err);
            setError('Failed to update word');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEditWord = () => {
        // Reset form data to current word data
        if (word) {
            setWordFormData({
                titleEng: word.titleEng,
                titleUz: word.titleUz,
                transcription: word.transcription,
                usageFrequency: word.usageFrequency,
                synonyms: word.synonyms,
                anagrams: word.anagrams
            });
        }
        setEditingWord(false);
    };

    // Definition dialog handlers
    const handleAddDefinition = () => {
        setDefinitionFormData({
            typeEn: '',
            typeUz: '',
            meaning: '',
            plural: ''
        });
        setEditingDefinitionId(null);
        setOpenDefinitionDialog(true);
    };

    const handleEditDefinition = (definition: WordDefinition) => {
        setDefinitionFormData({
            typeEn: definition.typeEn,
            typeUz: definition.typeUz,
            meaning: definition.meaning,
            plural: definition.plural
        });
        setEditingDefinitionId(definition.id || null);
        setOpenDefinitionDialog(true);
    };

    const handleSaveDefinition = async () => {
        if (!word) return;

        try {
            setLoading(true);
            let updatedDefinition: WordDefinition;

            if (editingDefinitionId) {
                updatedDefinition = await wordsService.updateDefinition(
                    word.id,
                    editingDefinitionId,
                    definitionFormData
                );

                setWord({
                    ...word,
                    definitions: word.definitions?.map(def =>
                        def.id === editingDefinitionId ? {...def, ...updatedDefinition} : def
                    ) || []
                });
            } else {
                updatedDefinition = await wordsService.addDefinition(
                    word.id,
                    definitionFormData
                );

                setWord({
                    ...word,
                    definitions: [...(word.definitions || []), updatedDefinition],
                    definitionsCount: (word.definitionsCount || 0) + 1
                });
            }

            setOpenDefinitionDialog(false);
            setError(null);
        } catch (err) {
            console.error('Failed to save definition:', err);
            setError('Failed to save definition');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExample = () => {
        setExampleFormData({
            phrase: '',
            translation: ''
        });
        setEditingExampleId(null);
        setOpenExampleDialog(true);
    };

    const handleEditExample = (example: Example) => {
        setExampleFormData({
            phrase: example.phrase,
            translation: example.translation
        });
        setEditingExampleId(example.id || null);
        setOpenExampleDialog(true);
    };

    const handleSaveExample = async () => {
        if (!word) return;

        try {
            setLoading(true);
            let updatedExample: WordDefinitionExample;

            if (editingExampleId) {
                updatedExample = await wordsService.updateExample(
                    word.id,
                    editingExampleId,
                    exampleFormData
                );

                setWord({
                    ...word,
                    examples: word.examples?.map(ex =>
                        ex.id === editingExampleId ? {...ex, ...updatedExample} : ex
                    ) || []
                });
            } else {
                updatedExample = await wordsService.addExample(
                    word.id,
                    exampleFormData
                );

                setWord({
                    ...word,
                    examples: [...(word.examples || []), updatedExample],
                    examplesCount: (word.examplesCount || 0) + 1
                });
            }

            setOpenExampleDialog(false);
            setError(null);
        } catch (err) {
            console.error('Failed to save example:', err);
            setError('Failed to save example');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVerbForm = () => {
        setVerbFormFormData({
            tense: '',
            content: [{
                title: '',
                forms: [{singular: '', plural: ''}]
            }]
        });
        setEditingVerbFormId(null);
        setOpenVerbFormDialog(true);
    };

    const handleEditVerbForm = (verbForm: VerbForm) => {
        const content = verbForm.content && verbForm.content.length > 0
            ? verbForm.content.map(item => ({
                ...item,
                forms: item.forms && item.forms.length > 0
                    ? item.forms
                    : [{singular: '', plural: ''}]
            }))
            : [{
                title: '',
                forms: [{singular: '', plural: ''}]
            }];

        setVerbFormFormData({
            tense: verbForm.tense,
            content: content
        });
        setEditingVerbFormId(verbForm.id || null);
        setOpenVerbFormDialog(true);
    };

    const handleSaveVerbForm = async () => {
        if (!word) return;

        try {
            setLoading(true);
            let updatedVerbForm: VerbForm;

            if (editingVerbFormId) {
                updatedVerbForm = await wordsService.updateVerbForm(
                    word.id,
                    editingVerbFormId,
                    verbFormFormData
                );

                setWord({
                    ...word,
                    verbForms: word.verbForms?.map(vf =>
                        vf.id === editingVerbFormId ? {...vf, ...updatedVerbForm} : vf
                    ) || []
                });
            } else {
                updatedVerbForm = await wordsService.addVerbForm(
                    word.id,
                    verbFormFormData
                );

                setWord({
                    ...word,
                    verbForms: [...(word.verbForms || []), updatedVerbForm],
                    verbFormsCount: (word.verbFormsCount || 0) + 1
                });
            }

            setOpenVerbFormDialog(false);
            setError(null);
        } catch (err) {
            console.error('Failed to save verb form:', err);
            setError('Failed to save verb form');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDefinition = (definitionId: string) => {
        setDefinitionToDelete(definitionId);
        setOpenDeleteDefinitionDialog(true);
    };

    const handleDeleteExample = (exampleId: string) => {
        setExampleToDelete(exampleId);
        setOpenDeleteExampleDialog(true);
    };

    const handleDeleteVerbForm = (verbFormId: string) => {
        setVerbFormToDelete(verbFormId);
        setOpenDeleteVerbFormDialog(true);
    };

    const handleConfirmDeleteDefinition = async () => {
        if (!word || !definitionToDelete) return;

        try {
            setLoading(true);
            await wordsService.deleteDefinition(word.id, definitionToDelete);

            // Update the word state by removing the deleted definition
            setWord({
                ...word,
                definitions: word.definitions?.filter(def => def.id !== definitionToDelete) || [],
                definitionsCount: Math.max(0, (word.definitionsCount || 0) - 1)
            });

            setOpenDeleteDefinitionDialog(false);
            setDefinitionToDelete(null);
            setError(null);
        } catch (err) {
            console.error('Failed to delete definition:', err);
            setError('Failed to delete definition');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDeleteExample = async () => {
        if (!word || !exampleToDelete) return;

        try {
            setLoading(true);
            await wordsService.deleteExample(word.id, exampleToDelete);

            // Update the word state by removing the deleted example
            setWord({
                ...word,
                examples: word.examples?.filter(ex => ex.id !== exampleToDelete) || [],
                examplesCount: Math.max(0, (word.examplesCount || 0) - 1)
            });

            setOpenDeleteExampleDialog(false);
            setExampleToDelete(null);
            setError(null);
        } catch (err) {
            console.error('Failed to delete example:', err);
            setError('Failed to delete example');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDeleteVerbForm = async () => {
        if (!word || !verbFormToDelete) return;

        try {
            setLoading(true);
            await wordsService.deleteVerbForm(word.id, verbFormToDelete);

            // Update the word state by removing the deleted verb form
            setWord({
                ...word,
                verbForms: word.verbForms?.filter(vf => vf.id !== verbFormToDelete) || [],
                verbFormsCount: Math.max(0, (word.verbFormsCount || 0) - 1)
            });

            setOpenDeleteVerbFormDialog(false);
            setVerbFormToDelete(null);
            setError(null);
        } catch (err) {
            console.error('Failed to delete verb form:', err);
            setError('Failed to delete verb form');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !word) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
                <CircularProgress/>
            </Box>
        );
    }

    if (error && !word) {
        return (
            <Box>
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={handleGoBack}>
                    Go Back to Words List
                </Button>
            </Box>
        );
    }

    if (!word) {
        return (
            <Box>
                <Alert severity="error" sx={{mb: 2}}>
                    Word not found
                </Alert>
                <Button variant="contained" onClick={handleGoBack}>
                    Go Back to Words List
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                <IconButton onClick={handleGoBack} sx={{mr: 1}}>
                    <ArrowBackIcon/>
                </IconButton>
                <Typography variant="h4">
                    Word Details: {word.titleEng}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            )}

            <Paper sx={{mb: 3, p: 3, borderRadius: 2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Typography variant="h5">Basic Information</Typography>
                    {!editingWord ? (
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon/>}
                            onClick={handleEditWord}
                        >
                            Edit
                        </Button>
                    ) : (
                        <Box>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleCancelEditWord}
                                sx={{mr: 1}}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveWord}
                            >
                                Save
                            </Button>
                        </Box>
                    )}
                </Box>

                {!editingWord ? (
                    <Grid2 container spacing={2}>
                        <Grid2 item xs={12} md={6}>
                            <Typography variant="subtitle1">
                                <strong>English:</strong> {word.titleEng}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Uzbek:</strong> {word.titleUz}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Transcription:</strong> {word.transcription || 'N/A'}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Usage Frequency:</strong> {word.usageFrequency || 'N/A'}
                            </Typography>
                        </Grid2>
                        <Grid2 item xs={12} md={6}>
                            <Typography variant="subtitle1">
                                <strong>Synonyms:</strong>
                            </Typography>
                            <Box sx={{mt: 1, mb: 2}}>
                                {word.synonyms && word.synonyms.length > 0 ? (
                                    word.synonyms.map((synonym, index) => (
                                        <Chip key={index} label={synonym} sx={{mr: 1, mb: 1}}/>
                                    ))
                                ) : (
                                    <Typography variant="body2">No synonyms</Typography>
                                )}
                            </Box>
                            <Typography variant="subtitle1">
                                <strong>Anagrams:</strong>
                            </Typography>
                            <Box sx={{mt: 1}}>
                                {word.anagrams && word.anagrams.length > 0 ? (
                                    word.anagrams.map((anagram, index) => (
                                        <Chip key={index} label={anagram} sx={{mr: 1, mb: 1}}/>
                                    ))
                                ) : (
                                    <Typography variant="body2">No anagrams</Typography>
                                )}
                            </Box>
                        </Grid2>
                    </Grid2>
                ) : (
                    <Grid2 container spacing={2}>
                        <Grid2 item xs={12} md={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="titleEng"
                                label="English Title"
                                value={wordFormData.titleEng || ''}
                                onChange={handleWordFormChange}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                name="titleUz"
                                label="Uzbek Title"
                                value={wordFormData.titleUz || ''}
                                onChange={handleWordFormChange}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                name="transcription"
                                label="Transcription"
                                value={wordFormData.transcription || ''}
                                onChange={handleWordFormChange}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                name="usageFrequency"
                                label="Usage Frequency"
                                type="number"
                                value={wordFormData.usageFrequency || ''}
                                onChange={handleWordFormChange}
                            />
                        </Grid2>
                        <Grid2 item xs={12} md={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="synonyms"
                                label="Synonyms (comma-separated)"
                                value={wordFormData.synonyms?.join(', ') || ''}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleArrayChange(e, 'synonyms')}
                                helperText="Enter synonyms separated by commas"
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                name="anagrams"
                                label="Anagrams (comma-separated)"
                                value={wordFormData.anagrams?.join(', ') || ''}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleArrayChange(e, 'anagrams')}
                                helperText="Enter anagrams separated by commas"
                            />
                        </Grid2>
                    </Grid2>
                )}
            </Paper>

            <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="word details tabs">
                    <Tab label="Definitions"/>
                    <Tab label="Examples"/>
                    <Tab label="Verb Forms"/>
                    <Tab label="Statistics"/>
                </Tabs>
            </Box>

            {/* Definitions Tab */}
            {tabValue === 0 && (
                <Box>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6">Definitions</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={handleAddDefinition}
                        >
                            Add Definition
                        </Button>
                    </Box>

                    {word.definitions && word.definitions.length > 0 ? (
                        word.definitions.map((definition, index) => (
                            <Accordion key={index} sx={{mb: 2}}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography>
                                        <strong>{definition.typeEn}</strong> - {definition.meaning}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{mb: 2}}>
                                        <Typography variant="subtitle2">Part of Speech:</Typography>
                                        <Typography>English: {definition.typeEn}</Typography>
                                        <Typography>Uzbek: {definition.typeUz || 'N/A'}</Typography>
                                    </Box>

                                    <Box sx={{mb: 2}}>
                                        <Typography variant="subtitle2">Primary Meaning:</Typography>
                                        <Typography>{definition.meaning}</Typography>
                                    </Box>

                                    {definition.plural && (
                                        <Box sx={{mb: 2}}>
                                            <Typography variant="subtitle2">Plural Form:</Typography>
                                            <Typography>{definition.plural}</Typography>
                                        </Box>
                                    )}

                                    {definition.others && definition.others.length > 0 && (
                                        <Box sx={{mb: 2}}>
                                            <Typography variant="subtitle2">Other Meanings:</Typography>
                                            <List>
                                                {definition.others.map((other, otherIndex) => (
                                                    <ListItem key={otherIndex} sx={{display: 'block'}}>
                                                        <ListItemText primary={other.meaning}/>

                                                        {other.examples && other.examples.length > 0 && (
                                                            <Box sx={{ml: 2}}>
                                                                <Typography variant="subtitle2">Examples:</Typography>
                                                                <List>
                                                                    {other.examples.map((example, exampleIndex) => (
                                                                        <ListItem key={exampleIndex}>
                                                                            <ListItemText
                                                                                primary={example.phrase}
                                                                                secondary={example.translation && `Translation: ${example.translation}`}
                                                                            />
                                                                        </ListItem>
                                                                    ))}
                                                                </List>
                                                            </Box>
                                                        )}
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}

                                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon/>}
                                            onClick={() => handleEditDefinition(definition)}
                                            sx={{mr: 1}}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon/>}
                                            onClick={() => handleDeleteDefinition(definition.id || '')}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Alert severity="info">No definitions available for this word.</Alert>
                    )}
                </Box>
            )}

            {/* Examples Tab */}
            {tabValue === 1 && (
                <Box>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6">Examples</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={handleAddExample}
                        >
                            Add Example
                        </Button>
                    </Box>

                    {word.examples && word.examples.length > 0 ? (
                        <List>
                            {word.examples.map((example, index) => (
                                <Paper key={index} sx={{mb: 2, p: 2}}>
                                    <Typography variant="subtitle1">{example.phrase}</Typography>
                                    {example.translation && (
                                        <Typography variant="body2" color="text.secondary">
                                            Translation: {example.translation}
                                        </Typography>
                                    )}
                                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 1}}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<EditIcon/>}
                                            onClick={() => handleEditExample(example)}
                                            sx={{mr: 1}}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon/>}
                                            onClick={() => handleDeleteExample(example.id || '')}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </Paper>
                            ))}
                        </List>
                    ) : (
                        <Alert severity="info">No examples available for this word.</Alert>
                    )}
                </Box>
            )}

            {/* Verb Forms Tab */}
            {tabValue === 2 && (
                <Box>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6">Verb Forms</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={handleAddVerbForm}
                        >
                            Add Verb Form
                        </Button>
                    </Box>

                    {word.verbForms && word.verbForms.length > 0 ? (
                        word.verbForms.map((verbForm, index) => (
                            <Accordion key={index} sx={{mb: 2}}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography>
                                        <strong>{verbForm.tense}</strong>
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {verbForm.content && verbForm.content.map((content, contentIndex) => (
                                        <Box key={contentIndex} sx={{mb: 3}}>
                                            <Typography variant="subtitle1">{content.title}</Typography>
                                            <Divider sx={{my: 1}}/>

                                            {content.forms && content.forms.map((form, formIndex) => (
                                                <Box key={formIndex} sx={{display: 'flex', mb: 1}}>
                                                    <Box sx={{width: '50%'}}>
                                                        <Typography><strong>Singular:</strong> {form.singular}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{width: '50%'}}>
                                                        <Typography><strong>Plural:</strong> {form.plural}</Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    ))}

                                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon/>}
                                            onClick={() => handleEditVerbForm(verbForm)}
                                            sx={{mr: 1}}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon/>}
                                            onClick={() => handleDeleteVerbForm(verbForm.id || '')}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Alert severity="info">No verb forms available for this word.</Alert>
                    )}
                </Box>
            )}

            {/* Statistics Tab */}
            {tabValue === 3 && (
                <Box>
                    <Typography variant="h6" gutterBottom>Statistics</Typography>

                    <Grid2 container spacing={3}>
                        <Grid2 item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {word.definitionsCount || 0}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Definitions
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid2>

                        <Grid2 item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {word.examplesCount || 0}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Examples
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid2>

                        <Grid2 item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {word.verbFormsCount || 0}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Verb Forms
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid2>

                        <Grid2 item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {word.bookmarksCount || 0}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Bookmarks
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid2>

                        <Grid2 item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {word.commentsCount || 0}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Comments
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid2>
                    </Grid2>
                </Box>
            )}

            {/* Definition Dialog */}
            <Dialog open={openDefinitionDialog} onClose={() => setOpenDefinitionDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingDefinitionId ? 'Edit Definition' : 'Add Definition'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="typeEn"
                        label="Part of Speech (English)"
                        value={definitionFormData.typeEn || ''}
                        onChange={(e) => setDefinitionFormData({...definitionFormData, typeEn: e.target.value})}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="typeUz"
                        label="Part of Speech (Uzbek)"
                        value={definitionFormData.typeUz || ''}
                        onChange={(e) => setDefinitionFormData({...definitionFormData, typeUz: e.target.value})}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="meaning"
                        label="Primary Meaning"
                        multiline
                        rows={2}
                        value={definitionFormData.meaning || ''}
                        onChange={(e) => setDefinitionFormData({...definitionFormData, meaning: e.target.value})}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="plural"
                        label="Plural Form (if applicable)"
                        value={definitionFormData.plural || ''}
                        onChange={(e) => setDefinitionFormData({...definitionFormData, plural: e.target.value})}
                    />

                    {/* Other Meanings Section */}
                    <Box sx={{mt: 3, mb: 2}}>
                        <Typography variant="h6">Other Meanings</Typography>

                        {definitionFormData.others?.map((other, otherIndex) => (
                            <Box key={otherIndex} sx={{mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography variant="subtitle1">Other Meaning #{otherIndex + 1}</Typography>
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            const updatedOthers = [...(definitionFormData.others || [])];
                                            updatedOthers.splice(otherIndex, 1);
                                            setDefinitionFormData({...definitionFormData, others: updatedOthers});
                                        }}
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </Box>

                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Meaning"
                                    multiline
                                    rows={2}
                                    value={other.meaning}
                                    onChange={(e) => {
                                        const updatedOthers = [...(definitionFormData.others || [])];
                                        updatedOthers[otherIndex] = {
                                            ...updatedOthers[otherIndex],
                                            meaning: e.target.value
                                        };
                                        setDefinitionFormData({...definitionFormData, others: updatedOthers});
                                    }}
                                />

                                <Typography variant="subtitle2" sx={{mt: 2}}>Examples:</Typography>

                                {other.examples.map((example, exampleIndex) => (
                                    <Box key={exampleIndex} sx={{mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Typography variant="body2">Example #{exampleIndex + 1}</Typography>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const updatedOthers = [...(definitionFormData.others || [])];
                                                    const updatedExamples = [...updatedOthers[otherIndex].examples];
                                                    updatedExamples.splice(exampleIndex, 1);
                                                    updatedOthers[otherIndex] = {
                                                        ...updatedOthers[otherIndex],
                                                        examples: updatedExamples
                                                    };
                                                    setDefinitionFormData({
                                                        ...definitionFormData,
                                                        others: updatedOthers
                                                    });
                                                }}
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Box>

                                        <TextField
                                            fullWidth
                                            margin="dense"
                                            label="Phrase"
                                            size="small"
                                            value={example.phrase}
                                            onChange={(e) => {
                                                const updatedOthers = [...(definitionFormData.others || [])];
                                                const updatedExamples = [...updatedOthers[otherIndex].examples];
                                                updatedExamples[exampleIndex] = {
                                                    ...updatedExamples[exampleIndex],
                                                    phrase: e.target.value
                                                };
                                                updatedOthers[otherIndex] = {
                                                    ...updatedOthers[otherIndex],
                                                    examples: updatedExamples
                                                };
                                                setDefinitionFormData({...definitionFormData, others: updatedOthers});
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            margin="dense"
                                            label="Translation"
                                            size="small"
                                            value={example.translation}
                                            onChange={(e) => {
                                                const updatedOthers = [...(definitionFormData.others || [])];
                                                const updatedExamples = [...updatedOthers[otherIndex].examples];
                                                updatedExamples[exampleIndex] = {
                                                    ...updatedExamples[exampleIndex],
                                                    translation: e.target.value
                                                };
                                                updatedOthers[otherIndex] = {
                                                    ...updatedOthers[otherIndex],
                                                    examples: updatedExamples
                                                };
                                                setDefinitionFormData({...definitionFormData, others: updatedOthers});
                                            }}
                                        />
                                    </Box>
                                ))}

                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon/>}
                                    sx={{mt: 1}}
                                    onClick={() => {
                                        const updatedOthers = [...(definitionFormData.others || [])];
                                        const updatedExamples = [...updatedOthers[otherIndex].examples, {
                                            phrase: '',
                                            translation: ''
                                        }];
                                        updatedOthers[otherIndex] = {
                                            ...updatedOthers[otherIndex],
                                            examples: updatedExamples
                                        };
                                        setDefinitionFormData({...definitionFormData, others: updatedOthers});
                                    }}
                                >
                                    Add Example
                                </Button>
                            </Box>
                        ))}

                        <Button
                            variant="outlined"
                            startIcon={<AddIcon/>}
                            sx={{mt: 2}}
                            onClick={() => {
                                const updatedOthers = [...(definitionFormData.others || []), {
                                    meaning: '',
                                    examples: [{phrase: '', translation: ''}]
                                }];
                                setDefinitionFormData({...definitionFormData, others: updatedOthers});
                            }}
                        >
                            Add Other Meaning
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDefinitionDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveDefinition} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Example Dialog */}
            <Dialog open={openExampleDialog} onClose={() => setOpenExampleDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingExampleId ? 'Edit Example' : 'Add Example'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="phrase"
                        label="Example Phrase"
                        multiline
                        rows={2}
                        value={exampleFormData.phrase || ''}
                        onChange={(e) => setExampleFormData({...exampleFormData, phrase: e.target.value})}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="translation"
                        label="Translation"
                        multiline
                        rows={2}
                        value={exampleFormData.translation || ''}
                        onChange={(e) => setExampleFormData({...exampleFormData, translation: e.target.value})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenExampleDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveExample} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Verb Form Dialog */}
            <Dialog open={openVerbFormDialog} onClose={() => setOpenVerbFormDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingVerbFormId ? 'Edit Verb Form' : 'Add Verb Form'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="tense"
                        label="Tense"
                        value={verbFormFormData.tense || ''}
                        onChange={(e) => setVerbFormFormData({...verbFormFormData, tense: e.target.value})}
                        required
                    />

                    {/* Content Section */}
                    <Box sx={{mt: 3, mb: 2}}>
                        <Typography variant="h6">Verb Form Content</Typography>

                        {verbFormFormData.content?.map((contentItem, contentIndex) => (
                            <Box key={contentIndex} sx={{mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography variant="subtitle1">Content Section #{contentIndex + 1}</Typography>
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            const updatedContent = [...(verbFormFormData.content || [])];
                                            updatedContent.splice(contentIndex, 1);
                                            setVerbFormFormData({...verbFormFormData, content: updatedContent});
                                        }}
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </Box>

                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Title"
                                    value={contentItem.title}
                                    onChange={(e) => {
                                        const updatedContent = [...(verbFormFormData.content || [])];
                                        updatedContent[contentIndex] = {
                                            ...updatedContent[contentIndex],
                                            title: e.target.value
                                        };
                                        setVerbFormFormData({...verbFormFormData, content: updatedContent});
                                    }}
                                />

                                <Typography variant="subtitle2" sx={{mt: 2}}>Forms:</Typography>

                                {contentItem.forms.map((form, formIndex) => (
                                    <Box key={formIndex} sx={{mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1}}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Typography variant="body2">Form #{formIndex + 1}</Typography>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const updatedContent = [...(verbFormFormData.content || [])];
                                                    const updatedForms = [...updatedContent[contentIndex].forms];
                                                    updatedForms.splice(formIndex, 1);
                                                    updatedContent[contentIndex] = {
                                                        ...updatedContent[contentIndex],
                                                        forms: updatedForms
                                                    };
                                                    setVerbFormFormData({...verbFormFormData, content: updatedContent});
                                                }}
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Box>

                                        <Grid2 container spacing={2}>
                                            <Grid2 item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    margin="dense"
                                                    label="Singular"
                                                    size="small"
                                                    value={form.singular}
                                                    onChange={(e) => {
                                                        const updatedContent = [...(verbFormFormData.content || [])];
                                                        const updatedForms = [...updatedContent[contentIndex].forms];
                                                        updatedForms[formIndex] = {
                                                            ...updatedForms[formIndex],
                                                            singular: e.target.value
                                                        };
                                                        updatedContent[contentIndex] = {
                                                            ...updatedContent[contentIndex],
                                                            forms: updatedForms
                                                        };
                                                        setVerbFormFormData({
                                                            ...verbFormFormData,
                                                            content: updatedContent
                                                        });
                                                    }}
                                                />
                                            </Grid2>
                                            <Grid2 item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    margin="dense"
                                                    label="Plural"
                                                    size="small"
                                                    value={form.plural}
                                                    onChange={(e) => {
                                                        const updatedContent = [...(verbFormFormData.content || [])];
                                                        const updatedForms = [...updatedContent[contentIndex].forms];
                                                        updatedForms[formIndex] = {
                                                            ...updatedForms[formIndex],
                                                            plural: e.target.value
                                                        };
                                                        updatedContent[contentIndex] = {
                                                            ...updatedContent[contentIndex],
                                                            forms: updatedForms
                                                        };
                                                        setVerbFormFormData({
                                                            ...verbFormFormData,
                                                            content: updatedContent
                                                        });
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>
                                    </Box>
                                ))}

                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon/>}
                                    sx={{mt: 1}}
                                    onClick={() => {
                                        const updatedContent = [...(verbFormFormData.content || [])];
                                        const updatedForms = [...updatedContent[contentIndex].forms, {
                                            singular: '',
                                            plural: ''
                                        }];
                                        updatedContent[contentIndex] = {
                                            ...updatedContent[contentIndex],
                                            forms: updatedForms
                                        };
                                        setVerbFormFormData({...verbFormFormData, content: updatedContent});
                                    }}
                                >
                                    Add Form
                                </Button>
                            </Box>
                        ))}

                        <Button
                            variant="outlined"
                            startIcon={<AddIcon/>}
                            sx={{mt: 2}}
                            onClick={() => {
                                const updatedContent = [...(verbFormFormData.content || []), {
                                    title: '',
                                    forms: [{singular: '', plural: ''}]
                                }];
                                setVerbFormFormData({...verbFormFormData, content: updatedContent});
                            }}
                        >
                            Add Content Section
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenVerbFormDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveVerbForm} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Definition Confirmation Dialog */}
            <Dialog open={openDeleteDefinitionDialog} onClose={() => setOpenDeleteDefinitionDialog(false)}>
                <DialogTitle>Delete Definition</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this definition? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDefinitionDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDeleteDefinition} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Example Confirmation Dialog */}
            <Dialog open={openDeleteExampleDialog} onClose={() => setOpenDeleteExampleDialog(false)}>
                <DialogTitle>Delete Example</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this example? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteExampleDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDeleteExample} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Verb Form Confirmation Dialog */}
            <Dialog open={openDeleteVerbFormDialog} onClose={() => setOpenDeleteVerbFormDialog(false)}>
                <DialogTitle>Delete Verb Form</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this verb form? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteVerbFormDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDeleteVerbForm} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WordDetail;
