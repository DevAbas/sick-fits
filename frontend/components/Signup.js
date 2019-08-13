import { useState } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import Form from './styles/Form';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $name: String!
    $email: String!
    $password: String!
  ) {
    signup(name: $name, email: $email, password: $password) {
      id
      email
      name
    }
  }
`;

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const varsForMutation = { name, email, password };
  return (
    <Mutation mutation={SIGNUP_MUTATION} variables={{ ...varsForMutation }}>
      {(signup, { error, loading }) => (
        <Form
          method='post'
          onSubmit={async e => {
            e.preventDefault();
            await signup();
            setName('');
            setEmail('');
            setPassword('');
          }}>
          <fieldset disabled={loading} aria-busy={loading}>
            <h2>Sign Up for An Account</h2>
            <Error error={error} />
            <label htmlFor='name'>
              Name
              <input
                type='text'
                name='name'
                placeholder='Your name'
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </label>
            <label htmlFor='name'>
              Email
              <input
                type='email'
                name='email'
                placeholder='Your email'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <label htmlFor='name'>
              Password
              <input
                type='password'
                name='password'
                placeholder='Your password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>
            <button type='submit'>Sign Up!</button>
          </fieldset>
        </Form>
      )}
    </Mutation>
  );
};

export default Signup;
