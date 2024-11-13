import React, { useState } from 'react';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Container,
    Box,
    Typography
} from '@mui/material';
import { generateGoals } from '../services/api';

const LearningForm = ({ onSubmit }) => {
    const [topic, setTopic] = useState('');
    const [proficiency, setProficiency] = useState('beginner');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await onSubmit(topic.trim(), proficiency);
        } catch (err) {
            setError(err.message || 'Failed to generate learning goals. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Learning Path Generator
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="What do you want to learn?"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        margin="normal"
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Proficiency Level</InputLabel>
                        <Select
                            value={proficiency}
                            onChange={(e) => setProficiency(e.target.value)}
                            label="Proficiency Level"
                        >
                            <MenuItem value="beginner">Beginner</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="advanced">Advanced</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Learning Path'}
                    </Button>
                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                </form>
            </Box>
        </Container>
    );
};

export default LearningForm;