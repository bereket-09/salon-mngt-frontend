import { useEffect, useState } from 'react';
import { faker } from '@faker-js/faker';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';
import AppOrderTimeline from '../app-order-timeline';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppConversionRates from '../app-conversion-rates';
import config from 'src/config'; // Import the config file

export default function AppView() {
  const [overviewData, setOverviewData] = useState(null);

  useEffect(() => {
    // Fetch data from the endpoint
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const headers = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await fetch(`${config.BASE_URL}/api/dashboard/overview`, headers);
        const data = await response.json();

        if (data.code === 1000) {
          setOverviewData(data.data);
        } else {
          console.error('Failed to fetch overview data:', data.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (!overviewData) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const {
    overview,
    weeklyParticipation,
    todaysParticipation,
    subscriptionRate,
    miscSettings,
    todayTrivia,
  } = overviewData;
  // console.log("🚀 ~ AppView ~ weeklyParticipation:", weeklyParticipation)

  const userData = JSON.parse(localStorage.getItem('userData')) || {};

  const iconStyles = (bgColor) => ({
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgColor,
    transform: 'scale(1.2)',
  });

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi <strong sx={{ color: 'primary.main' }}>{userData.given_name || 'User'}</strong>, Welcome
        to SMS Trivia 👋
      </Typography>

      <Grid container spacing={3}>
        <Container maxWidth="100%">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={6} lg={6} xl={3}>
              <AppWidgetSummary
                title="Active Subscriptions"
                dev={overview.totalActiveSubscriptions}
                icon={
                  <div style={iconStyles('#00796B')}>
                    <Iconify
                      icon="fa6-solid:users-viewfinder"
                      style={{ fontSize: '36px', color: '#fff', transform: 'scale(1.8)' }}
                    />
                  </div>
                }
                color="info"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={6} xl={3}>
              <AppWidgetSummary
                title="Total Questions"
                dev={overview.totalActiveQuestions}
                icon={
                  <div style={iconStyles('#FFA000')}>
                    <Iconify
                      icon="gravity-ui:bucket"
                      style={{ fontSize: '36px', color: '#fff', transform: 'scale(1.8)' }}
                    />
                  </div>
                }
                color="warning"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={6} xl={3}>
              <AppWidgetSummary
                title="Today's Questions"
                dev={overview.totalTodayQuestions}
                icon={
                  <div style={iconStyles('#6A1B9A')}>
                    <Iconify
                      icon="carbon:question-answering"
                      style={{ fontSize: '36px', color: '#fff', transform: 'scale(1.8)' }}
                    />
                  </div>
                }
                color="error"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6} lg={6} xl={3}>
              <AppWidgetSummary
                title="Participants Today"
                dev={overview.totalParticipants}
                icon={
                  <div style={iconStyles('#1976D2')}>
                    <Iconify
                      icon="fluent:group-return-24-filled"
                      style={{ fontSize: '36px', color: '#fff', transform: 'scale(1.8)' }}
                    />
                  </div>
                }
                color="success"
              />
            </Grid>
          </Grid>
        </Container>

        {/* <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Subscriptions"
            dev={overview.totalActiveSubscriptions}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
            color="success"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Questions"
            dev={overview.totalActiveQuestions}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Today's Questions"
            dev={overview.totalTodayQuestions}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Today's Participates"
            dev={overview.totalParticipants}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid> */}

        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title={weeklyParticipation.title}
            subheader={weeklyParticipation.subheader}
            // chart={weeklyParticipation.chart}

            chart={{
              ...weeklyParticipation.chart, // Spread existing chart data
              type: ['area', 'area', 'area', 'area', 'area'],
              colors: ['#8810de', '#00c04a', '#ffd700', '#4040ff', '#d80000'], // Updated custom colors
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits title={todaysParticipation.title} chart={todaysParticipation.chart} />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppConversionRates
            title={subscriptionRate.title}
            subheader={subscriptionRate.subheader}
            chart={subscriptionRate.chart}
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
        <Grid xs={12} md={6} lg={4}>
          <AppOrderTimeline
            title="Trivia Daily Timeline"
            list={[
              {
                title: `Trivia Status: ${todayTrivia[0]?.status}`,
                time: `Current status ${todayTrivia[0]?.status}, Id ${todayTrivia[0]?.trivia_id}`,
              },
              {
                title: `Trivia Start Time: ${miscSettings.trivia_start_time}`,
                time: 'When to send first Question',
              },
              {
                title: `Trivia End Time: ${miscSettings.trivia_end_time}`,
                time: 'When to close daily trivia game',
              },
              {
                title: `Daily Winners Calculation Start Time: ${miscSettings.weekly_winner_calc_end_time}`,
                time: 'When to calculate who is winner and who is loser',
              },
              {
                title: `Trivia Winner Regret Notification Start Time: ${miscSettings.trivia_winner_regret_notification_start_time}`,
                time: 'When to send the winner and regret notification',
              },
            ].map((item, index) => ({
              id: faker.string.uuid(),
              title: item.title,
              type: `order${index + 1}`,
              time: item.time,
            }))}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
