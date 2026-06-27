import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
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
import { useResponsive } from 'src/hooks/use-responsive';

export default function LandingPage() {
    const theme = useTheme();
    const [openBooking, setOpenBooking] = useState(false);
    const [genderFilter, setGenderFilter] = useState('both');
    const [typeFilter, setTypeFilter] = useState('all');
    const [services, setServices] = useState([]);
    const [branches, setBranches] = useState([]);
    const [landingBranchId, setLandingBranchId] = useState(''); // selected branch on the public menu
    const [specialists, setSpecialists] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        customerName: '',
        phone: '',
        branchId: '',
        serviceIds: [],
        employeeId: '',
        preferredDate: dayjs().format('YYYY-MM-DD'),
        preferredTime: '10:00',
        notes: '',
    });

    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [scrollY, setScrollY] = useState(0);
    const [selectedImg, setSelectedImg] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const isMobile = useResponsive('down', 'md');

    // ─── Editorial luxury tokens (from theme — never hardcode old navy/gold) ───
    const ink = theme.palette.primary.main;            // #1A1A1A
    const bronze = theme.palette.secondary.main;       // #9A7B4F
    const bone = theme.palette.background.default;      // #FAF8F3
    const paper = theme.palette.background.paper;       // #FFFFFF
    const muted = theme.palette.text.secondary;        // #6E685C
    const hairline = alpha(ink, 0.12);

    // Uppercase tracked micro-label.
    const microLabel = {
        fontSize: 11,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        fontWeight: 600,
        lineHeight: 1.6,
    };

    const navLinks = [
        { name: 'Our Services', id: 'services' },
        { name: 'Gallery', id: 'gallery' },
        { name: 'Locations', id: 'locations' }
    ];

    const [galleryImages, setGalleryImages] = useState([
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069',
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2069',
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070',
    ]);

    useEffect(() => {
        // Skip JS-driven parallax on mobile / reduced-motion for performance & comfort.
        const prefersReducedMotion = typeof window !== 'undefined'
            && window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isMobile || prefersReducedMotion) {
            setScrollY(0);
            return undefined;
        }
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobile]);

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
        fetch(`${config.BASE_URL}/services?landing=1`)
            .then((res) => res.json())
            .then((data) => setServices(Array.isArray(data) ? data : []))
            .catch((err) => console.error(err));

        fetch(`${config.BASE_URL}/branches`)
            .then((res) => res.json())
            .then((data) => {
                setBranches(Array.isArray(data) ? data : []);
                if (Array.isArray(data) && data.length > 0) {
                    // Default to the "main" branch (the one offering everything), else the first.
                    const main = data.find((b) => b.type === 'both') || data[0];
                    setLandingBranchId(String(main.id));
                    setBookingForm(prev => ({ ...prev, branchId: main.id }));
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

        fetch(`${config.BASE_URL}/users/specialists`)
            .then((res) => res.json())
            .then((data) => setSpecialists(Array.isArray(data) ? data : []))
            .catch((err) => console.error(err));
    }, []);

    // Specialists eligible for the chosen services (and branch), matching by
    // service category or its parent super-category. Falls back to all.
    const eligibleSpecialists = (() => {
        const selected = services.filter((s) => bookingForm.serviceIds.includes(s.id));
        const byBranch = specialists.filter((sp) => !sp.BranchId || !bookingForm.branchId || sp.BranchId === bookingForm.branchId);
        if (!selected.length) return byBranch;
        const matched = byBranch.filter((sp) => {
            const specs = (sp.Specialties || []).map((c) => c.id);
            if (!specs.length) return true; // generalist
            return selected.every((svc) => {
                const ids = [svc.categoryId, svc.Category?.parentId].filter(Boolean);
                if (!ids.length) return true;
                return ids.some((id) => specs.includes(id));
            });
        });
        return matched.length ? matched : byBranch;
    })();

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
                setBookingForm({ customerName: '', phone: '', branchId: branches[0]?.id || '', serviceIds: [], employeeId: '', preferredDate: dayjs().format('YYYY-MM-DD'), preferredTime: '10:00', notes: '' });
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
        // Branch-specific menu: show this branch's services + any shared (no-branch) service.
        const matchesBranch = !landingBranchId || s.BranchId == null || String(s.BranchId) === String(landingBranchId);
        return matchesGender && matchesType && matchesBranch;
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

    // Wordmark — editorial serif, bronze period.
    const Wordmark = ({ color = ink, size = 'h5' }) => (
        <Typography
            variant={size}
            sx={{ fontWeight: 600, color, letterSpacing: '-0.01em', lineHeight: 1 }}
        >
            Milana<Box component="span" sx={{ color: bronze }}>.</Box>
        </Typography>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: bone, color: ink }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: alpha(bone, 0.85),
                    color: ink,
                    backdropFilter: 'saturate(180%) blur(8px)',
                    borderBottom: `1px solid ${hairline}`,
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 64, md: 76 } }}>
                        <Box
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            sx={{ cursor: 'pointer' }}
                        >
                            <Wordmark color={ink} size="h5" />
                        </Box>

                        <Stack direction="row" spacing={5} sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {navLinks.map((item) => (
                                <Typography
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    sx={{
                                        ...microLabel,
                                        color: muted,
                                        cursor: 'pointer',
                                        transition: 'color 0.2s',
                                        '&:hover': { color: bronze },
                                    }}
                                >
                                    {item.name}
                                </Typography>
                            ))}
                        </Stack>

                        {/* Desktop actions */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {isLoggedIn ? (
                                <Button
                                    variant="text"
                                    onClick={() => router.push(userRole === 'employee' ? '/my-assignments' : '/analytics')}
                                    sx={{ ...microLabel, color: ink, px: 1, height: 44, '&:hover': { color: bronze, bgcolor: 'transparent' } }}
                                    startIcon={<Iconify icon="solar:widget-linear" />}
                                >
                                    Dashboard
                                </Button>
                            ) : (
                                <Button
                                    variant="text"
                                    onClick={() => router.push('/login')}
                                    sx={{ ...microLabel, color: ink, px: 1, height: 44, '&:hover': { color: bronze, bgcolor: 'transparent' } }}
                                >
                                    Login
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                disableElevation
                                onClick={() => setOpenBooking(true)}
                                sx={{
                                    ...microLabel, bgcolor: ink, color: paper, px: 3.5, height: 44, borderRadius: 0,
                                    '&:hover': { bgcolor: bronze }
                                }}
                            >
                                Book Now
                            </Button>
                        </Stack>

                        {/* Mobile hamburger */}
                        <IconButton
                            onClick={() => setMobileNavOpen(true)}
                            aria-label="Open navigation menu"
                            sx={{ display: { xs: 'inline-flex', md: 'none' }, color: ink, width: 44, height: 44 }}
                        >
                            <Iconify icon="solar:hamburger-menu-linear" width={26} />
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* MOBILE NAV DRAWER */}
            <Drawer
                anchor="right"
                open={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '82%', sm: 360 },
                        bgcolor: bone,
                        borderLeft: `1px solid ${hairline}`,
                        p: 3,
                    }
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
                    <Wordmark color={ink} size="h5" />
                    <IconButton
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close navigation menu"
                        sx={{ color: ink, width: 44, height: 44 }}
                    >
                        <Iconify icon="solar:close-circle-linear" width={26} />
                    </IconButton>
                </Stack>

                <Stack divider={<Divider sx={{ borderColor: hairline }} />} sx={{ mb: 4, borderTop: `1px solid ${hairline}`, borderBottom: `1px solid ${hairline}` }}>
                    {navLinks.map((item, i) => (
                        <Button
                            key={item.id}
                            onClick={() => { setMobileNavOpen(false); scrollToSection(item.id); }}
                            fullWidth
                            sx={{
                                justifyContent: 'space-between', color: ink, textTransform: 'none',
                                fontFamily: theme.typography.h4.fontFamily, fontWeight: 500,
                                fontSize: '1.35rem', height: 64, px: 0, borderRadius: 0,
                                '&:hover': { color: bronze, bgcolor: 'transparent' }
                            }}
                            endIcon={<Typography component="span" sx={{ ...microLabel, color: bronze }}>{`0${i + 1}`}</Typography>}
                        >
                            {item.name}
                        </Button>
                    ))}
                </Stack>

                <Stack spacing={2}>
                    {isLoggedIn ? (
                        <Button
                            variant="outlined" fullWidth
                            onClick={() => { setMobileNavOpen(false); router.push(userRole === 'employee' ? '/my-assignments' : '/analytics'); }}
                            startIcon={<Iconify icon="solar:widget-linear" />}
                            sx={{ ...microLabel, borderColor: ink, color: ink, height: 52, borderRadius: 0, '&:hover': { borderColor: bronze, color: bronze, bgcolor: 'transparent' } }}
                        >
                            Go To Dashboard
                        </Button>
                    ) : (
                        <Button
                            variant="outlined" fullWidth
                            onClick={() => { setMobileNavOpen(false); router.push('/login'); }}
                            sx={{ ...microLabel, borderColor: ink, color: ink, height: 52, borderRadius: 0, '&:hover': { borderColor: bronze, color: bronze, bgcolor: 'transparent' } }}
                        >
                            Login
                        </Button>
                    )}
                    <Button
                        variant="contained" fullWidth disableElevation
                        onClick={() => { setMobileNavOpen(false); setOpenBooking(true); }}
                        sx={{ ...microLabel, bgcolor: ink, color: paper, height: 52, borderRadius: 0, '&:hover': { bgcolor: bronze } }}
                    >
                        Book Now
                    </Button>
                </Stack>
            </Drawer>

            {/* HERO SECTION — editorial, big serif statement, single bronze rule */}
            <Box
                component="section"
                sx={{
                    pt: { xs: 13, md: 20 },
                    pb: { xs: 8, md: 14 },
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: bone,
                    borderBottom: `1px solid ${hairline}`,
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={{ xs: 5, md: 8 }} alignItems="flex-end">
                        <Grid item xs={12} md={7}>
                            <Fade in timeout={900}>
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: { xs: 3, md: 4 } }}>
                                        <Box sx={{ width: 40, height: '1px', bgcolor: bronze }} />
                                        <Typography sx={{ ...microLabel, color: bronze }}>
                                            Established Addis Ababa — 2026
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            color: ink, mb: { xs: 3, md: 4 },
                                            fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem' },
                                            lineHeight: 1.02,
                                        }}
                                    >
                                        The art of
                                        <br />
                                        <Box component="span" sx={{ fontStyle: 'italic', color: bronze }}>transformation.</Box>
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: muted, mb: { xs: 4, md: 6 }, maxWidth: 520,
                                            fontSize: { xs: '1.05rem', md: '1.2rem' }, lineHeight: 1.7,
                                        }}
                                    >
                                        A quiet, considered approach to beauty. At Milana we shape every
                                        look with precision craft, refined product, and unhurried attention.
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} alignItems={{ sm: 'center' }}>
                                        <Button
                                            variant="contained" disableElevation
                                            onClick={() => setOpenBooking(true)}
                                            sx={{
                                                ...microLabel, bgcolor: ink, color: paper, height: 60, px: 5, borderRadius: 0,
                                                '&:hover': { bgcolor: bronze }
                                            }}
                                            endIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
                                        >
                                            Book Appointment
                                        </Button>
                                        <Button
                                            variant="text"
                                            onClick={() => scrollToSection('services')}
                                            sx={{
                                                ...microLabel, color: ink, height: 60, px: 1, borderRadius: 0,
                                                '&:hover': { color: bronze, bgcolor: 'transparent' }
                                            }}
                                            endIcon={<Iconify icon="solar:arrow-down-linear" width={18} />}
                                        >
                                            View The Menu
                                        </Button>
                                    </Stack>
                                </Box>
                            </Fade>
                        </Grid>

                        {/* Asymmetric editorial image column */}
                        <Grid item xs={12} md={5}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    aspectRatio: { xs: '16 / 11', md: '4 / 5' },
                                    overflow: 'hidden',
                                    border: `1px solid ${hairline}`,
                                }}
                            >
                                <Box
                                    component="img"
                                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074"
                                    alt="Milana atelier"
                                    sx={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        // Subtle desktop-only parallax; disabled on mobile/reduced-motion via scrollY guard.
                                        transform: `translateY(${scrollY * 0.04}px)`,
                                        transition: 'transform 0.1s linear',
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute', left: 0, bottom: 0,
                                        px: 2.5, py: 1.5, bgcolor: bone,
                                        borderTop: `1px solid ${hairline}`, borderRight: `1px solid ${hairline}`,
                                    }}
                                >
                                    <Typography sx={{ ...microLabel, color: ink }}>The Atelier</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ETHOS STRIP — editorial numbered values, varied rhythm (not 3 equal cards) */}
            <Box component="section" sx={{ bgcolor: paper, borderBottom: `1px solid ${hairline}` }}>
                <Container maxWidth="lg">
                    <Grid container>
                        {[
                            { n: '01', title: 'Expert hands', desc: 'Seasoned stylists and barbers, trained in precision craft.' },
                            { n: '02', title: 'Considered product', desc: 'A tightly edited shelf of the finest care, nothing surplus.' },
                            { n: '03', title: 'Tailored to you', desc: 'Every visit shaped around your hair, face, and intent.' }
                        ].map((feat, i) => (
                            <Grid
                                item xs={12} md={4} key={feat.n}
                                sx={{
                                    p: { xs: 4, md: 6 },
                                    borderTop: { xs: i === 0 ? 'none' : `1px solid ${hairline}`, md: 'none' },
                                    borderLeft: { md: i === 0 ? 'none' : `1px solid ${hairline}` },
                                }}
                            >
                                <Typography sx={{ fontFamily: theme.typography.h2.fontFamily, fontSize: '1.4rem', color: bronze, mb: 2 }}>
                                    {feat.n}
                                </Typography>
                                <Typography variant="h4" sx={{ color: ink, mb: 1.5 }}>{feat.title}</Typography>
                                <Typography sx={{ color: muted, lineHeight: 1.7, maxWidth: 320 }}>{feat.desc}</Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* SERVICES SECTION — editorial numbered list/grid with prices */}
            <Box component="section" id="services" sx={{ bgcolor: bone }}>
                <Container maxWidth="lg" sx={{ py: { xs: 9, md: 16 } }}>
                    {/* Asymmetric header: title left, filters right */}
                    <Grid container spacing={4} alignItems="flex-end" sx={{ mb: { xs: 5, md: 8 } }}>
                        <Grid item xs={12} md={6}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
                                <Box sx={{ width: 40, height: '1px', bgcolor: bronze }} />
                                <Typography sx={{ ...microLabel, color: bronze }}>The Menu</Typography>
                            </Stack>
                            <Typography variant="h2" sx={{ color: ink }}>
                                Services &amp; rituals
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                                {branches.length > 1 && (
                                    <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ border: `1px solid ${hairline}` }}>
                                        {branches.map((b) => {
                                            const active = String(landingBranchId) === String(b.id);
                                            return (
                                                <Button
                                                    key={b.id}
                                                    onClick={() => setLandingBranchId(String(b.id))}
                                                    sx={{
                                                        ...microLabel, minHeight: 44, px: { xs: 2, md: 2.5 }, borderRadius: 0,
                                                        color: active ? bronze : muted,
                                                        bgcolor: active ? alpha(bronze, 0.1) : 'transparent',
                                                        '&:hover': { bgcolor: alpha(bronze, 0.06) },
                                                    }}
                                                >
                                                    {b.name}
                                                </Button>
                                            );
                                        })}
                                    </Stack>
                                )}
                                <Stack direction="row" sx={{ border: `1px solid ${hairline}` }}>
                                    {[
                                        { id: 'both', label: 'All' },
                                        { id: 'female', label: 'Women' },
                                        { id: 'male', label: 'Men' }
                                    ].map((g) => (
                                        <Button
                                            key={g.id}
                                            onClick={() => setGenderFilter(g.id)}
                                            sx={{
                                                ...microLabel, minHeight: 44, px: { xs: 2.5, md: 3 }, borderRadius: 0,
                                                color: genderFilter === g.id ? paper : muted,
                                                bgcolor: genderFilter === g.id ? ink : 'transparent',
                                                '&:hover': { bgcolor: genderFilter === g.id ? ink : alpha(ink, 0.04) },
                                            }}
                                        >
                                            {g.label}
                                        </Button>
                                    ))}
                                </Stack>

                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                    {uniqueTypes.map((type) => (
                                        <Chip
                                            key={type}
                                            label={type === 'all' ? 'All types' : type}
                                            onClick={() => setTypeFilter(type)}
                                            variant="outlined"
                                            sx={{
                                                ...microLabel, borderRadius: 0, height: 36, px: 0.5, cursor: 'pointer',
                                                bgcolor: typeFilter === type ? alpha(bronze, 0.1) : 'transparent',
                                                color: typeFilter === type ? bronze : muted,
                                                borderColor: typeFilter === type ? bronze : hairline,
                                                '&:hover': { borderColor: bronze, bgcolor: alpha(bronze, 0.06) }
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Editorial list: numbered rows with hairline dividers */}
                    <Box sx={{ borderTop: `1px solid ${hairline}` }}>
                        {filteredServices.map((s, idx) => (
                            <Box
                                key={s.id}
                                sx={{
                                    borderBottom: `1px solid ${hairline}`,
                                    py: { xs: 3, md: 4 },
                                    transition: 'background-color 0.25s',
                                    '&:hover': { bgcolor: { md: alpha(bronze, 0.03) } },
                                }}
                            >
                                <Grid container spacing={{ xs: 2, md: 3 }} alignItems={{ md: 'center' }}>
                                    {/* Number */}
                                    <Grid item xs={3} sm={2} md={1}>
                                        <Typography sx={{ fontFamily: theme.typography.h2.fontFamily, fontSize: { xs: '1.1rem', md: '1.4rem' }, color: bronze }}>
                                            {`0${idx + 1}`.slice(-2)}
                                        </Typography>
                                    </Grid>
                                    {/* Title + meta */}
                                    <Grid item xs={9} sm={10} md={6}>
                                        <Typography variant="h4" sx={{ color: ink, mb: 0.75, lineHeight: 1.2 }}>{s.name}</Typography>
                                        <Typography sx={{ color: muted, lineHeight: 1.6, maxWidth: 460, display: { xs: 'none', sm: 'block' } }}>
                                            {s.description || 'A flagship treatment focused on precision, balance, and quiet rejuvenation.'}
                                        </Typography>
                                        <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: muted }}>
                                                <Iconify icon="solar:clock-circle-linear" width={16} />
                                                <Typography sx={{ ...microLabel, color: muted }}>{s.estimatedDuration || 45} Min</Typography>
                                            </Stack>
                                            <Typography sx={{ ...microLabel, color: bronze }}>
                                                {s.gender === 'both' ? 'Unisex' : s.gender}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                    {/* Price */}
                                    <Grid item xs={6} md={2}>
                                        <Typography sx={{ fontFamily: theme.typography.h3.fontFamily, fontSize: { xs: '1.4rem', md: '1.6rem' }, color: ink }}>
                                            {s.price}
                                            <Box component="span" sx={{ ...microLabel, color: muted, ml: 0.75 }}>Br</Box>
                                        </Typography>
                                    </Grid>
                                    {/* Book — always visible & tappable */}
                                    <Grid item xs={6} md={3} sx={{ textAlign: { md: 'right' } }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => { setBookingForm(prev => ({ ...prev, serviceIds: [s.id] })); setOpenBooking(true); }}
                                            sx={{
                                                ...microLabel, borderColor: ink, color: ink, minHeight: 44, px: 3, borderRadius: 0,
                                                width: { xs: '100%', md: 'auto' },
                                                '&:hover': { bgcolor: ink, color: paper, borderColor: ink },
                                            }}
                                            endIcon={<Iconify icon="solar:arrow-right-up-linear" width={16} />}
                                        >
                                            Book
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* GALLERY SECTION — refined editorial grid, varied tile heights */}
            <Box component="section" id="gallery" sx={{ bgcolor: paper, borderTop: `1px solid ${hairline}`, py: { xs: 9, md: 16 } }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="flex-end" sx={{ mb: { xs: 5, md: 8 } }}>
                        <Grid item xs={12} md={8}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
                                <Box sx={{ width: 40, height: '1px', bgcolor: bronze }} />
                                <Typography sx={{ ...microLabel, color: bronze }}>The Archive</Typography>
                            </Stack>
                            <Typography variant="h2" sx={{ color: ink }}>
                                Selected work
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ color: muted, lineHeight: 1.7, maxWidth: 360 }}>
                                A quiet record of recent transformations and studio sessions.
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Editorial grid: every third tile spans taller for rhythm */}
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {galleryImages.map((img, idx) => {
                            const tall = idx % 3 === 0;
                            return (
                                <Grid item xs={6} md={4} key={idx}>
                                    <Box
                                        onClick={() => setSelectedImg(img)}
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            aspectRatio: { xs: '3 / 4', md: tall ? '3 / 4' : '1 / 1' },
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: `1px solid ${hairline}`,
                                            '&:hover img': { transform: { md: 'scale(1.04)' } },
                                            '&:hover .overlay': { opacity: 1 },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={img}
                                            alt={`Milana work ${idx + 1}`}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
                                        />
                                        {/* Index marker — always visible, editorial */}
                                        <Typography
                                            sx={{
                                                ...microLabel, position: 'absolute', top: 12, left: 12,
                                                color: paper, mixBlendMode: 'difference',
                                            }}
                                        >
                                            {`0${idx + 1}`.slice(-2)}
                                        </Typography>
                                        {/* Hover/touch veil with view affordance */}
                                        <Box
                                            className="overlay"
                                            sx={{
                                                position: 'absolute', inset: 0,
                                                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                                                p: 2,
                                                background: `linear-gradient(to top, ${alpha(ink, 0.6)} 0%, transparent 55%)`,
                                                // Always-on subtle affordance on touch; reveal on hover from md up.
                                                opacity: { xs: 1, md: 0 },
                                                transition: 'opacity 0.35s',
                                            }}
                                        >
                                            <Typography sx={{ ...microLabel, color: paper }}>View</Typography>
                                            <Iconify icon="solar:arrow-right-up-linear" width={20} sx={{ color: paper }} />
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Box>

            {/* LOCATIONS SECTION — quiet, asymmetric */}
            <Box component="section" id="locations" sx={{ bgcolor: bone, borderTop: `1px solid ${hairline}`, py: { xs: 9, md: 16 } }}>
                <Container maxWidth="lg">
                    <Grid container spacing={{ xs: 6, md: 10 }} alignItems="flex-start">
                        <Grid item xs={12} md={5}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
                                <Box sx={{ width: 40, height: '1px', bgcolor: bronze }} />
                                <Typography sx={{ ...microLabel, color: bronze }}>The Houses</Typography>
                            </Stack>
                            <Typography variant="h2" sx={{ color: ink, mb: 3 }}>Visit us</Typography>
                            <Typography sx={{ color: muted, mb: { xs: 4, md: 6 }, lineHeight: 1.8, maxWidth: 420 }}>
                                Flagship boutiques across the capital, each designed as a calm
                                retreat from the city beyond the door.
                            </Typography>
                            <Box sx={{ borderTop: `1px solid ${hairline}` }}>
                                {branches.map((b) => (
                                    <Stack
                                        key={b.id}
                                        direction="row"
                                        spacing={2.5}
                                        alignItems="center"
                                        sx={{ py: 3, borderBottom: `1px solid ${hairline}` }}
                                    >
                                        <Avatar
                                            variant="square"
                                            sx={{
                                                width: 52, height: 52, bgcolor: 'transparent', color: ink,
                                                border: `1px solid ${hairline}`,
                                                fontFamily: theme.typography.h3.fontFamily, fontSize: '1.4rem',
                                            }}
                                        >
                                            {b.name[0]}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h4" sx={{ color: ink, fontSize: '1.25rem' }}>{b.name}</Typography>
                                            <Typography sx={{ color: muted }}>{b.location || 'Central Addis Ababa'}</Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                                            <Typography sx={{ ...microLabel, color: muted }}>Open</Typography>
                                        </Stack>
                                    </Stack>
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <Box sx={{ position: 'relative', border: `1px solid ${hairline}` }}>
                                <Box sx={{ height: { xs: 360, md: 560 }, overflow: 'hidden' }}>
                                    <MapComponent lat={8.9806} lng={38.7578} zoom={13} markers={markers} height="100%" />
                                </Box>
                                <Box
                                    sx={{
                                        position: 'absolute', bottom: 0, left: 0,
                                        px: 2.5, py: 1.5, bgcolor: bone,
                                        borderTop: `1px solid ${hairline}`, borderRight: `1px solid ${hairline}`,
                                    }}
                                >
                                    <Typography sx={{ ...microLabel, color: ink }}>Addis Ababa, Ethiopia</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* FOOTER */}
            <Box component="footer" sx={{ bgcolor: ink, color: paper, pt: { xs: 9, md: 14 }, pb: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={{ xs: 5, md: 8 }} sx={{ mb: { xs: 7, md: 10 } }}>
                        <Grid item xs={12} md={4}>
                            <Wordmark color={paper} size="h3" />
                            <Typography sx={{ color: alpha(paper, 0.65), mt: 3, mb: 4, lineHeight: 1.8, maxWidth: 360 }}>
                                A considered standard in beauty and grooming — timeless craft
                                met with quiet, modern care.
                            </Typography>
                            <Stack direction="row" spacing={1.5}>
                                {['mdi:instagram', 'mdi:facebook', 'ri:twitter-x-fill'].map((ic) => (
                                    <IconButton
                                        key={ic}
                                        sx={{
                                            color: paper, borderRadius: 0, border: `1px solid ${alpha(paper, 0.2)}`,
                                            width: 42, height: 42,
                                            '&:hover': { color: bronze, borderColor: bronze }
                                        }}
                                    >
                                        <Iconify icon={ic} />
                                    </IconButton>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography sx={{ ...microLabel, color: bronze, mb: 3 }}>Menu</Typography>
                            <Stack spacing={1.5}>
                                {['Services', 'Gallery', 'Memberships', 'Gift Cards'].map(link => (
                                    <Typography key={link} sx={{ color: alpha(paper, 0.65), cursor: 'pointer', '&:hover': { color: bronze } }}>{link}</Typography>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography sx={{ ...microLabel, color: bronze, mb: 3 }}>Support</Typography>
                            <Stack spacing={1.5}>
                                {['Contact', 'Careers', 'Locations', 'Policy'].map(link => (
                                    <Typography key={link} sx={{ color: alpha(paper, 0.65), cursor: 'pointer', '&:hover': { color: bronze } }}>{link}</Typography>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography sx={{ ...microLabel, color: bronze, mb: 3 }}>Newsletter</Typography>
                            <Typography sx={{ color: alpha(paper, 0.65), mb: 3, lineHeight: 1.7 }}>
                                Join the list for occasional style notes and private invitations.
                            </Typography>
                            <Stack direction="row" spacing={0}>
                                <TextField
                                    placeholder="your@email.com" variant="standard"
                                    sx={{
                                        flexGrow: 1,
                                        '& .MuiInput-underline:before': { borderBottomColor: alpha(paper, 0.25) },
                                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: bronze },
                                        '& .MuiInput-underline:after': { borderBottomColor: bronze },
                                        '& .MuiInputBase-input': { color: paper, py: 1.5 },
                                        '& .MuiInputBase-input::placeholder': { color: alpha(paper, 0.4), opacity: 1 },
                                    }}
                                />
                                <Button
                                    disableElevation
                                    sx={{ ...microLabel, bgcolor: bronze, color: paper, borderRadius: 0, px: 3, '&:hover': { bgcolor: paper, color: ink } }}
                                >
                                    Join
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderColor: alpha(paper, 0.12), mb: 4 }} />
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                        <Typography sx={{ ...microLabel, color: alpha(paper, 0.5) }}>© 2026 Milana — All rights reserved</Typography>
                        <Stack direction="row" spacing={4}>
                            <Typography sx={{ ...microLabel, color: alpha(paper, 0.5), cursor: 'pointer', '&:hover': { color: bronze } }}>Privacy</Typography>
                            <Typography sx={{ ...microLabel, color: alpha(paper, 0.5), cursor: 'pointer', '&:hover': { color: bronze } }}>Terms</Typography>
                            <Typography sx={{ ...microLabel, color: alpha(paper, 0.5) }}>By BZ Solutions</Typography>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* BOOKING DRAWER — editorial, flat, hairline fields */}
            <Drawer
                anchor="right"
                open={openBooking}
                onClose={() => setOpenBooking(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 480 },
                        p: 0,
                        bgcolor: bone,
                        borderLeft: `1px solid ${hairline}`,
                    }
                }}
            >
                <Box sx={{ p: { xs: 3, sm: 4 }, borderBottom: `1px solid ${hairline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography sx={{ ...microLabel, color: bronze, mb: 1 }}>Reservation</Typography>
                        <Typography variant="h3" sx={{ color: ink }}>Book your visit</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenBooking(false)} sx={{ color: ink, width: 44, height: 44 }}>
                        <Iconify icon="solar:close-circle-linear" width={26} />
                    </IconButton>
                </Box>

                <Box sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1, overflowY: 'auto' }}>
                    <Stack spacing={3.5}>
                        <TextField
                            fullWidth label="Full name" variant="standard"
                            value={bookingForm.customerName}
                            onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                            sx={{
                                '& .MuiInput-underline:before': { borderBottomColor: hairline },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: bronze },
                                '& .MuiInput-underline:after': { borderBottomColor: bronze },
                                '& .MuiInputLabel-root': { color: muted },
                                '& .MuiInputLabel-root.Mui-focused': { color: bronze },
                                '& .MuiInputBase-input': { color: ink, fontSize: '1.1rem', py: 1.25 }
                            }}
                        />
                        <TextField
                            fullWidth label="Phone number" variant="standard"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            sx={{
                                '& .MuiInput-underline:before': { borderBottomColor: hairline },
                                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: bronze },
                                '& .MuiInput-underline:after': { borderBottomColor: bronze },
                                '& .MuiInputLabel-root': { color: muted },
                                '& .MuiInputLabel-root.Mui-focused': { color: bronze },
                                '& .MuiInputBase-input': { color: ink, fontSize: '1.1rem', py: 1.25 }
                            }}
                        />
                        <FormControl fullWidth variant="standard">
                            <InputLabel sx={{ color: muted, '&.Mui-focused': { color: bronze } }}>Choose branch</InputLabel>
                            <Select
                                value={bookingForm.branchId}
                                onChange={(e) => setBookingForm({ ...bookingForm, branchId: e.target.value })}
                                sx={{
                                    color: ink, fontSize: '1.1rem', py: 0.5,
                                    '&:before': { borderBottomColor: hairline },
                                    '&:hover:not(.Mui-disabled):before': { borderBottomColor: bronze },
                                    '&:after': { borderBottomColor: bronze },
                                    '& .MuiSelect-icon': { color: muted }
                                }}
                            >
                                {branches.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth variant="standard">
                            <InputLabel sx={{ color: muted, '&.Mui-focused': { color: bronze } }}>Select services</InputLabel>
                            <Select
                                multiple value={bookingForm.serviceIds}
                                onChange={(e) => setBookingForm({ ...bookingForm, serviceIds: e.target.value })}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 1 }}>
                                        {selected.map((val) => (
                                            <Chip
                                                key={val}
                                                label={services.find(s => s.id === val)?.name}
                                                size="small"
                                                sx={{ bgcolor: alpha(bronze, 0.12), color: bronze, fontWeight: 600, borderRadius: 0 }}
                                            />
                                        ))}
                                    </Box>
                                )}
                                sx={{
                                    color: ink, fontSize: '1.1rem',
                                    '&:before': { borderBottomColor: hairline },
                                    '&:hover:not(.Mui-disabled):before': { borderBottomColor: bronze },
                                    '&:after': { borderBottomColor: bronze },
                                    '& .MuiSelect-icon': { color: muted }
                                }}
                            >
                                {services.map((s) => (
                                    <MenuItem key={s.id} value={s.id} sx={{ justifyContent: 'space-between', py: 1.25 }}>
                                        <Typography>{s.name}</Typography>
                                        <Typography sx={{ ...microLabel, color: bronze }}>{s.price} Br</Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth variant="standard">
                            <InputLabel sx={{ color: muted, '&.Mui-focused': { color: bronze } }}>Preferred specialist (optional)</InputLabel>
                            <Select
                                value={bookingForm.employeeId}
                                onChange={(e) => setBookingForm({ ...bookingForm, employeeId: e.target.value })}
                                sx={{
                                    color: ink, fontSize: '1.1rem', py: 0.5,
                                    '&:before': { borderBottomColor: hairline },
                                    '&:hover:not(.Mui-disabled):before': { borderBottomColor: bronze },
                                    '&:after': { borderBottomColor: bronze },
                                    '& .MuiSelect-icon': { color: muted }
                                }}
                            >
                                <MenuItem value="">No preference</MenuItem>
                                {eligibleSpecialists.map((sp) => (
                                    <MenuItem key={sp.id} value={sp.id} sx={{ justifyContent: 'space-between', py: 1.25 }}>
                                        <Typography>{sp.name}</Typography>
                                        <Stack direction="row" spacing={0.5}>
                                            {(sp.Specialties || []).slice(0, 2).map((c) => (
                                                <Chip key={c.id} label={c.name} size="small" sx={{ bgcolor: alpha(bronze, 0.12), color: bronze, fontWeight: 600, height: 20, fontSize: '0.6rem', borderRadius: 0 }} />
                                            ))}
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Stack direction="row" spacing={3}>
                            <TextField
                                fullWidth type="date" label="Preferred date" variant="standard"
                                InputLabelProps={{ shrink: true }}
                                value={bookingForm.preferredDate}
                                onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                                sx={{
                                    '& .MuiInput-underline:before': { borderBottomColor: hairline },
                                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: bronze },
                                    '& .MuiInput-underline:after': { borderBottomColor: bronze },
                                    '& .MuiInputLabel-root': { color: muted },
                                    '& .MuiInputLabel-root.Mui-focused': { color: bronze },
                                    '& .MuiInputBase-input': { color: ink, py: 1.25 }
                                }}
                            />
                            <TextField
                                fullWidth type="time" label="Time" variant="standard"
                                InputLabelProps={{ shrink: true }}
                                value={bookingForm.preferredTime}
                                onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                                sx={{
                                    '& .MuiInput-underline:before': { borderBottomColor: hairline },
                                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: bronze },
                                    '& .MuiInput-underline:after': { borderBottomColor: bronze },
                                    '& .MuiInputLabel-root': { color: muted },
                                    '& .MuiInputLabel-root.Mui-focused': { color: bronze },
                                    '& .MuiInputBase-input': { color: ink, py: 1.25 }
                                }}
                            />
                        </Stack>

                        <Button
                            variant="contained" fullWidth size="large" disableElevation onClick={handleBookingSubmit}
                            sx={{
                                ...microLabel, bgcolor: ink, color: paper, height: 60, mt: 2, borderRadius: 0,
                                '&:hover': { bgcolor: bronze },
                            }}
                            endIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
                        >
                            Secure Appointment
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            <Snackbar open={bookingSuccess} autoHideDuration={6000} onClose={() => setBookingSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setBookingSuccess(false)} severity="success" variant="filled">Booking saved! We will call you to confirm.</Alert>
            </Snackbar>

            {/* FULLSCREEN LIGHTBOX */}
            <Dialog fullScreen open={!!selectedImg} onClose={() => setSelectedImg(null)} TransitionComponent={Fade}>
                <Box sx={{ bgcolor: ink, height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton
                        onClick={() => setSelectedImg(null)}
                        aria-label="Close image"
                        sx={{ position: 'absolute', top: 20, right: 20, color: paper, width: 48, height: 48, border: `1px solid ${alpha(paper, 0.25)}`, borderRadius: 0 }}
                    >
                        <Iconify icon="solar:close-circle-linear" width={28} />
                    </IconButton>
                    <Box component="img" src={selectedImg} alt="Selected work" sx={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                </Box>
            </Dialog>
        </Box>
    );
}
