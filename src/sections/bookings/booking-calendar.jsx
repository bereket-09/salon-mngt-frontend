import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, Box, Typography, alpha, useTheme, Chip, Stack, Alert, Button } from '@mui/material';
import config from 'src/config';
import Iconify from 'src/components/iconify';

export default function BookingCalendar({ onSelectBooking, user }) {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // If user is employee, filter by their EID if possible
      const eidParam = (user?.role === 'employee') ? `&employeeId=${user.id}` : '';
      const res = await fetch(`${config.BASE_URL}/bookings?status=all${eidParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      const formatted = data.map(b => {
        // FullCalendar expects ISO strings for start/end
        const start = b.preferredDate && b.preferredTime 
          ? `${b.preferredDate}T${b.preferredTime}:00` 
          : b.preferredDate;
          
        return {
          id: b.id,
          title: b.customerName.toUpperCase(),
          start: start,
          // Assuming 45 min duration if not specified
          end: b.preferredDate && b.preferredTime ? dayjs(`${b.preferredDate}T${b.preferredTime}`).add(45, 'minute').format('YYYY-MM-DDTHH:mm:ss') : null,
          color: getStatusColor(b.status),
          extendedProps: { ...b }
        };
      });
      setEvents(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'confirmed': return theme.palette.success.main;
      case 'cancelled': return theme.palette.error.main;
      case 'completed': return theme.palette.info.main;
      default: return theme.palette.warning.main;
    }
  };

  const handleEventClick = (info) => {
    if (onSelectBooking) {
      onSelectBooking(info.event.extendedProps);
    }
  };

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.customShadows.z12 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
         <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="PENDING" size="small" variant="soft" color="warning" sx={{ fontWeight: 800 }} />
            <Chip label="CONFIRMED" size="small" variant="soft" color="success" sx={{ fontWeight: 800 }} />
            <Chip label="COMPLETED" size="small" variant="soft" color="info" sx={{ fontWeight: 800 }} />
            <Chip label="CANCELLED" size="small" variant="soft" color="error" sx={{ fontWeight: 800 }} />
         </Stack>
         <Button
            variant="soft" color="secondary"
            onClick={fetchEvents}
            startIcon={<Iconify icon="solar:restart-bold" className={loading ? 'animate-spin' : ''} />}
            sx={{ fontWeight: 900 }}
         >
            REFRESH
         </Button>
      </Stack>
      <Box sx={{ 
        '& .fc-theme-standard': { border: 'none' },
        '& .fc-header-toolbar': { mb: 3 },
        '& .fc-toolbar-title': { fontWeight: 900, textTransform: 'uppercase', fontSize: '1.2rem' },
        '& .fc-button': { bgcolor: alpha(theme.palette.secondary.main, 0.05), border: 'none', color: 'secondary.main', fontWeight: 900, '&:hover': { bgcolor: 'secondary.main', color: 'white' } },
        '& .fc-button-active': { bgcolor: 'secondary.main !important', color: 'white !important' },
        '& .fc-col-header-cell': { py: 2, bgcolor: alpha(theme.palette.background.neutral, 0.5), fontWeight: 900 },
        '& .fc-event': { cursor: 'pointer', border: 'none', px: 1, py: 0.5, borderRadius: 1 },
        '& .fc-event-title': { fontWeight: 800, fontSize: '0.75rem' }
      }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          height="700px"
          nowIndicator={true}
          allDaySlot={false}
        />
      </Box>
    </Card>
  );
}
