import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { faker } from '@faker-js/faker';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

// import AppOrderTimeline from '../app-order-timeline';
import AppCurrentVisits from '../overview/app-current-visits';
import AppWebsiteVisits from '../overview/app-website-visits';
import AppWidgetSummary from '../overview/app-widget-summary';
import AppConversionRates from '../overview/app-conversion-rates';

import AppOrderTimeline from '../overview/app-order-timeline';

export default function TriviaDetailView() {
  const { trivia_id } = useParams(); // Get trivia_id from the URL
  const [triviaData, setTriviaData] = useState(null);

  useEffect(() => {
    // Fetch data from the new endpoint using trivia_id
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.BASE_URL}/api/trivia/${trivia_id}`);
        const data = await response.json();

        if (data.code === 1000) {
          setTriviaData(data.data);
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
      <Typography variant="h4" sx={{ mb: 5 }}>
        Trivia Detail Dashboard - {trivia_id}
      </Typography>

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
          <AppCurrentVisits title={todaysParticipation.title} chart={todaysParticipation.chart} />
        </Grid>
        {/* <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title={weeklyParticipation.title}
            subheader={weeklyParticipation.subheader}
            chart={weeklyParticipation.chart}
          />
        </Grid> */}

        <Grid xs={12} md={6} lg={8}>
          <AppConversionRates
            title={questionParticipation?.title || 'Question-wise Participation'}
            subheader={
              questionParticipation?.subheader || 'Response Count For Each Questions in this Trivia'
            }
            chart={questionParticipation?.chart}
          />
        </Grid>

        {/* <Grid xs={12} md={6} lg={4}>
          <AppOrderTimeline
            title="Trivia Daily Timeline"
            list={[...Array(5)].map((_, index) => ({
              id: faker.string.uuid(),
              title: [
                '1983, orders, $4220',
                '12 Invoices have been paid',
                'Order #37745 from September',
                'New order placed #XF-2356',
                'New order placed #XF-2346',
              ][index],
              type: `order${index + 1}`,
              time: faker.date.past(),
            }))}
          />
        </Grid> */}
      </Grid>
    </Container>
  );
}
