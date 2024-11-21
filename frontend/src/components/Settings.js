import React, { useState, useEffect } from 'react';
import { 
    Typography, 
    TextField, 
    Button, 
    Container, 
    Box 
} from '@mui/material';

import theme from './Theme';

const Settings = () => {
    const [apiKeys, setApiKeys] = useState({
        perplexity: '',
        claude: ''
    });

    const [storedKeys, setStoredKeys] = useState({
        perplexity: '',
        claude: ''
    });

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setStoredKeys({
                    perplexity: data.perplexity,
                    claude: data.claude
                });
            })
            .catch(err => console.error('Error loading settings:', err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApiKeys(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    perplexity: apiKeys.perplexity,
                    claude: apiKeys.claude
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            const data = await fetch('/api/settings').then(res => res.json());
            setStoredKeys({
                perplexity: data.perplexity,
                claude: data.claude
            });

            setApiKeys({
                perplexity: '',
                claude: ''
            });

        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const maskApiKey = (key) => {
        if (!key || key.length < 10) return 'Not set';
        return `${key.slice(0, 5)}...${key.slice(-5)}`;
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h2" gutterBottom>
                    Settings
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2 
                }}>
                    <TextField
                        type="password"
                        label="Perplexity API Key"
                        id="perplexity"
                        name="perplexity"
                        value={apiKeys.perplexity}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        placeholder="Enter Perplexity API key"
                    />
                    <Typography variant="body3" pb={3}>
                       Current Perplexity Key: {maskApiKey(storedKeys.perplexity)}
                    </Typography>

                    <TextField
                        type="password"
                        label="Claude API Key"
                        id="claude"
                        name="claude"
                        value={apiKeys.claude}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        placeholder="Enter Claude API key"
                    />
                    <Typography variant="body3" pb={3}>
                        Current Claude Key: {maskApiKey(storedKeys.claude)}
                    </Typography>

                    <Button 
                        type="submit"
                        variant="contained" 
                        color="primary"
                        sx={{ mt: 2, color: theme.palette.background.main }}
                    >
                        Save Settings
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Settings;