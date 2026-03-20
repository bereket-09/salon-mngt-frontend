import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    Button,
    AppBar,
    Toolbar,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Drawer,
    Divider,
    alpha,
    useTheme,
    Avatar,
    Alert,
    Snackbar,
    Dialog,
    Fade,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import config from 'src/config';
import MapComponent from 'src/components/map/MapComponent';
import dayjs from 'dayjs';
import { useRouter } from 'src/routes/hooks';

export default function LandingPage() {
    const theme = useTheme();
    const [openBooking, setOpenBooking] = useState(false);
    const [genderFilter, setGenderFilter] = useState('both');
    const [typeFilter, setTypeFilter] = useState('all');
    const [services, setServices] = useState([]);
    const [branches, setBranches] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        customerName: '',
        phone: '',
        branchId: '',
        serviceIds: [],
        preferredDate: dayjs().format('YYYY-MM-DD'),
        preferredTime: '10:00',
        notes: '',
    });

    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [scrollY, setScrollY] = useState(0);
    const [selectedImg, setSelectedImg] = useState(null);

    const [galleryImages, setGalleryImages] = useState([
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069',
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2069',
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070',
    ]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const userStr = localStorage.getItem('userData');
        const token = localStorage.getItem('authToken');
        if (userStr && token) {
            setIsLoggedIn(true);
            const user = JSON.parse(userStr);
            setUserRole(user.role);
        }
    }, []);

    useEffect(() => {
        fetch(`${config.BASE_URL}/services`)
            .then((res) => res.json())
            .then((data) => setServices(data))
            .catch((err) => console.error(err));

        fetch(`${config.BASE_URL}/branches`)
            .then((res) => res.json())
            .then((data) => {
                setBranches(data);
                if (data.length > 0) {
                    setBookingForm(prev => ({ ...prev, branchId: data[0].id }));
                }
            })
            .catch((err) => console.error(err));

        fetch(`${config.BASE_URL}/gallery`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setGalleryImages(data.map(img => img.url.startsWith('/') ? `${config.BASE_URL}${img.url}` : img.url));
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const handleBookingSubmit = async () => {
        if (!bookingForm.customerName || !bookingForm.phone) {
            alert('Please tell us your name and phone number.');
            return;
        }
        try {
            const response = await fetch(`${config.BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingForm),
            });
            if (response.ok) {
                setBookingSuccess(true);
                setOpenBooking(false);
                setBookingForm({ customerName: '', phone: '', branchId: branches[0]?.id || '', serviceIds: [], preferredDate: dayjs().format('YYYY-MM-DD'), preferredTime: '10:00', notes: '' });
            } else {
                const err = await response.json().catch(() => ({}));
                alert(err.error || 'Oops! Something went wrong with your booking.');
            }
        } catch (err) {
            console.error(err);
            alert('Network error. Please try again.');
        }
    };

    const filteredServices = services.filter((s) => {
        const matchesGender = genderFilter === 'both' ? true : s.gender === genderFilter || s.gender === 'both';
        const matchesType = typeFilter === 'all' ? true : s.type === typeFilter;
        return matchesGender && matchesType;
    });

    const uniqueTypes = ['all', ...new Set(services.map(s => s.type).filter(Boolean))];

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const markers = branches
        .filter(b => b.latitude && b.longitude)
        .map(b => ({
            lat: parseFloat(b.latitude),
            lng: parseFloat(b.longitude),
            title: b.name
        }));

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{ bgcolor: 'rgba(27, 31, 58, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(200, 151, 42, 0.2)' }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 80 }}>
                        <Typography
                            variant="h4"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            sx={{ fontWeight: 900, color: 'white', letterSpacing: -1, cursor: 'pointer' }}
                        >
                            MILANA<Box component="span" sx={{ color: '#C8972A' }}>.</Box>
                        </Typography>

                        <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {[
                                { name: 'Our Services', id: 'services' },
                                { name: 'Gallery', id: 'gallery' },
                                { name: 'Locations', id: 'locations' }
                            ].map((item) => (
                                <Typography
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    sx={{ color: 'grey.300', fontWeight: 700, cursor: 'pointer', '&:hover': { color: '#C8972A' }, fontSize: '0.9rem' }}
                                >
                                    {item.name}
                                </Typography>
                            ))}
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                            {isLoggedIn ? (
                                <Button
                                    variant="contained"
                                    onClick={() => router.push(userRole === 'employee' ? '/my-assignments' : '/analytics')}
                                    sx={{
                                        bgcolor: '#C8972A', color: 'white', px: 3, height: 44, fontWeight: 900, borderRadius: 1,
                                        '&:hover': { bgcolor: '#b08425' }
                                    }}
                                    startIcon={<Iconify icon="solar:widget-bold-duotone" />}
                                >
                                    GO TO DASHBOARD
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push('/login')}
                                    sx={{
                                        borderColor: '#C8972A', color: '#C8972A', px: 3, height: 44, fontWeight: 900, borderRadius: 1,
                                        '&:hover': { borderColor: 'white', color: 'white' }
                                    }}
                                >
                                    LOGIN
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={() => setOpenBooking(true)}
                                sx={{
                                    bgcolor: 'white', color: '#1B1F3A', px: 3, height: 44, fontWeight: 900, borderRadius: 1,
                                    '&:hover': { bgcolor: '#f0f0f0' }
                                }}
                            >
                                BOOK NOW
                            </Button>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* HERO SECTION */}
            <Box sx={{ pt: { xs: 15, md: 24 }, pb: { xs: 10, md: 20 }, position: 'relative', overflow: 'hidden', bgcolor: '#0D0E1C' }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.25,
                    zIndex: 0,
                    transform: `scale(${1 + scrollY * 0.0003}) translateY(${scrollY * 0.15}px)`,
                    transition: 'transform 0.1s ease-out'
                }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>

                {/* Floating Elements for "Movable" feel */}
                <Box sx={{
                    position: 'absolute', top: '20%', left: '10%', width: 300, height: 300,
                    bgcolor: alpha('#C8972A', 0.15), borderRadius: '50%', filter: 'blur(80px)',
                    animation: 'floatSlow 15s infinite alternate', zIndex: 0
                }} />
                <Box sx={{
                    position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400,
                    bgcolor: alpha('#3366FF', 0.05), borderRadius: '50%', filter: 'blur(100px)',
                    animation: 'floatSlow 20s infinite alternate-reverse', zIndex: 0
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={8} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Fade in timeout={1000}>
                                <Box>
                                    <Typography variant="overline" sx={{ color: '#C8972A', fontWeight: 900, letterSpacing: 4, mb: 3, display: 'block' }}>ESTABLISHED IN ADDIS ABABA • 2026</Typography>
                                    <Typography variant="h1" sx={{ color: 'white', mb: 3, fontSize: { xs: '3.5rem', md: '6.5rem' }, lineHeight: 0.9, fontWeight: 900, letterSpacing: -2, textShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                        The Art of <br />
                                        <Box component="span" sx={{
                                            color: '#C8972A',
                                            background: 'linear-gradient(to right, #C8972A, #f8d48a)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            display: 'inline-block'
                                        }}>
                                            Transformation.
                                        </Box>
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: 'grey.500', mb: 6, maxWidth: 650, fontWeight: 400, lineHeight: 1.6, fontSize: '1.4rem' }}>
                                        Step into a world of style. At MILAN, we give you the best look using high-quality techniques and expert styling.
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                        <Button
                                            variant="contained" size="large"
                                            onClick={() => setOpenBooking(true)}
                                            sx={{
                                                bgcolor: '#C8972A', color: 'white', height: 72, px: 6, fontSize: '1.1rem', fontWeight: 900, borderRadius: 1.5,
                                                boxShadow: '0 20px 40px rgba(200, 151, 42, 0.3)',
                                                '&:hover': { bgcolor: '#b08425', transform: 'translateY(-4px)' }
                                            }}
                                            startIcon={<Iconify icon="solar:calendar-bold" width={24} />}
                                        >
                                            BOOK APPOINTMENT
                                        </Button>
                                        <Button
                                            variant="outlined" size="large"
                                            onClick={() => scrollToSection('services')}
                                            sx={{
                                                borderColor: 'rgba(255,255,255,0.2)', color: 'white', height: 72, px: 6, fontWeight: 900, borderRadius: 1.5,
                                                '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.05) }
                                            }}
                                        >
                                            SEE SERVICES
                                        </Button>
                                    </Stack>
                                </Box>
                            </Fade>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* FEATURES SHOWCASE */}
            <Box sx={{ py: 12, bgcolor: '#0D0E1C', borderBottom: '1px solid', borderColor: alpha('#fff', 0.05) }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6}>
                        {[
                            { icon: 'solar:crown-bold-duotone', title: 'Expert Stylists', desc: 'Best barbers and hair stylists in town.' },
                            { icon: 'solar:stars-bold-duotone', title: 'Top Products', desc: 'We only use the best hair care products.' },
                            { icon: 'solar:shield-check-bold-duotone', title: 'Great Service', desc: 'Custom services for every customer.' }
                        ].map((feat, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#C8972A', 0.1), color: '#C8972A' }}>
                                        <Iconify icon={feat.icon} width={40} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={900} color="white">{feat.title}</Typography>
                                        <Typography variant="body2" color="grey.500" fontWeight={600}>{feat.desc}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* SERVICES SECTION */}
            <Box id="services">
                <Container maxWidth="lg" sx={{ py: 20 }}>
                    <Stack alignItems="center" sx={{ mb: 10 }}>
                        <Typography variant="overline" sx={{ color: '#C8972A', fontWeight: 900, letterSpacing: 5 }}>OUR SERVICES</Typography>
                        <Typography variant="h2" sx={{ textAlign: 'center', mt: 1, fontWeight: 900, fontSize: { xs: '3rem', md: '4rem' } }}>Select a Service</Typography>

                        <Stack spacing={2} alignItems="center">
                            <Box sx={{ p: 0.8, bgcolor: alpha('#0D0E1C', 0.03), borderRadius: 2, display: 'flex', border: '1px solid', borderColor: alpha('#0D0E1C', 0.05) }}>
                                {[
                                    { id: 'both', label: 'ALL' },
                                    { id: 'female', label: 'WOMEN' },
                                    { id: 'male', label: 'MEN' }
                                ].map((g) => (
                                    <Button
                                        key={g.id}
                                        onClick={() => setGenderFilter(g.id)}
                                        sx={{
                                            px: 4, py: 1, borderRadius: 1.5, fontWeight: 900, fontSize: '0.85rem',
                                            color: genderFilter === g.id ? 'white' : 'text.secondary',
                                            bgcolor: genderFilter === g.id ? '#0D0E1C' : 'transparent',
                                            '&:hover': { bgcolor: genderFilter === g.id ? '#0D0E1C' : alpha('#0D0E1C', 0.05) },
                                            transition: '0.3s'
                                        }}
                                    >
                                        {g.label}
                                    </Button>
                                ))}
                            </Box>

                            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                                {uniqueTypes.map((type) => (
                                    <Chip
                                        key={type}
                                        label={type.toUpperCase()}
                                        onClick={() => setTypeFilter(type)}
                                        variant={typeFilter === type ? 'filled' : 'outlined'}
                                        sx={{
                                            fontWeight: 900,
                                            borderRadius: 1,
                                            height: 32,
                                            px: 1,
                                            cursor: 'pointer',
                                            bgcolor: typeFilter === type ? '#C8972A' : 'transparent',
                                            color: typeFilter === type ? 'white' : 'text.secondary',
                                            borderColor: typeFilter === type ? '#C8972A' : alpha('#0D0E1C', 0.1),
                                            '&:hover': { bgcolor: typeFilter === type ? '#B08425' : alpha('#C8972A', 0.05) }
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    </Stack>

                    <Grid container spacing={4}>
                        {filteredServices.map((s) => (
                            <Grid item xs={12} sm={6} md={4} key={s.id}>
                                <Card sx={{
                                    height: '100%', borderRadius: 3, border: '1px solid', borderColor: alpha('#0D0E1C', 0.08),
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden',
                                    transition: '0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    '&:hover': { transform: 'translateY(-15px) scale(1.02)', borderColor: '#C8972A', boxShadow: '0 40px 80px rgba(200, 151, 42, 0.15)' },
                                    '&:hover .book-btn': { opacity: 1, transform: 'translateY(0)' }
                                }}>
                                    <CardContent sx={{ p: 5 }}>
                                        <Typography variant="overline" color="#C8972A" fontWeight={900} letterSpacing={2}>{s.gender === 'both' ? 'Unisex' : s.gender.toUpperCase()}</Typography>
                                        <Stack direction="row" justifyContent="space-between" mb={2} mt={1}>
                                            <Typography variant="h4" fontWeight={900} letterSpacing={-1}>{s.name.toUpperCase()}</Typography>
                                            <Typography variant="h4" fontWeight={900} color="#0D0E1C">{s.price} <Typography variant="caption" fontWeight={900} color="text.secondary">Br</Typography></Typography>
                                        </Stack>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, minHeight: 60, lineHeight: 1.6, fontWeight: 500 }}>{s.description || 'A flagship treatment focusing on precision, aesthetic balance, and refreshing rejuvenation.'}</Typography>

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                                <Iconify icon="solar:clock-circle-bold" width={18} />
                                                <Typography variant="subtitle2" fontWeight={800}>{s.estimatedDuration || 45} MIN</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#C8972A' }}>
                                                <Iconify icon="solar:star-bold" width={18} />
                                                <Typography variant="subtitle2" fontWeight={800}>PREMIUM</Typography>
                                            </Box>
                                        </Stack>

                                        <Button
                                            fullWidth variant="contained"
                                            onClick={() => { setBookingForm(prev => ({ ...prev, serviceIds: [s.id] })); setOpenBooking(true); }}
                                            className="book-btn"
                                            sx={{
                                                mt: 4, height: 56, bgcolor: '#0D0E1C', color: 'white', fontWeight: 900, borderRadius: 1.5,
                                                opacity: 0, transform: 'translateY(10px)', transition: '0.3s'
                                            }}
                                        >
                                            BOOK NOW
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* GALLERY SECTION */}
            <Box id="gallery" sx={{ bgcolor: '#05060A', py: 20 }}>
                <Container maxWidth="lg">
                    <Stack alignItems="center" sx={{ mb: 10 }}>
                        <Typography variant="overline" sx={{ color: '#C8972A', fontWeight: 900, letterSpacing: 5 }}>LUXURY ARCHIVES</Typography>
                        <Typography variant="h2" sx={{ textAlign: 'center', mt: 1, fontWeight: 900, color: 'white', fontSize: { xs: '3rem', md: '4rem' } }}>The MILANA Portfolio</Typography>
                        <Typography variant="h6" sx={{ color: 'grey.600', mt: 2, textAlign: 'center', maxWidth: 600 }}>A curation of our recent transformations and boutique styling sessions.</Typography>
                    </Stack>
                    <Grid container spacing={3}>
                        {galleryImages.map((img, idx) => (
                            <Grid item xs={12} sm={6} md={idx === 0 || idx === 3 ? 8 : 4} key={idx}>
                                <Box
                                    onClick={() => setSelectedImg(img)}
                                    sx={{
                                        height: 450,
                                        width: '100%',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        '&:hover img': { transform: 'scale(1.1) rotate(1deg)' },
                                        '&:hover .overlay': { opacity: 1 },
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: '1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                    <Box className="overlay" sx={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        bgcolor: alpha('#0D0E1CEB', 0.8), opacity: 0, transition: '0.4s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2
                                    }}>
                                        <Box sx={{ p: 2, borderRadius: '50%', border: '2px solid #C8972A' }}>
                                            <Iconify icon="solar:magnifer-zoom-in-bold" width={32} sx={{ color: '#C8972A' }} />
                                        </Box>
                                        <Typography variant="h5" fontWeight={900} color="white">VIEW PHOTO</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>


            {/* BRANCHES SECTION */}
            <Box id="locations" sx={{ bgcolor: 'white', py: 20 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={10} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <Typography variant="overline" sx={{ color: '#C8972A', fontWeight: 900, letterSpacing: 5 }}>OUR FLAGSHIPS</Typography>
                            <Typography variant="h2" sx={{ mt: 1, mb: 4, fontWeight: 900, letterSpacing: -2 }}>Visit Your Sanctuary</Typography>
                            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 6, lineHeight: 1.8, fontWeight: 400 }}>
                                Strategically located flagship boutiques across the capital, designed to provide a serene escape from the city bustle.
                            </Typography>
                            <Stack spacing={3}>
                                {branches.map((b) => (
                                    <Box key={b.id} sx={{
                                        p: 4, bgcolor: '#f8f9fa', borderRadius: 2.5, border: '1px solid', borderColor: alpha('#0D0E1C', 0.05),
                                        display: 'flex', alignItems: 'center', gap: 3, transition: '0.3s',
                                        '&:hover': { bgcolor: 'white', borderColor: '#C8972A', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }
                                    }}>
                                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#0D0E1C', color: 'white', fontSize: '1.5rem', fontWeight: 900 }}>{b.name[0]}</Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight={900}>{b.name.toUpperCase()}</Typography>
                                            <Typography variant="body1" color="text.secondary" fontWeight={600}>{b.location || 'Central Addis Ababa'}</Typography>
                                            <Chip label="OPEN NOW" size="small" sx={{ mt: 1.5, bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', fontWeight: 900, borderRadius: 0.5 }} />
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <Box sx={{ height: 600, borderRadius: 4, overflow: 'hidden', border: '15px solid white', boxShadow: '0 40px 100px rgba(0,0,0,0.15)', position: 'relative' }}>
                                <MapComponent lat={8.9806} lng={38.7578} zoom={13} markers={markers} height="600px" />
                                <Box sx={{ position: 'absolute', bottom: 30, left: 30, p: 2, bgcolor: '#0D0E1C', color: 'white', borderRadius: 1.5, fontWeight: 900 }}>
                                    ADDI ABABA, ETHIOPIA
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box >

            {/* FOOTER */}
            <Box sx={{ bgcolor: '#0D0E1C', pt: 15, pb: 10, color: 'white' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={8} sx={{ mb: 10 }}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>
                                MILANA<Box component="span" sx={{ color: '#C8972A' }}>.</Box>
                            </Typography>
                            <Typography sx={{ color: 'grey.500', mb: 4, lineHeight: 1.8 }}>The definitive standard in luxury grooming. We combine timeless artistry with modern innovation to reveal your ultimate self.</Typography>
                            <Stack direction="row" spacing={1.5}>
                                <IconButton sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { color: '#C8972A', borderColor: '#C8972A' } }}><Iconify icon="mdi:instagram" /></IconButton>
                                <IconButton sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { color: '#C8972A', borderColor: '#C8972A' } }}><Iconify icon="mdi:facebook" /></IconButton>
                                <IconButton sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { color: '#C8972A', borderColor: '#C8972A' } }}><Iconify icon="ri:twitter-x-fill" /></IconButton>
                            </Stack>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="h6" fontWeight={900} mb={3}>MENU</Typography>
                            <Stack spacing={1.5}>
                                {['Services', 'Gallery', 'Memberships', 'Gift Cards'].map(link => (
                                    <Typography key={link} sx={{ color: 'grey.500', cursor: 'pointer', '&:hover': { color: '#C8972A' } }}>{link}</Typography>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="h6" fontWeight={900} mb={3}>SUPPORT</Typography>
                            <Stack spacing={1.5}>
                                {['Contact', 'Careers', 'Locations', 'Policy'].map(link => (
                                    <Typography key={link} sx={{ color: 'grey.500', cursor: 'pointer', '&:hover': { color: '#C8972A' } }}>{link}</Typography>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" fontWeight={900} mb={3}>NEWSLETTER</Typography>
                            <Typography sx={{ color: 'grey.500', mb: 3 }}>Join our list for exclusive style updates and event invites.</Typography>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    placeholder="your@email.com" variant="outlined" size="small"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, flexGrow: 1,
                                        '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } }
                                    }}
                                />
                                <Button sx={{ bgcolor: '#C8972A', color: 'white', fontWeight: 900 }}>JOIN</Button>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 5 }} />
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                        <Typography variant="caption" sx={{ color: 'grey.600' }}>© 2026 MILANA LUXURY GROOMING. ALL RIGHTS RESERVED.</Typography>
                        <Stack direction="row" spacing={4}>
                            <Typography variant="caption" sx={{ color: 'grey.600', cursor: 'pointer' }}>PRIVACY POLICY</Typography>
                            <Typography variant="caption" sx={{ color: 'grey.600', cursor: 'pointer' }}>TERMS OF SERVICE</Typography>
                        </Stack>
                    </Stack>
                </Container>
            </Box >

            {/* BOOKING DRAWER */}
            <Drawer
                anchor="right"
                open={openBooking}
                onClose={() => setOpenBooking(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 480 },
                        p: 0,
                        bgcolor: '#0D0E1C',
                        borderLeft: '1px solid',
                        borderColor: alpha('#C8972A', 0.2),
                        boxShadow: '-20px 0 80px rgba(0,0,0,0.8)'
                    }
                }}
            >
                <Box sx={{ p: 5, bgcolor: alpha('#C8972A', 0.03), borderBottom: '1px solid', borderColor: alpha('#C8972A', 0.1), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} color="white" letterSpacing={-1}>Book Your Visit</Typography>
                        <Typography variant="overline" sx={{ color: '#C8972A', fontWeight: 900, letterSpacing: 4 }}>RESERVE LUXURY</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenBooking(false)} sx={{ color: 'white', bgcolor: alpha('#ffffff', 0.05), '&:hover': { bgcolor: alpha('#ffffff', 0.1) } }}>
                        <Iconify icon="solar:close-circle-bold" width={28} />
                    </IconButton>
                </Box>

                <Box sx={{ p: 5, flexGrow: 1, overflowY: 'auto' }}>
                    <Stack spacing={4}>
                        <TextField
                            fullWidth label="Full Name" variant="standard"
                            value={bookingForm.customerName}
                            onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                            sx={{
                                '& .MuiInput-underline:before': { borderBottomColor: alpha('#ffffff', 0.2) },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#C8972A' },
                                '& .MuiInput-underline:after': { borderBottomColor: '#C8972A' },
                                '& .MuiInputLabel-root': { color: 'grey.500', fontWeight: 700 },
                                '& .MuiInputBase-input': { color: 'white', fontWeight: 700, fontSize: '1.2rem', py: 1.5 }
                            }}
                        />
                        <TextField
                            fullWidth label="Phone Number" variant="standard"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            sx={{
                                '& .MuiInput-underline:before': { borderBottomColor: alpha('#ffffff', 0.2) },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#C8972A' },
                                '& .MuiInput-underline:after': { borderBottomColor: '#C8972A' },
                                '& .MuiInputLabel-root': { color: 'grey.500', fontWeight: 700 },
                                '& .MuiInputBase-input': { color: 'white', fontWeight: 700, fontSize: '1.2rem', py: 1.5 }
                            }}
                        />
                        <FormControl fullWidth variant="standard">
                            <InputLabel sx={{ color: 'grey.500', fontWeight: 700 }}>Choose Branch</InputLabel>
                            <Select
                                value={bookingForm.branchId}
                                onChange={(e) => setBookingForm({ ...bookingForm, branchId: e.target.value })}
                                sx={{
                                    color: 'white', fontWeight: 700, fontSize: '1.2rem', py: 1,
                                    '&:before': { borderBottomColor: alpha('#ffffff', 0.2) },
                                    '&:hover:not(.Mui-disabled):before': { borderBottomColor: '#C8972A' },
                                    '&:after': { borderBottomColor: '#C8972A' },
                                    '& .MuiSelect-icon': { color: 'grey.500' }
                                }}
                            >
                                {branches.map((b) => <MenuItem key={b.id} value={b.id} sx={{ fontWeight: 700 }}>{b.name.toUpperCase()}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth variant="standard">
                            <InputLabel sx={{ color: 'grey.500', fontWeight: 700 }}>Select Services</InputLabel>
                            <Select
                                multiple value={bookingForm.serviceIds}
                                onChange={(e) => setBookingForm({ ...bookingForm, serviceIds: e.target.value })}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 1 }}>
                                        {selected.map((val) => (
                                            <Chip
                                                key={val}
                                                label={services.find(s => s.id === val)?.name?.toUpperCase()}
                                                size="small"
                                                sx={{ bgcolor: '#C8972A', color: 'white', fontWeight: 900, borderRadius: 0.5 }}
                                            />
                                        ))}
                                    </Box>
                                )}
                                sx={{
                                    color: 'white', fontWeight: 700, fontSize: '1.2rem',
                                    '&:before': { borderBottomColor: alpha('#ffffff', 0.2) },
                                    '&:hover:not(.Mui-disabled):before': { borderBottomColor: '#C8972A' },
                                    '&:after': { borderBottomColor: '#C8972A' },
                                    '& .MuiSelect-icon': { color: 'grey.500' }
                                }}
                            >
                                {services.map((s) => (
                                    <MenuItem key={s.id} value={s.id} sx={{ justifyContent: 'space-between', py: 1.5 }}>
                                        <Typography variant="body1" fontWeight={700}>{s.name.toUpperCase()}</Typography>
                                        <Typography variant="caption" fontWeight={900} color="#C8972A">{s.price} Br</Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Stack direction="row" spacing={3}>
                            <TextField
                                fullWidth type="date" label="Preferred Date" variant="standard"
                                InputLabelProps={{ shrink: true }}
                                value={bookingForm.preferredDate}
                                onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                                sx={{
                                    '& .MuiInput-underline:before': { borderBottomColor: alpha('#ffffff', 0.2) },
                                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#C8972A' },
                                    '& .MuiInput-underline:after': { borderBottomColor: '#C8972A' },
                                    '& .MuiInputLabel-root': { color: 'grey.500', fontWeight: 700 },
                                    '& .MuiInputBase-input': { color: 'white', fontWeight: 700, py: 1.5, colorScheme: 'dark' }
                                }}
                            />
                            <TextField
                                fullWidth type="time" label="Time" variant="standard"
                                InputLabelProps={{ shrink: true }}
                                value={bookingForm.preferredTime}
                                onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                                sx={{
                                    '& .MuiInput-underline:before': { borderBottomColor: alpha('#ffffff', 0.2) },
                                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#C8972A' },
                                    '& .MuiInput-underline:after': { borderBottomColor: '#C8972A' },
                                    '& .MuiInputLabel-root': { color: 'grey.500', fontWeight: 700 },
                                    '& .MuiInputBase-input': { color: 'white', fontWeight: 700, py: 1.5, colorScheme: 'dark' }
                                }}
                            />
                        </Stack>

                        <Button
                            variant="contained" fullWidth size="large" onClick={handleBookingSubmit}
                            sx={{
                                bgcolor: '#C8972A', color: 'white', height: 72, fontWeight: 900, mt: 4, fontSize: '1.1rem',
                                borderRadius: 1.5, boxShadow: '0 20px 40px rgba(200,151,42,0.3)',
                                '&:hover': { bgcolor: '#b08425', transform: 'translateY(-2px)', boxShadow: '0 30px 60px rgba(200,151,42,0.4)' },
                                transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                        >
                            SECURE YOUR APPOINTMENT
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            <Snackbar open={bookingSuccess} autoHideDuration={6000} onClose={() => setBookingSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setBookingSuccess(false)} severity="success" variant="filled">Booking saved! We will call you to confirm.</Alert>
            </Snackbar >

            {/* FULLSCREEN LIGHTBOX */}
            <Dialog fullScreen open={!!selectedImg} onClose={() => setSelectedImg(null)} TransitionComponent={Fade}>
                <Box sx={{ bgcolor: 'black', height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton
                        onClick={() => setSelectedImg(null)}
                        sx={{ position: 'absolute', top: 20, right: 20, color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                    >
                        <Iconify icon="solar:close-circle-bold" width={32} />
                    </IconButton>
                    <Box component="img" src={selectedImg} sx={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 2, boxShadow: '0 0 100px rgba(0,0,0,0.5)' }} />
                </Box>
            </Dialog>

            <Box sx={{ py: 10, bgcolor: '#0D0E1C', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 900, mb: 2 }}>
                    MILANA<Box component="span" sx={{ color: '#C8972A' }}>.</Box>
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.600', letterSpacing: 2, fontWeight: 900, textTransform: 'uppercase' }}>
                    Developed by <Box component="span" sx={{ color: '#C8972A' }}>BZ Solutions</Box>
                </Typography>
                <Stack direction="row" spacing={3} justifyContent="center" mt={4}>
                    {['Instagram', 'Facebook', 'Twitter'].map(s => (
                        <Typography key={s} variant="body2" sx={{ color: 'grey.500', cursor: 'pointer', '&:hover': { color: '#C8972A' } }}>
                            {s}
                        </Typography>
                    ))}
                </Stack>
            </Box>

            <style>
                {`
                    @keyframes float {
                        from { transform: translate(0,0); }
                        to { transform: translate(30px, -30px); }
                    }
                    @keyframes floatSlow {
                        0% { transform: translate(0,0) scale(1); }
                        100% { transform: translate(50px, 50px) scale(1.1); }
                    }
                `}
            </style>
        </Box >
    );
}
