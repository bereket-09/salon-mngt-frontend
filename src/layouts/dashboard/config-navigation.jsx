import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },

  {
    title: 'Manage Questions',
    path: '/questions',
    icon: icon('ic_blog'),
  },
  {
    title: 'Manage Subscriptions',
    path: '/subscriptions',
    icon: icon('ic_lock'),
  },
  {
    title: 'Manage Trivia',
    path: '/trivia',
    icon: icon('ic_blog'),
  },
  {
    title: 'Manage users',
    path: '/user',
    icon: icon('ic_user'),
  },
];

export default navConfig;
