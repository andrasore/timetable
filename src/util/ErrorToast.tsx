export const ErrorToast = ({ message }: { message: string }) => <dialog open>
  <p>{message}</p>
  <form method="dialog">
    <button>OK</button>
  </form>
</dialog>;
