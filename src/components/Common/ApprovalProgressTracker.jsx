import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Check from "@mui/icons-material/Check";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// Enhanced Custom Connector with gradient and animation
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 4,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 2,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
  },
}));  

// Enhanced Step Icon with beautiful animations and states
const StepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: ownerState.completed
    ? '#4CAF50'
    : ownerState.active
    ? '#2196F3'
    : theme.palette.grey[400],
  zIndex: 1,
  color: '#fff',
  width: 44,
  height: 44,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 'bold',
  fontSize: '14px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  cursor: 'pointer',
  ...(ownerState.active && {
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
    transform: 'scale(1.1)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      opacity: 0.3,
      animation: 'pulse 2s infinite',
    },
  }),
  ...(ownerState.completed && {
    background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
    transform: 'scale(1.05)',
  }),
  '&:hover': {
    transform: ownerState.active ? 'scale(1.15)' : ownerState.completed ? 'scale(1.1)' : 'scale(1.05)',
    boxShadow: ownerState.active 
      ? '0 6px 24px rgba(33, 150, 243, 0.5)' 
      : ownerState.completed 
      ? '0 6px 20px rgba(76, 175, 80, 0.4)'
      : '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 0.3,
    },
    '50%': {
      transform: 'scale(1.1)',
      opacity: 0.1,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 0.3,
    },
  },
}));

// Enhanced Step Label with better typography
const CustomStepLabel = styled(StepLabel)(({ theme, ownerState }) => ({
  '& .MuiStepLabel-label': {
    fontSize: '14px',
    fontWeight: ownerState.active ? 600 : ownerState.completed ? 500 : 400,
    color: ownerState.active 
      ? theme.palette.primary.main 
      : ownerState.completed 
      ? theme.palette.success.main 
      : theme.palette.text.secondary,
    transition: 'all 0.3s ease-in-out',
    marginTop: '12px',
  },
  '& .MuiStepLabel-label.Mui-active': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '& .MuiStepLabel-label.Mui-completed': {
    color: theme.palette.success.main,
    fontWeight: 500,
  },
}));

function CustomStepIcon(props) {
  const { active, completed, icon } = props;
  
  return (
    <StepIconRoot ownerState={{ completed, active }}>
      {completed ? (
        <Check sx={{ fontSize: 20 }} />
      ) : active ? (
        <FiberManualRecordIcon sx={{ fontSize: 12 }} />
      ) : (
        <span>{icon}</span>
      )}
    </StepIconRoot>
  );
}

const ApprovalProgressTracker = ({ steps, activeStep, completedSteps }) => {
  const completionPercentage = Math.round((completedSteps.length / steps.length) * 100);
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%', 
        margin: 'auto', 
        padding: '40px 20px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #2196F3, #21CBF3, #4CAF50)',
        }
      }}
    >
      {/* Progress Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Progress Tracker
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Track your approval process through each stage
        </Typography>
        
        {/* Progress Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip 
            label={`${completedSteps.length}/${steps.length} Steps`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip 
            label={`${completionPercentage}% Complete`}
            color="success"
            variant={completionPercentage === 100 ? "filled" : "outlined"}
            sx={{ fontWeight: 600 }}
          />
        </Box>
        
        {/* Progress Bar */}
        <Box sx={{ width: '60%', mx: 'auto', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: completionPercentage === 100 
                  ? 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)'
                  : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              }
            }}
          />
        </Box>
      </Box>

      {/* Main Stepper */}
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<CustomConnector />}
        sx={{ mb: 4 }}
      >
        {steps.map((label, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = index === activeStep;
          
          return (
            <Step key={label} completed={isCompleted}>
              <CustomStepLabel 
                StepIconComponent={CustomStepIcon}
                ownerState={{ active: isActive, completed: isCompleted }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
                      color: isActive ? 'primary.main' : isCompleted ? 'success.main' : 'text.secondary',
                      mb: 1
                    }}
                  >
                    {label}
                  </Typography>
                  {isCompleted && (
                    <Chip 
                      label="Completed" 
                      size="small" 
                      color="success" 
                      variant="filled"
                      sx={{ fontSize: '10px', height: '20px' }}
                    />
                  )}
                  {isActive && (
                    <Chip 
                      label="In Progress" 
                      size="small" 
                      color="primary" 
                      variant="filled"
                      sx={{ fontSize: '10px', height: '20px' }}
                    />
                  )}
                </Box>
              </CustomStepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Status Footer */}
      <Box 
        sx={{ 
          textAlign: 'center',
          p: 3,
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {completionPercentage === 100 ? '🎉 Process Complete!' : 
           activeStep === 0 ? '🚀 Ready to Start' : '⏳ In Progress'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {completionPercentage === 100 
            ? 'All steps have been successfully completed'
            : `Currently on step ${activeStep + 1}: ${steps[activeStep]}`
          }
        </Typography>
      </Box>
    </Paper>
  );
};

export default ApprovalProgressTracker;