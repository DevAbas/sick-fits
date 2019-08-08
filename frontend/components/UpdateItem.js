import { useState } from 'react';
import Router from 'next/router';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      price
      description
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
      title
      price
      description
    }
  }
`;

const UpdateItem = props => {
  const state = {};

  const onChangeHandler = (name, value) => {
    state[name] = value;
  };

  const onSubmitHandler = async (e, updateItemMutation) => {
    e.preventDefault();
    const variables = {
      title: state.title,
      description: state.description,
      price: state.price,
    };
    const res = await updateItemMutation({
      variables: { id: props.id, ...variables },
    });
    // Router.push({
    //   pathname: '/item',
    //   query: { id: res.data.createItem.id },
    // });
  };

  return (
    <Query query={SINGLE_ITEM_QUERY} variables={{ id: props.id }}>
      {({ data, error, loading }) => {
        if (loading) return <p>Loading...</p>;
        if (!data.item) return <p>No item found for id {props.id}</p>;
        return (
          <Mutation mutation={UPDATE_ITEM_MUTATION}>
            {(UpdateItem, { loading, error }) => (
              <Form onSubmit={e => onSubmitHandler(e, UpdateItem)}>
                <Error error={error} />
                <fieldset disabled={loading} aria-busy={loading}>
                  <label htmlFor='title'>
                    Title
                    <input
                      type='text'
                      name='text'
                      id='text'
                      placeholder='Title'
                      required
                      defaultValue={data.item.title}
                      onChange={e =>
                        onChangeHandler(e.target.name, e.target.value)
                      }
                    />
                  </label>
                  <label htmlFor='price'>
                    Price
                    <input
                      type='number'
                      name='price'
                      id='price'
                      placeholder='Price'
                      required
                      defaultValue={data.item.price}
                      onChange={e =>
                        onChangeHandler(
                          e.target.name,
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </label>
                  <label htmlFor='description'>
                    Description
                    <textarea
                      name='description'
                      id='description'
                      placeholder='Enter A Description'
                      required
                      defaultValue={data.item.description}
                      onChange={e =>
                        onChangeHandler(e.target.name, e.target.value)
                      }
                    />
                  </label>
                  <button type='submit'>
                    Sav{loading ? 'ing' : 'e'} Changes
                  </button>
                </fieldset>
              </Form>
            )}
          </Mutation>
        );
      }}
    </Query>
  );
};

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
