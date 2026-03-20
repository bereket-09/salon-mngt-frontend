// Navigation configuration for the side menu with simple labels.

const navConfig = [
  // ----------------------------------------------------------------------
  // OVERVIEW
  // ----------------------------------------------------------------------
  {
    title: 'Overview',
    icon: 'solar:chart-bold-duotone',
    path: '/analytics',
    roles: ['admin'],
  },

  // ----------------------------------------------------------------------
  // DAILY OPERATIONS
  // ----------------------------------------------------------------------
  {
    title: 'Operations',
    icon: 'solar:calendar-minimalistic-bold-duotone',
    roles: ['admin', 'receptionist'],
    children: [
      {
        title: 'Check-In',
        path: '/check-in',
      },
      {
        title: 'Bookings',
        path: '/bookings',
      },
      {
        title: 'Active Customers',
        path: '/customers',
      },
      {
        title: 'Specialist Status',
        path: '/specialist-board',
      },
    ],
  },

  // ----------------------------------------------------------------------
  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    title: 'Management',
    icon: 'solar:settings-bold-duotone',
    roles: ['admin'],
    children: [
      {
        title: 'Employees',
        path: '/user-mngt',
      },
      {
        title: 'Services',
        path: '/services',
      },
      {
        title: 'Branches',
        path: '/service-type',
      },
      {
        title: 'Gallery',
        path: '/manage-gallery',
      },
    ],
  },

  // ----------------------------------------------------------------------
  // FINANCIALS
  // ----------------------------------------------------------------------
  {
    title: 'Financials',
    icon: 'solar:wallet-money-bold-duotone',
    roles: ['admin'],
    children: [
      {
        title: 'Invoices & Billing',
        path: '/invoiceslist',
      },
      {
        title: 'Staff Commissions',
        path: '/commissionsMgr',
      },
      {
        title: 'Attendance & Payroll',
        path: '/attendance-report',
      },
    ],
  },

  // ----------------------------------------------------------------------
  // PERSONAL WORKSPACE
  // ----------------------------------------------------------------------
  {
    title: 'My Workspace',
    icon: 'solar:user-circle-bold-duotone',
    roles: ['admin', 'receptionist', 'barber', 'hairdresser', 'nail_specialist', 'spa_therapist', 'employee'],
    children: [
      {
        title: 'My Daily Jobs',
        path: '/my-assignments',
      },
      {
        title: 'My Attendance',
        path: '/my-attendance',
      },
      {
        title: 'My Earnings',
        path: '/my-earnings',
      },
    ],
  },
];

export default navConfig;
