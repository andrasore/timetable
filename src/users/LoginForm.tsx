const HorizontalFlex = `
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const LoggedInForm = ({ username }: { username: string }) => (
  <form hx-target="this" hx-swap="outerHTML" style={HorizontalFlex}>
    <i>Logged in as: </i>
    <b>{username}</b>
    <a hx-get="/logout">
      <i>Logout</i>
    </a>
  </form>
);

const NotLoggedInForm = () => (
  <form hx-target="this" hx-swap="outerHTML" style={HorizontalFlex}>
    <input
      type="text"
      name="username"
      placeholder="Username"
      style="margin-bottom: 8px; margin-top: 8px"
    />
    <a hx-post="/login">
      <b>Login</b>
    </a>
    <a hx-post="/register">
      <i>Register</i>
    </a>
  </form>
);

export const renderLoginForm = async (username?: string) => {
  if (username) {
    return () => <LoggedInForm username={username} />;
  } else {
    return () => <NotLoggedInForm />;
  }
};
