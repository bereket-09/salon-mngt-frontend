/* eslint-disable perfectionist/sort-imports */
// Navigation configuration for the side menu.

const navConfig = [
  // Main category: Overview
  {
    title: 'Overview',
    icon: 'icomoon-free:stats-bars',
    children: [
      {
        title: 'Dashboard',
        path: '/', // More descriptive route
      },
    ],
  },
  
  // Main category: Questions
  {
    title: 'Questions Bank',
    icon: 'mdi:frequently-asked-questions',
    children: [
      {
        title: 'Question List',
        path: '/questions', // Reflects hierarchical structure
      },
      {
        title: 'Add Question',
        path: '/create-question', // Simplified wording
      },
      {
        title: 'Bulk Upload',
        path: '/upload-question', // Shortened for clarity
      },
    ],
  },
  
  // Main category: Subscriptions
  {
    title: 'Subscription Hub',
    icon: 'mdi:account-group',
    children: [
      {
        title: 'All Subscriptions',
        path: '/subscriptions', // Explicitly describes content
      },
    ],
  },
  
  // Main category: Trivia
  {
    title: 'Trivia Games Center',
    icon: 'material-symbols:toys-and-games-outline',
    children: [
      {
        title: 'Games List',
        path: '/trivia', // Clarified as a list of games
      },
      {
        title: 'Winner Times',
        path: '/trivia/winnertimes', // Clarified as a list of games
      },
      
    ],
  },
  
  // Main category: Settings
  {
    title: 'Settings',
    icon: 'tdesign:chat-setting',
    children: [
      {
        title: 'General Settings',
        path: '/setting', // Simplified path
      },
    ],
  },
];

export default navConfig;
