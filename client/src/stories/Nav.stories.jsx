
import Nav from '../components/Nav';
import { action } from 'storybook/actions';
import { fn } from 'storybook/internal/test';

const story = {
  title: 'Components/Nav',
  component: Nav,
  args: {
    dispatch: fn(),
    user: {},
    logout: action('logout'),
  }
};

export default story;

export const Default = {}
export const LoggedIn = { 
  args: { user: { id: 1, first_name: 'John', last_name: 'Doe', email: '' }}
}