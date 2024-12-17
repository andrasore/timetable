export const ErrorToast = ({ message }: { message: string }) => (
  <dialog open>
    <p>{message}</p>
    <form method="dialog">
      <button autofocus>OK</button>
    </form>
  </dialog>
);
