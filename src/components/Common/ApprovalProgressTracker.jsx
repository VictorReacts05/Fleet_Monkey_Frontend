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
import { styled, useTheme } from "@mui/material/styles";
import Check from "@mui/icons-material/Check";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 4,
    border: 0,
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "dark" ? 700 : 300],
    borderRadius: 2,
    transition: "all 0.3s ease-in-out",
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    background: "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
  },
}));

const StepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor: ownerState.completed
    ? "#4CAF50"
    : ownerState.active
    ? "#2196F3"
    : theme.palette.grey[500],
  zIndex: 1,
  color: "#fff",
  width: 44,
  height: 44,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "all 0.3s ease-in-out",
  position: "relative",
  "&::before": ownerState.active && {
    content: '""',
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: "50%",
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    opacity: 0.3,
    animation: "pulse 2s infinite",
  },
  "@keyframes pulse": {
    "0%": { transform: "scale(1)", opacity: 0.3 },
    "50%": { transform: "scale(1.1)", opacity: 0.1 },
    "100%": { transform: "scale(1)", opacity: 0.3 },
  },
}));

const CustomStepLabel = styled(StepLabel)(({ theme, ownerState }) => ({
  "& .MuiStepLabel-label": {
    fontSize: "14px",
    fontWeight: ownerState.active ? 600 : ownerState.completed ? 500 : 400,
    color: ownerState.active
      ? theme.palette.primary.main
      : ownerState.completed
      ? theme.palette.success.main
      : theme.palette.text.secondary,
    transition: "all 0.3s ease-in-out",
    marginTop: "12px",
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const completionPercentage = Math.round(
    (completedSteps.length / steps.length) * 100
  );

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        margin: "auto",
        padding: "40px 20px",
        borderRadius: "16px",
        background: isDarkMode
          ? "linear-gradient(135deg, #121212 0%, #1e1e1e 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        color: isDarkMode ? "#fff" : "#000",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Progress Tracker
        </Typography>
        <Typography
          variant="body1"
          color={isDarkMode ? "grey.300" : "text.secondary"}
          sx={{ mb: 3 }}
        >
          Track your approval process through each stage
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
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

        <Box sx={{ width: "60%", mx: "auto", mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background:
                  completionPercentage === 100
                    ? "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)"
                    : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              },
            }}
          />
        </Box>
      </Box>

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
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
                      color: isActive
                        ? "primary.main"
                        : isCompleted
                        ? "success.main"
                        : "text.secondary",
                      mb: 1,
                    }}
                  >
                    {label}
                  </Typography>
                  {isCompleted && (
                    <Chip
                      label="Completed"
                      size="small"
                      color="success"
                      sx={{ fontSize: "10px", height: "20px" }}
                    />
                  )}
                  {isActive && (
                    <Chip
                      label="In Progress"
                      size="small"
                      color="primary"
                      sx={{ fontSize: "10px", height: "20px" }}
                    />
                  )}
                </Box>
              </CustomStepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box
        sx={{
          textAlign: "center",
          p: 3,
          backgroundColor: isDarkMode
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.05)",
          borderRadius: "12px",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {completionPercentage === 100
            ? "🎉 Process Complete!"
            : activeStep === 0
            ? "🚀 Ready to Start"
            : "⏳ In Progress"}
        </Typography>
        <Typography
          variant="body2"
          color={isDarkMode ? "grey.300" : "text.secondary"}
        >
          {completionPercentage === 100
            ? "All steps have been successfully completed"
            : `Currently on step ${activeStep + 1}: ${steps[activeStep]}`}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ApprovalProgressTracker;
