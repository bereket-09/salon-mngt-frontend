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
import Iconify from 'src/components/iconify'; // Import Iconify component

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const fetchCustomerDetail = async () => {
      const url = `${config.BASE_URL}/api/customers/${id}`;
      console.log(url);
      try {
        const response = await fetch(url, headers);
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

  // Language Mapping
  const languageMap = {
    1: 'English',
    2: 'Amharic',
    3: 'Somali',
    4: 'Tigrinya',
    5: 'Afaan Oromo',
  };

  // Helper function to format microseconds to a readable time (including hours)
  const formatTime = (microseconds) => {
    if (!microseconds) return 'N/A'; // If there's no value, return 'N/A'

    // Convert microseconds to milliseconds
    const ms = microseconds / 1000;

    const hours = Math.floor(ms / 3600000); // 3,600,000 ms in an hour
    const minutes = Math.floor((ms % 3600000) / 60000); // Remaining minutes
    const seconds = Math.floor((ms % 60000) / 1000); // Remaining seconds
    const milliseconds = ms % 1000; // Remaining milliseconds

    // Format the time as hours:minutes:seconds:milliseconds
    if (hours > 0) {
      return `${hours} hr ${minutes} min ${seconds} sec ${milliseconds} ms`;
    } else if (minutes > 0) {
      return `${minutes} min ${seconds} sec ${milliseconds} ms`;
    } else if (seconds > 0) {
      return `${seconds} sec ${milliseconds} ms`;
    } else {
      return `${milliseconds} ms`;
    }
  };

  // CollapsibleSection Component
  const CollapsibleSection = ({ title, children }) => {
    const [open, setOpen] = useState(true);
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={title}
          action={
            <IconButton onClick={() => setOpen(!open)}>
              <Iconify icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
            </IconButton>
          }
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
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Old Status</TableCell>
            <TableCell>New Status</TableCell>
            <TableCell>Change Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );

  // ScrollableTable2 Component with Sorting
  const ScrollableTable2 = ({ children }) => {
    const [sortConfig, setSortConfig] = useState({
      key: 'participation_game_id',
      direction: 'asc',
    });

    const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    const sortedChildren = [...children].sort((a, b) => {
      const aValue = a.props.children[0].props.children[0]; // accessing participation_game_id or other columns
      const bValue = b.props.children[0].props.children[0]; // accessing participation_game_id or other columns

      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return (
      <TableContainer component={Card} sx={{ maxHeight: 300, overflow: 'auto', boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <IconButton onClick={() => handleSort('participation_game_id')}>
                  <Iconify
                    icon={
                      sortConfig.key === 'participation_game_id' && sortConfig.direction === 'asc'
                        ? 'eva:arrow-upward-fill'
                        : 'eva:arrow-downward-fill'
                    }
                  />
                </IconButton>
                Participant ID
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleSort('trivia_id')}>
                  <Iconify
                    icon={
                      sortConfig.key === 'trivia_id' && sortConfig.direction === 'asc'
                        ? 'eva:arrow-upward-fill'
                        : 'eva:arrow-downward-fill'
                    }
                  />
                </IconButton>
                Game Id
              </TableCell>
              <TableCell>Current Question</TableCell>
              <TableCell>Questions Left</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Completion Time</TableCell>
              <TableCell>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{sortedChildren}</TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Card sx={{ p: 4, boxShadow: 3, backgroundColor: '#ffffff' }}>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          General Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'ID', value: customer[0].subscriber_id },
            { label: 'MSISDN', value: customer[0].msisdn },
            { label: 'Language', value: languageMap[customer[0].language] },
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
          <ScrollableTable2>
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
                    ? formatTime(participation.average_completion_time)
                    : 'N/A'}
                </TableCell>
                <TableCell>{participation.score !== null ? participation.score : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </ScrollableTable2>
        </CollapsibleSection>
      </Card>
    </Container>
  );
}
