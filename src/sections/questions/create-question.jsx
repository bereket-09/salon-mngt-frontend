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
          backgroundColor: '#f5f5f5',
          minHeight: '90vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper elevation={6} sx={{ p: 4, maxWidth: 700, width: '100%', borderRadius: '12px' }}>
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{ fontWeight: 'bold', color: '#1976d2' }}
          >
            Create New Question
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                Question (English)
              </FormLabel>
              <TextareaAutosize
                minRows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  borderColor: '#1976d2',
                }}
                value={question.englishText}
                onChange={(e) => handleQuestionChange(e, 'englishText')}
              />
              {errors.englishText && <Alert severity="error">{errors.englishText}</Alert>}
            </Grid>
            <Grid item xs={12}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                Question (Amharic)
              </FormLabel>
              <TextareaAutosize
                minRows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  borderColor: '#1976d2',
                }}
                value={question.amharicText}
                onChange={(e) => handleQuestionChange(e, 'amharicText')}
              />
              {errors.amharicText && <Alert severity="error">{errors.amharicText}</Alert>}
            </Grid>

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
                    value={options[option].amharic} // Corrected line
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

            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <DatePicker
                label="Select Date"
                value={date}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
                disablePast
              />
              {questionCount !== null && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {`There are ${questionCount} questions scheduled for this date.`}
                </Alert>
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
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
