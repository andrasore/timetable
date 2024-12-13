const LoggedInForm = ({ username }: { username: string }) => (
  <form hx-target="this" hx-swap="outerHTML" class="nav--login-form">
    <div class="nav--login-icon"/>
    <b class="nav--login-name">{username}</b>
    <button hx-get="/logout">
      <i>Logout</i>
    </button>
  </form>
);

const NotLoggedInForm = () => (
  <form hx-target="this" hx-swap="outerHTML" class="nav--login-form">
    <input
      type="text"
      name="username"
      placeholder="Username"
    />
    <button hx-post="/login">
      <b>Login</b>
    </button>
    <button hx-post="/register">
      <i>Register</i>
    </button>
  </form>
);

export const renderLoginForm = async (username?: string) => {
  if (username) {
    return () => <LoggedInForm username={username} />;
  } else {
    return () => <NotLoggedInForm />;
  }
};
