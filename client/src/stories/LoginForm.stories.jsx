import { action } from 'storybook/actions';
import LoginForm from '../components/LoginForm';
import { fn } from 'storybook/internal/test';

const mockPromise = () => Promise.resolve({data: {email: 'test'}});
export default {
    title: 'Forms/LoginForm',
    component: LoginForm,
    args: {
        onSave: mockPromise,
        dispatch: fn(),
    }
}

export const Login = {}