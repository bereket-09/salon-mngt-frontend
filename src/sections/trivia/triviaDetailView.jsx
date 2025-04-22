import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { faker } from '@faker-js/faker';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
// import { useParams, useNavigate } from 'react-router-dom';
import AppCurrentVisits from '../overview/app-current-visits';
import AppWidgetSummary from '../overview/app-widget-summary';
import AppConversionRates from '../overview/app-conversion-rates';
import config from 'src/config';

export default function TriviaDetailView() {
  const { trivia_id } = useParams(); // Get trivia_id from the URL
  const navigate = useNavigate(); // For navigation
  const [triviaData, setTriviaData] = useState(null);

  const [executionDate, setExecutionDate] = useState(null);

  // Update the formatDate function to handle the 'YYYY-MM-DD HH:mm:ss' format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short', // Optional: e.g., "Mon"
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      // hour: '2-digit',
      // minute: '2-digit',
      // second: '2-digit',
    });
  };

  useEffect(() => {
    // Fetch data from the new endpoint using trivia_id
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const headers = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await fetch(`${config.BASE_URL}/api/trivia/${trivia_id}`, headers);
        const data = await response.json();

        if (data.code === 1000) {
          setTriviaData(data.data);
          setExecutionDate(data.executionDate);
        } else {
          console.error('Failed to fetch trivia data:', data.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [trivia_id]);

  if (!triviaData) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const {
    overview = {},
    weeklyParticipation = {},
    todaysParticipation = {},
    questionParticipation = {},
  } = triviaData;

  return (
    <Container maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mr: 4 }}>
          Back
        </Button>
        <Typography variant="h5">
          Trivia Detail Dashboard - ({formatDate(executionDate)}- Trivia_ID :{trivia_id})
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/triviawinners/${trivia_id}`)}
          >
            View Winners List
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate(`/trivialosers/${trivia_id}`)}
          >
            View Losers List
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Active Players"
            dev={overview.totalActiveParticipants}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Responses"
            dev={overview.totalResponses}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Completed"
            dev={overview.totalCompletedParticipants}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Participants"
            dev={overview.totalParticipants}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
            color="success"
          />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title={todaysParticipation.title}
            chart={{
              ...todaysParticipation.chart, // Spread existing chart data
              colors: ['#00c04a', '#8810de', '#4040ff', '#d80000', '#ffd700'], // Updated custom colors
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppConversionRates
            title={questionParticipation?.title || 'Question-wise Participation'}
            subheader={
              questionParticipation?.subheader || 'Response Count For Each Questions in this Trivia'
            }
            chart={questionParticipation?.chart}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
