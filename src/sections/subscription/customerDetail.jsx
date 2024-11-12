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
  IconButton,
  CardHeader,
  Collapse,
} from '@mui/material';
import config from 'src/config'; // Import the config file
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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

  // import { useState } from 'react';

  // CollapsibleSection Component
  const CollapsibleSection = ({ title, children }) => {
    const [open, setOpen] = useState(true);
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={title}
          action={<IconButton onClick={() => setOpen(!open)}>{open ? '^' : 'v'}</IconButton>}
        />
        <Collapse in={open} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      </Card>
    );
  };

  // ScrollableTable Component
  const ScrollableTable = ({ children }) => (
    <TableContainer component={Card} sx={{ maxHeight: 300, overflow: 'auto', boxShadow: 1 }}>
      <Table>
        <TableHead>
          <TableRow>{/* Add Table Headers */}</TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Card sx={{ p: 4, boxShadow: 3, backgroundColor: '#ffffff' }}>
        {/* <Typography variant="h4" gutterBottom>
          Customer Details
        </Typography> */}
        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          General Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'ID', value: customer[0].subscriber_id },
            { label: 'MSISDN', value: customer[0].msisdn },
            { label: 'Language', value: customer[0].language },
            { label: 'Current Status', value: customer[0].status === 'A' ? 'Active' : 'Inactive' },
            { label: 'Shortcode', value: customer[0].shortcode },
            { label: 'Offer Code', value: customer[0].offercode },
            { label: 'Subscriber Lifecycle', value: customer[0].subscriber_lifecycle },
            { label: 'Created At', value: new Date(customer[0].created_at).toLocaleString() },
            { label: 'Updated At', value: new Date(customer[0].updated_at).toLocaleString() },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Typography variant="subtitle2" color="textSecondary">
                {item.label}
              </Typography>
              <Typography variant="h6" color="textPrimary">
                {item.value}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <CollapsibleSection title="Subscription History">
          <ScrollableTable>
            {subscriptionHistory.map((sub) => (
              <TableRow key={sub.history_id} hover>
                <TableCell>{sub.history_id}</TableCell>
                <TableCell>
                  <Label variant="soft" color={sub.old_status === 'D' ? 'error' : 'success'}>
                    {sub.old_status === 'A' ? 'Active' : 'Inactive'}
                  </Label>
                </TableCell>
                <TableCell>
                  <Label variant="soft" color={sub.new_status === 'D' ? 'error' : 'success'}>
                    {sub.new_status === 'A' ? 'Active' : 'Inactive'}
                  </Label>
                </TableCell>
                <TableCell>{new Date(sub.changed_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </ScrollableTable>
        </CollapsibleSection>

        <CollapsibleSection title="Trivia Participation History">
          <ScrollableTable>
            {triviaParticipationHistory.map((participation) => (
              <TableRow key={participation.participation_game_id} hover>
                <TableCell>{participation.participation_game_id}</TableCell>
                <TableCell>{participation.trivia_id}</TableCell>
                <TableCell>{participation.current_question}</TableCell>
                <TableCell>{participation.total_questions_left}</TableCell>
                <TableCell>
                  <Label
                    variant="soft"
                    color={
                      participation.status === 'IN_PROGRESS'
                        ? 'warning'
                        : participation.status === 'COMPLETED'
                        ? 'success'
                        : 'error'
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
                <TableCell>{participation.score !== null ? participation.score : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </ScrollableTable>
        </CollapsibleSection>
      </Card>
    </Container>
  );
}
