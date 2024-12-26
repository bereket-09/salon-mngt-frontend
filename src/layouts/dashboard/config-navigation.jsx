/* eslint-disable perfectionist/sort-imports */
import { FaCog, FaLock, FaTachometerAlt, FaQuestionCircle } from 'react-icons/fa';

const navConfig = [
  {
    title: 'Overview',
    icon: <FaTachometerAlt />,
    children: [
      {
        title: 'Dashboard',
        path: '/',
      },
    ],
  },
  {
    title: 'Questions', // Shortened group title
    icon: <FaQuestionCircle />,
    children: [
      {
        title: 'Questions List',
        path: '/questions',
      },
      {
        title: 'Create Question',
        path: '/create-question',
      },
      {
        title: 'Upload Questions',
        path: '/upload-question',
      },
    ],
  },
  {
    title: 'Subscriptions', // Shortened group title
    icon: <FaLock />,
    children: [
      {
        title: 'Subscriptions List',
        path: '/subscriptions',
      },
    ],
  },
  {
    title: 'Trivia', // Shortened group title
    icon: <FaTachometerAlt />,
    children: [
      {
        title: 'Trivia List',
        path: '/trivia',
      },
      // {
      //   title: 'Trivia Winners',
      //   path: '/triviawinners',
      // },
      // {
      //   title: 'Trivia Losers',
      //   path: '/trivialosers',
      // },
    ],
  },
  {
    title: 'Settings',
    icon: <FaCog />,
    children: [
      {
        title: 'Settings Page',
        path: '/setting',
      },
    ],
  },
];

export default navConfig;
