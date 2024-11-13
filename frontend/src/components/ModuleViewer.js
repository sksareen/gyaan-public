import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import ModuleContent from './ModuleContent';
import Roadmap from './Roadmap';

const ModuleViewer = () => {
  const { moduleId } = useParams();
  const [moduleData, setModuleData] = React.useState(null);

  React.useEffect(() => {
    const savedModules = JSON.parse(localStorage.getItem('savedModules') || '[]');
    const module = savedModules.find(m => m.id === parseInt(moduleId));
    if (module) {
      setModuleData(module);
    }
  }, [moduleId]);

  const processGoals = (goals, selectedGoals) => {
    if (!goals || !selectedGoals) return [];
    
    let finalGoals = Array.isArray(goals) ? goals : [goals];
    
    return finalGoals
      .flatMap(goal => {
        // Ensure goal is a string
        goal = typeof goal === 'string' ? goal : JSON.stringify(goal);

        // Use regex to extract text inside TextBlock
        const regex = /^\s*\[?TextBlock\(text="([\s\S]*?)"\s*(?:,\s*type='[^']+')?\)\]?\s*$/;

        const match = goal.match(regex);
        if (match) {
          goal = match[1];
        }

        // Clean up the goal text
        goal = goal
          .replace(/^#\s*@[^#\n]+/gm, '') // Remove header markers like "# @Goals.js"
          .replace(/\\n/g, '\n');         // Replace escaped newlines

        // Split into individual goals
        return goal
          .split('\n')                                       // Split into lines
          .map(g => g.replace(/^\d+\.\s*/, '').trim())       // Remove leading numbers and trim
          .filter(g => g.length > 0);                        // Remove empty lines
      })
      .filter(goal => selectedGoals.includes(goal));
  };

  if (!moduleData) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Module not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>{moduleData.topic}</Typography>
        <Typography variant="subtitle1" gutterBottom>
          Proficiency Level: {moduleData.proficiency}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Selected Goals:
        </Typography>
        <Box sx={{ pl: 2 }}>
          {processGoals(moduleData.goals, moduleData.selectedGoals).map((goal, index) => (
            <Typography 
              key={index} 
              variant="body1" 
              sx={{ 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                '&:before': {
                  content: '"•"',
                  marginRight: '8px',
                  color: 'primary.main',
                  fontSize: '1.2em'
                }
              }}
            >
              {goal}
            </Typography>
          ))}
        </Box>
      </Paper>
      
      <Roadmap roadmapData={moduleData.roadmap} resources={moduleData.resources} />
      <ModuleContent moduleData={moduleData.moduleContent} />
    </Box>
  );
};

export default ModuleViewer;
