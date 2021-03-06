const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

const mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
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
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);
    // Check if they own that item, or have the permissions
    const ownsItem = ctx.request.userId === item.user.id;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'PERMISSIONDELETE'].includes(permission)
    );
    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }
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

  async requestReset(parent, args, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) throw new Error(`There is no user with this email ${email}`);
    // 2. Set a reset token  and expiry on that user
    const resetToken = (await promisify(randomBytes)(20)).toString('hex');
    const resetTokenExpiry = Date.now() * 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    // 3. Email them that reset token
    const mailOptions = {
      from: 'thurabli.abas@gmail.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(
        `Your password reset token is here! \n\n <a href=${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}>Click Here to Reset</a>`
      ),
    };
    transport.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        return { message: 'Check your email address to reset password' };
      }
    });
  },

  async resetPassword(parent, args, ctx, info) {
    // 1. Check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Yoo passwords don't match");
    }
    // 2. Check if its a legit reset token
    // 3. Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired');
    }
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: { password, resetToken: null, resetTokenExpiry: null },
    });
    // 6. Generate new JWT
    const token = generateToken(updatedUser);
    // 7. Set cookie with JWT
    setCookie(token, ctx);
    // 8. Return the new updated User
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }

    // 2. Query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    );
    // 3. Check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    // 4. Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: { id: args.userId },
      },
      info
    );
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
