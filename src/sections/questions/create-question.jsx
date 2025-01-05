import React, { useState, useEffect } from 'react';
import {
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  TextareaAutosize,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import config from 'src/config'; // Import the config file

const QuestionBuilder = () => {
  const [question, setQuestion] = useState({ englishText: '', amharicText: '' });
  const [options, setOptions] = useState({
    A: { english: '', amharic: '' },
    B: { english: '', amharic: '' },
    C: { english: '', amharic: '' },
  });
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [date, setDate] = useState(dayjs());
  const account = JSON.parse(localStorage.getItem('userData'));
  const createdByUsername = account.username;
  //   console.log(createdByUsername,account.username)
  const [status] = useState('active');
  const [questionCount, setQuestionCount] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Hook for navigation

  const handleQuestionChange = (e, lang) => {
    setQuestion({
      ...question,
      [lang]: e.target.value,
    });
  };

  const handleOptionChange = (e, option, lang) => {
    setOptions({
      ...options,
      [option]: {
        ...options[option],
        [lang]: e.target.value,
      },
    });
  };

  const handleCorrectAnswerChange = (e) => {
    setCorrectAnswer(e.target.value);
  };

  const handleDateChange = async (newDate) => {
    setDate(newDate);

    try {
      const formattedDate = newDate.format('YYYY-MM-DD');
      const response = await axios.get(
        `${config.BASE_URL}/api/questions/checkQuestionCount?date=${formattedDate}`
      );
      setQuestionCount(response.data.count);
    } catch (error) {
      console.error('Error fetching question count:', error);
      setQuestionCount(null);
    }
  };

  // Fetch question count on initial mount
  useEffect(() => {
    const fetchInitialQuestionCount = async () => {
      try {
        const formattedDate = date.format('YYYY-MM-DD');
        const response = await axios.get(
          `${config.BASE_URL}/api/questions/checkQuestionCount?date=${formattedDate}`
        );
        setQuestionCount(response.data.count);
      } catch (error) {
        console.error('Error fetching question count:', error);
        setQuestionCount(null);
      }
    };

    fetchInitialQuestionCount();
  }, [date]);

  const validate = () => {
    const newErrors = {};

    if (!question.englishText) newErrors.englishText = 'English question is required';
    if (!question.amharicText) newErrors.amharicText = 'Amharic question is required';

    ['A', 'B', 'C'].forEach((option) => {
      if (!options[option].english)
        newErrors[`${option}English`] = `Option ${option} in English is required`;
      if (!options[option].amharic)
        newErrors[`${option}Amharic`] = `Option ${option} in Amharic is required`;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (date.isBefore(dayjs(), 'day')) {
      toast.error('Date cannot be in the past');
      return;
    }

    if (!validate()) {
      return;
    }

    const formattedData = {
      englishText: question.englishText,
      amharicText: question.amharicText,
      englishOptions: [options.A.english, options.B.english, options.C.english],
      amharicOptions: [options.A.amharic, options.B.amharic, options.C.amharic],
      correctAnswer,
      date: date.format('YYYY-MM-DD'),
      created_by_username: createdByUsername,
      status,
    };

    try {
      const response = await axios.post(`${config.BASE_URL}/api/questions`, formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.code === 1000) {
        toast.success('Question created successfully');
        setTimeout(() => navigate('/'), 2000); // Redirect after 2 seconds to allow toast to be displayed

        // Clear form or perform other actions as needed
        setQuestion({ englishText: '', amharicText: '' });
        setOptions({
          A: { english: '', amharic: '' },
          B: { english: '', amharic: '' },
          C: { english: '', amharic: '' },
        });
        setCorrectAnswer('A');
        setDate(dayjs());
        setErrors({});
      } else {
        toast.error('Failed to create question: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      const errorMessage =
        error.response?.data?.message || 'An error occurred while creating the question';
      toast.error(errorMessage);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
  <Box
    sx={{
      p: 4,
      // background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Paper
      elevation={6}
      sx={{
        p: 6,
        // maxWidth: '900px',
        width: '80%',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: 'bold', color: '#1976d2', textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
      >
        Create New Question
      </Typography>
      <br /> <br />
      <Grid container spacing={4}>
        {/* Question (English) */}
        <Grid item xs={12}>
          <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
            Question (English)
          </FormLabel>
          <TextareaAutosize
            minRows={3}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #1976d2',
              fontSize: '1rem',
            }}
            value={question.englishText}
            onChange={(e) => handleQuestionChange(e, 'englishText')}
          />
          {errors.englishText && <Alert severity="error">{errors.englishText}</Alert>}
        </Grid>

        {/* Question (Amharic) */}
        <Grid item xs={12}>
          <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
            Question (Amharic)
          </FormLabel>
          <TextareaAutosize
            minRows={3}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #1976d2',
              fontSize: '1rem',
            }}
            value={question.amharicText}
            onChange={(e) => handleQuestionChange(e, 'amharicText')}
          />
          {errors.amharicText && <Alert severity="error">{errors.amharicText}</Alert>}
        </Grid>

        {/* Options */}
        {['A', 'B', 'C'].map((option) => (
          <React.Fragment key={option}>
            <Grid item xs={6}>
              <TextField
                label={`Option ${option} (English)`}
                variant="outlined"
                fullWidth
                value={options[option].english}
                onChange={(e) => handleOptionChange(e, option, 'english')}
                sx={{ borderColor: '#1976d2' }}
                required
              />
              {errors[`${option}English`] && (
                <Alert severity="error">{errors[`${option}English`]}</Alert>
              )}
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={`Option ${option} (Amharic)`}
                variant="outlined"
                fullWidth
                value={options[option].amharic}
                onChange={(e) => handleOptionChange(e, option, 'amharic')}
                sx={{ borderColor: '#1976d2' }}
                required
              />
              {errors[`${option}Amharic`] && (
                <Alert severity="error">{errors[`${option}Amharic`]}</Alert>
              )}
            </Grid>
          </React.Fragment>
        ))}

        {/* Correct Answer */}
        <Grid item xs={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Select the Correct Answer
            </FormLabel>
            <RadioGroup row value={correctAnswer} onChange={handleCorrectAnswerChange}>
              {['A', 'B', 'C'].map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={`Option ${option}`}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Date Picker */}
        <Grid item xs={6}>
          <DatePicker
            label="Select Date"
            value={date}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
            disablePast
          />
        
        </Grid>
        <br />
        {questionCount !== null && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {`There are ${questionCount} questions scheduled for this date.`}
            </Alert>
          )}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            mr: 2,
            px: 3,
            py: 1,
            fontSize: '1rem',
            borderColor: '#1976d2',
            '&:hover': { backgroundColor: '#e3f2fd' },
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{
            px: 3,
            py: 1,
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          Submit Question
        </Button>
      </Box>
    </Paper>
    <ToastContainer />
  </Box>
</LocalizationProvider>
  );
};

export default QuestionBuilder;
