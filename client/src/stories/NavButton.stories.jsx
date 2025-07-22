
import { action } from 'storybook/actions';
import NavButton from '../components/NavButton'; 

export default {
  title: 'Header/NavButton',
  component: NavButton,
};

export const Dashboard = () => <NavButton>Dashboard</NavButton>;

export const LogOut = () => <NavButton>Log out</NavButton>;

export const Clickable = () => (
  <NavButton onClick={action('button-clicked')}>Clickable</NavButton>
);
