import { useState } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION(
    $permissions: [Permission]
    $userId: ID!
  ) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      name
      email
      permissions
    }
  }
`;

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = () => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, error, loading }) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage permission</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map((permission, index) => (
                  <th key={index}>{permission}</th>
                ))}
                <th>👇</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <UserBody key={user.id} user={user} />
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

const UserBody = ({ user }) => {
  const [permissions, setPermissions] = useState(user.permissions);
  const handleChangePermission = (e, updatePermissions) => {
    const checkbox = e.target;
    let updatedPermissions = [...permissions];
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = permissions.filter(
        permission => permission !== checkbox.value
      );
    }
    setPermissions(updatedPermissions);
    updatePermissions();
  };
  return (
    <Mutation
      mutation={UPDATE_PERMISSIONS_MUTATION}
      variables={{ permissions, userId: user.id }}>
      {(updatePermissions, { error, loading }) => (
        <>
          {error && (
            <tr>
              <td colSpan='8'>
                <Error error={error} />
              </td>
            </tr>
          )}
          <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {possiblePermissions.map((permission, index) => (
              <td key={index}>
                <label htmlFor={`${user.id}-permission-${permission}`}>
                  <input
                    id={`${user.id}-permission-${permission}`}
                    type='checkbox'
                    checked={permissions.includes(permission)}
                    value={permission}
                    onChange={e => handleChangePermission(e, updatePermissions)}
                  />
                </label>
              </td>
            ))}
            <td>
              <SickButton
                type='button'
                disabled={loading}
                onClick={updatePermissions}>
                updat{loading ? 'ing' : 'e'}
              </SickButton>
            </td>
          </tr>
        </>
      )}
    </Mutation>
  );
};

export default Permissions;
