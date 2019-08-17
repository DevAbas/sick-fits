import ResetPassword from '../components/ResetPassword';

const ResetPasswordPage = props => (
  <div>
    <ResetPassword resetToken={props.query.resetToken} />
  </div>
);

export default ResetPasswordPage;
