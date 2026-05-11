/* eslint-disable */
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

// Import sections
import ProfilePage from 'src/sections/setting/profile';
import SettingsPage from 'src/sections/setting/setting';
import BranchesTable from 'src/sections/branches/manageBranches';
import ServicesPage from 'src/sections/salon-services/manage-service';
import CustomersPage from 'src/sections/customers/curstomersPage';
import InvoicesList from 'src/sections/customers/Invoices';
import Attendance from 'src/sections/customers/Attendance';
import UserManagement from 'src/sections/customers/UserManagment';
import CustomersManagePage from 'src/sections/customers/CustomerManagmet';
import CommissionReport from 'src/sections/customers/commistion';
import CommissionManager from 'src/sections/customers/CommissionManager';
import ManageGallery from 'src/sections/gallery/manage-gallery';
import PaymentMethodsPage from 'src/sections/setting/payment-methods';

// New Milana Salon Views
import AnalyticsView from 'src/sections/analytics/analytics-view';
import CheckInView from 'src/sections/reception/check-in-view';
import MyAssignmentsView from 'src/sections/employee/my-assignments-view';
import MyEarningsView from 'src/sections/employee/my-earnings-view';
import SpecialistBoard from 'src/sections/employee/specialist-board';
import { BookingsView } from 'src/sections/bookings/view';

// Lazy load pages
export const IndexPage = lazy(() => import('src/pages/app'));
export const LandingPage = lazy(() => import('src/pages/landing'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const BookingsPage = lazy(() => import('src/pages/bookings'));

// ----------------------------------------------------------------------

/* eslint-disable react/prop-types */
const PrivateRoute = ({ children }) => {
  const userData = localStorage.getItem('userData');
  const authToken = localStorage.getItem('authToken');
  const currentTime = Math.floor(Date.now() / 1000);

  if (userData && authToken) {
    const parsedUserData = JSON.parse(userData);
    if (parsedUserData.exp && parsedUserData.exp < currentTime) {
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      return <Navigate to="/login" replace />;
    }
  }

  if (!userData || !authToken) {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    return <Navigate to="/login" replace />;
  }

  return children;
};

const IndexPageRoleRedirect = () => {
  const userStr = localStorage.getItem('userData');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') {
    return <Navigate to="/analytics" replace />;
  }

  return <Navigate to="/my-assignments" replace />;
};

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <PrivateRoute>
          <DashboardLayout>
            <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading...</Box>}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </PrivateRoute>
      ),
      children: [

        // Operations
        { path: 'analytics', element: <AnalyticsView /> },
        { path: 'bookings', element: <BookingsPage /> },
        { path: 'customers', element: <CustomersPage /> },
        { path: 'specialist-board', element: <SpecialistBoard /> },

        // Administration
        { path: 'user-mngt', element: <UserManagement /> },
        { path: 'services', element: <ServicesPage /> },
        { path: 'service-type', element: <BranchesTable /> },
        { path: 'manage-gallery', element: <ManageGallery /> },
        { path: 'payment-methods', element: <PaymentMethodsPage /> },

        // Financials
        { path: 'commissionsMgr', element: <CommissionManager /> },
        { path: 'commissions/:userId', element: <CommissionReport /> },
        { path: 'invoiceslist', element: <InvoicesList /> },
        { path: 'attendance-report', element: <Attendance /> },

        // Reception
        { path: 'check-in', element: <CheckInView /> },
        { path: 'attendance', element: <Attendance /> },

        // Employee
        { path: 'my-assignments', element: <MyAssignmentsView /> },
        { path: 'my-attendance', element: <Attendance /> },
        { path: 'my-earnings', element: <MyEarningsView /> },

        // Settings
        { path: 'setting', element: <SettingsPage /> },
        { path: 'profile', element: <ProfilePage /> },
      ],
    },
    {
      path: '/',
      element: <LandingPage />,
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}

import { Box } from '@mui/material';
