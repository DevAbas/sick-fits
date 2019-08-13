import { useState } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';
import Error from './ErrorMessage';
import Form from './styles/Form';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`;

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const varsForMutation = { email, password };
  return (
    <Mutation
      mutation={SIGNIN_MUTATION}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      variables={{ ...varsForMutation }}>
      {(signin, { error, loading }) => (
        <Form
          method='post'
          onSubmit={async e => {
            e.preventDefault();
            await signin();
            setEmail('');
            setPassword('');
          }}>
          <fieldset disabled={loading} aria-busy={loading}>
            <h2>Sign to into your Account</h2>
            <Error error={error} />
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
            <button type='submit'>Sign In!</button>
          </fieldset>
        </Form>
      )}
    </Mutation>
  );
};

export default Signin;
