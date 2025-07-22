import {action} from 'storybook/actions';
import RegisterForm from '../components/RegisterForm';

export default {
    title: 'Forms/RegisterForm',
    component: RegisterForm,
    args: {
        register: action('register'),
    },
}

export const Empty = {}