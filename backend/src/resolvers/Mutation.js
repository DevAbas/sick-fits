const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

const mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    );
    return item;
  },
  updateItem(parent, args, ctx, info) {
    // First take a copy of the updates
    const updates = { ...args };
    // remove the ID from updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id },
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // Find the item
    const item = await ctx.db.query.item({ where }, `{id title}`);
    return await ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // lowercase their email
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );
    // check jwt
    const token = generateToken(user);

    // set cookie with token
    setCookie(token, ctx);

    // return user
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // check if there's a user with that email
    const user = await ctx.db.query.user({
      where: {
        email,
      },
    });
    if (!user) throw new Error(`There is no user with this email ${email}`);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Invalid password');
    // check jwt
    const token = generateToken(user);

    // set cookie with token
    setCookie(token, ctx);

    // return user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
};

function generateToken(user) {
  // create a JWT for the user
  return jwt.sign(
    {
      userId: user.id,
    },
    process.env.APP_SECRET
  );
}

function setCookie(token, ctx) {
  // set the JWT as a cookie on the response
  // httpOnly - makes sure one cannot access the token via JS (through 3rd party extension, rogue Chrome ext, etc)
  // maxAge - how long the cookie lasts
  ctx.response.cookie('token', token, {
    httpOnly: true,
    maxAge: ONE_YEAR,
  });
}

module.exports = mutations;
