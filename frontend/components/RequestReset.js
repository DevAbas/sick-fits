import { useState } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import Form from './styles/Form';

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

const RequestReset = () => {
  const [email, setEmail] = useState('');
  const varsForMutation = { email };
  return (
    <Mutation
      mutation={REQUEST_RESET_MUTATION}
      variables={{ ...varsForMutation }}>
      {(requestReset, { error, loading, called }) => (
        <Form
          method='post'
          onSubmit={async e => {
            e.preventDefault();
            await requestReset();
            setEmail('');
          }}>
          <fieldset disabled={loading} aria-busy={loading}>
            <h2>Write your email to reset password!</h2>
            <Error error={error} />
            {!error && !loading && called && (
              <p>Check your email to reset password!</p>
            )}
            <label htmlFor='email'>
              Email
              <input
                type='email'
                name='email'
                placeholder='Your email'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <button type='submit'>Request Reset!</button>
          </fieldset>
        </Form>
      )}
    </Mutation>
  );
};

export default RequestReset;
