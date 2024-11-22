/* eslint-disable perfectionist/sort-imports */
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import DashboardLayout from 'src/layouts/dashboard';
import SettingsPage from 'src/sections/setting/setting';
import TriviaList from 'src/sections/trivia/trivaiList';
import ImportQuestions from 'src/sections/questions/upload';
import ApplicationPage from 'src/sections/questions/apps-view';
import TriviaLosersList from 'src/sections/trivia/lossersList';
import TriviaWinnersList from 'src/sections/trivia/winnersList';
import EditQuestionForm from 'src/sections/questions/editQuestion';
import TriviaDetailView from 'src/sections/trivia/triviaDetailView';
import QuestionBuilder from 'src/sections/questions/create-question';
import CustomerDetail from 'src/sections/subscription/customerDetail';
import SubscriptionView from 'src/sections/subscription/subscription-view';

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

/* eslint-disable react/prop-types */
const PrivateRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    keycloak.login();
    return <div>Redirecting to login...</div>;
  }

  return children;
};

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <PrivateRoute>
          <DashboardLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </PrivateRoute>
      ),
      children: [
        { element: <IndexPage />, index: true },
        // { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'questions', element: <ApplicationPage /> },
        { path: 'subscriptions', element: <SubscriptionView /> },
        { path: 'trivia', element: <TriviaList /> },
        { path: 'setting', element: <SettingsPage /> },
        { path: 'create-question', element: <QuestionBuilder /> },
        { path: 'upload-question', element: <ImportQuestions /> },
        { path: 'edit-question/:id', element: <EditQuestionForm /> },
        { path: '/customerDetail/:id', element: <CustomerDetail /> },
        { path: '/triviaDetail/:trivia_id', element: <TriviaDetailView /> },
        { path: '/trivia/:trivia_id', element: <TriviaDetailView /> },
        { path: '/triviawinners/:trivia_id', element: <TriviaWinnersList /> },
        { path: '/trivialosers/:trivia_id', element: <TriviaLosersList /> },
      ],
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

// import { lazy, Suspense } from 'react';
// import { Outlet, Navigate, useRoutes, useLocation } from 'react-router-dom';

// import DashboardLayout from 'src/layouts/dashboard';

// import SettingsPage from 'src/sections/setting/setting';
// import TriviaList from 'src/sections/trivia/trivaiList';
// import ImportQuestions from 'src/sections/questions/upload';
// import ApplicationPage from 'src/sections/questions/apps-view';
// import TriviaLosersList from 'src/sections/trivia/lossersList';
// import TriviaWinnersList from 'src/sections/trivia/winnersList';
// import EditQuestionForm from 'src/sections/questions/editQuestion';
// import TriviaDetailView from 'src/sections/trivia/triviaDetailView';
// import QuestionBuilder from 'src/sections/questions/create-question';
// import CustomerDetail from 'src/sections/subscription/customerDetail';
// import SubscriptionView from 'src/sections/subscription/subscription-view';

// export const IndexPage = lazy(() => import('src/pages/app'));
// export const BlogPage = lazy(() => import('src/pages/blog'));
// export const UserPage = lazy(() => import('src/pages/user'));
// export const LoginPage = lazy(() => import('src/pages/login'));
// export const ProductsPage = lazy(() => import('src/pages/products'));
// export const Page404 = lazy(() => import('src/pages/page-not-found'));

// // PrivateRoute component
// // eslint-disable-next-line react/prop-types
// const PrivateRoute = ({ children }) => {
//   const token = localStorage.getItem('authToken');
//   const userData = localStorage.getItem('userData');
//   const location = useLocation();

//   // Redirect to login if no token and not on the login page
//   if (!(token && userData) && location.pathname !== '/login') {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default function Router() {
//   const routes = useRoutes([
//     {
//       element: (
//         <PrivateRoute>
//           <DashboardLayout>
//             <Suspense>
//               <Outlet />
//             </Suspense>
//           </DashboardLayout>
//         </PrivateRoute>
//       ),
//       children: [
//         { element: <IndexPage />, index: true },
//         { path: 'user', element: <UserPage /> },
//         { path: 'products', element: <ProductsPage /> },
//         { path: 'blog', element: <BlogPage /> },
//         { path: 'questions', element: <ApplicationPage /> },
//         { path: 'subscriptions', element: <SubscriptionView /> },
//         { path: 'trivia', element: <TriviaList /> },
//         { path: 'setting', element: <SettingsPage /> },
//         { path: 'create-question', element: <QuestionBuilder /> },

//         { path: 'upload-question', element: <ImportQuestions /> },
//         { path: 'edit-question/:id', element: <EditQuestionForm /> },
//         { path: '/customerDetail/:id', element: <CustomerDetail /> },

//         { path: '/triviaDetail/:trivia_id', element: <TriviaDetailView /> },
//         { path: '/trivia/:trivia_id', element: <TriviaDetailView /> },
//         { path: '/triviawinners/:trivia_id', element: <TriviaWinnersList /> },
//         { path: '/trivialosers/:trivia_id', element: <TriviaLosersList /> },
//       ],
//     },
//     {
//       path: 'login',
//       element: <LoginPage />,
//     },
//     {
//       path: '404',
//       element: <Page404 />,
//     },
//     {
//       path: '*',
//       element: <Navigate to="/404" replace />,
//     },
//   ]);

//   return routes;
// }
