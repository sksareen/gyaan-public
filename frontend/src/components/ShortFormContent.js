import React, { useState } from 'react';
import { Box, MobileStepper, Button } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import LearningCard from './LearningCard';

const ShortFormContent = ({ learningCards, setMiniModuleLoading }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = learningCards.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ maxWidth: 400, flexGrow: 1, margin: 'auto', mt: 4 }}>
      <LearningCard
        title={learningCards[activeStep].title}
        description={learningCards[activeStep].description}
        type={learningCards[activeStep].type}
        setMiniModuleLoading={setMiniModuleLoading}
      />

      <MobileStepper
        variant="progress"
        steps={maxSteps}
        position="bottom"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            Next
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            <KeyboardArrowLeft />
            Back
          </Button>
        }
        sx={{ backgroundColor: 'transparent' }}
      />
    </Box>
  );
};

export default ShortFormContent;