import { useParams, useNavigate } from 'react-router-dom';
import Label from 'src/components/label';
import { useState, useEffect } from 'react';
import {
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Container,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import config from 'src/config'; // Import the config file

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      const url = `${config.BASE_URL}/api/customers/${id}`;
      console.log(url);
      try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.code === 1000) {
          setCustomer(result.data);
          console.log(Array.isArray(result.data[0].subscriptionHistory)); // Should log true if it's an array
        } else {
          console.error('Error fetching customer detail:', result.message);
        }
      } catch (error) {
        console.error('Error fetching customer detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetail();
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!customer) {
    return <Typography variant="h6">Customer not found</Typography>;
  }

  const subscriptionHistory = customer[0]?.subscriptionHistory || [];
  const triviaParticipationHistory = customer[0]?.triviaParticipationHistory || [];

  return (
    <Container>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Customer Details
        </Typography>
        <Divider />

        {/* General Detail Section */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">ID: {customer[0].subscriber_id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">MSISDN: {customer[0].msisdn}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Language: {customer[0].language}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Status: {customer[0].status === 'A' ? 'Active' : 'Inactive'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Shortcode: {customer[0].shortcode}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">Offer Code: {customer[0].offercode}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Subscriber Lifecycle: {customer[0].subscriber_lifecycle}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Created At: {new Date(customer[0].created_at).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6">
              Updated At: {new Date(customer[0].updated_at).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Subscription History</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subscription ID</TableCell>
                <TableCell>OLD STATUS</TableCell>
                <TableCell>NEW STATUS</TableCell>
                <TableCell>Change Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptionHistory.length > 0 ? (
                subscriptionHistory.map((sub) => (
                  <TableRow key={sub.history_id}>
                    <TableCell>{sub.history_id}</TableCell>
                    <TableCell>
                      <Label
                        variant="soft"
                        color={(sub.old_status === 'inactive' && 'error') || 'success'}
                      >
                        {sub.old_status === 'active' ? 'Active' : 'Inactive'}
                      </Label>
                    </TableCell>
                    <TableCell>
                      <Label
                        variant="soft"
                        color={(sub.new_status === 'inactive' && 'error') || 'success'}
                      >
                        {sub.new_status === 'active' ? 'Active' : 'Inactive'}
                      </Label>
                    </TableCell>
                    <TableCell>{new Date(sub.changed_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No subscription history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Trivia Participation History</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Participation Game ID</TableCell>
                <TableCell>Trivia ID</TableCell>
                <TableCell>Current Question</TableCell>
                <TableCell>Total Questions Left</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Average Completion Time</TableCell>
                <TableCell>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {triviaParticipationHistory.length > 0 ? (
                triviaParticipationHistory.map((participation) => (
                  <TableRow key={participation.participation_game_id}>
                    <TableCell>{participation.participation_game_id}</TableCell>
                    <TableCell>{participation.trivia_id}</TableCell>
                    <TableCell>{participation.current_question}</TableCell>
                    <TableCell>{participation.total_questions_left}</TableCell>
                    <TableCell>
                      <Label
                        variant="soft"
                        color={
                          (participation.status === 'IN_PROGRESS' && 'warning') ||
                          (participation.status === 'COMPLETED' && 'success') ||
                          (participation.status === 'FAILED' && 'error') ||
                          'default'
                        }
                      >
                        {participation.status}
                      </Label>
                    </TableCell>
                    <TableCell>{new Date(participation.start_time).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {participation.end_time
                        ? new Date(participation.end_time).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {participation.average_completion_time
                        ? `${participation.average_completion_time} mins`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {participation.score !== null ? participation.score : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No trivia participation history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
}
