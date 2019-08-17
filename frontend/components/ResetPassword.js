import { useState } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';
import Error from './ErrorMessage';
import Form from './styles/Form';

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION(
    $password: String!
    $confirmPassword: String!
    $resetToken: String!
  ) {
    resetPassword(
      password: $password
      confirmPassword: $confirmPassword
      resetToken: $resetToken
    ) {
      id
      email
      name
    }
  }
`;

const ResetPassword = props => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  return (
    <Mutation
      mutation={RESET_PASSWORD_MUTATION}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      variables={{ password, confirmPassword, resetToken: props.resetToken }}>
      {(resetPassword, { error, loading }) => (
        <Form
          method='post'
          onSubmit={async e => {
            e.preventDefault();
            await resetPassword();
            setPassword('');
            setConfirmPassword('');
          }}>
          <fieldset disabled={loading} aria-busy={loading}>
            <h2>Write a new password to change your existing password!</h2>
            <Error error={error} />
            <label htmlFor='password'>
              Password
              <input
                type='password'
                name='password'
                placeholder='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>
            <label htmlFor='confirmPassword'>
              Confirm Password
              <input
                type='password'
                name='confirmPassword'
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </label>
            <button type='submit'>Reset Password!</button>
          </fieldset>
        </Form>
      )}
    </Mutation>
  );
};

export default ResetPassword;
