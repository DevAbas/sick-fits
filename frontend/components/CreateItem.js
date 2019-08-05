import { useState } from 'react';
import Router from 'next/router';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

const CreateItem = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [largeImage, setLargeImage] = useState('');

  const onSubmitHandler = async (e, createItem) => {
    e.preventDefault();
    const res = await createItem();
    Router.push({
      pathname: '/item',
      query: { id: res.data.createItem.id },
    });
  };

  const uploadFile = async e => {
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'sickfits');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/abasthrcodes/image/upload',
      { method: 'POST', body: data }
    );
    const file = await res.json();
    setImage(file.secure_url);
    setLargeImage(file.eager[0].secure_url);
  };

  const variables = {
    title,
    description,
    price,
    image,
    largeImage,
  };
  return (
    <Mutation mutation={CREATE_ITEM_MUTATION} variables={{ ...variables }}>
      {(createItem, { loading, error }) => (
        <Form onSubmit={e => onSubmitHandler(e, createItem)}>
          <Error error={error} />
          <fieldset disabled={loading} aria-busy={loading}>
            <label htmlFor='file'>
              Image
              <input
                type='file'
                name='file'
                id='file'
                placeholder='Upload an image'
                required
                onChange={uploadFile}
              />
            </label>
            <label htmlFor='title'>
              Title
              <input
                type='text'
                name='text'
                id='text'
                placeholder='Title'
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
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
                value={price}
                onChange={e =>
                  setPrice(e.target.value && parseFloat(e.target.value))
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
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </label>
            <button type='submit'>Submit</button>
          </fieldset>
        </Form>
      )}
    </Mutation>
  );
};

export default CreateItem;
export { CREATE_ITEM_MUTATION };
