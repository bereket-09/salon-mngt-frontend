import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Box,
  TextareaAutosize,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from 'src/config'; // Import the config file

const EditQuestion = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState({ englishText: '', amharicText: '' });
  const [options, setOptions] = useState({
    A: { english: '', amharic: '' },
    B: { english: '', amharic: '' },
    C: { english: '', amharic: '' },
  });
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [date, setDate] = useState(dayjs());
  const [status, setStatus] = useState('active'); // Add state for status
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/api/questions/${id}`);
        if (response.data.code === 1000) {
          const questionData = response.data.data[0];
          setQuestion({
            englishText: questionData.english_text,
            amharicText: questionData.amharic_text,
          });
          setOptions({
            A: {
              english: questionData.english_options[0],
              amharic: questionData.amharic_options[0],
            },
            B: {
              english: questionData.english_options[1],
              amharic: questionData.amharic_options[1],
            },
            C: {
              english: questionData.english_options[2],
              amharic: questionData.amharic_options[2],
            },
          });
          setCorrectAnswer(questionData.correct_answer);
          setDate(dayjs(questionData.question_date));
          setStatus(questionData.status); // Set status from API
        }
      } catch (error) {
        console.error('Error fetching question details:', error);
        toast.error('Failed to fetch question details');
      }
    };

    fetchQuestionDetails();
  }, [id]);

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

  const handleStatusChange = (e) => {
    setStatus(e.target.value); // Update status state
  };

  const handleSubmit = async () => {
    const formattedData = {
      englishText: question.englishText,
      amharicText: question.amharicText,
      englishOptions: [options.A.english, options.B.english, options.C.english],
      amharicOptions: [options.A.amharic, options.B.amharic, options.C.amharic],
      correctAnswer,
      date: date.format('YYYY-MM-DD'),
      status, // Include status in the submission
    };

    try {
      const response = await axios.put(`${config.BASE_URL}/api/questions/${id}`, formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.code === 1000) {
        toast.success('Question updated successfully');
        setTimeout(() => navigate('/questions'), 2000);
      } else {
        toast.error('Failed to update question: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      const errorMessage =
        error.response?.data?.message || 'An error occurred while updating the question';
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
            Edit Question
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextareaAutosize
                minRows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  borderColor: '#1976d2',
                }}
                value={question.englishText}
                placeholder="English Question Text"
                onChange={(e) => handleQuestionChange(e, 'englishText')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextareaAutosize
                minRows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  borderColor: '#1976d2',
                }}
                value={question.amharicText}
                placeholder="Amharic Question Text"
                onChange={(e) => handleQuestionChange(e, 'amharicText')}
              />
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
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={`Option ${option} (Amharic)`}
                    variant="outlined"
                    fullWidth
                    value={options[option].amharic}
                    onChange={(e) => handleOptionChange(e, option, 'amharic')}
                    required
                  />
                </Grid>
              </React.Fragment>
            ))}

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="h6" gutterBottom>
                  Select Correct Answer
                </Typography>
                <RadioGroup value={correctAnswer} onChange={handleCorrectAnswerChange} row>
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

            <Grid item xs={6}>
              <DatePicker
                label="Select Date"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                disablePast
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={status} onChange={handleStatusChange} label="Status">
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="deleted">Deleted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Save Changes
            </Button>
          </Box>
        </Paper>
        <ToastContainer />
      </Box>
    </LocalizationProvider>
  );
};

export default EditQuestion;
