type ErrorPageProps = {
  statusCode: number;
  message: string;
  stack?: string;
};

export const ErrorPage = ({ statusCode, message, stack }: ErrorPageProps) => (
  <>
    <h1>Error happened &gt;:c</h1>
    <p>Status code: {statusCode}</p>
    <p>Message: {message}</p>
    <p>Stack: {stack?.split('\n').map((line) => <div>{line}</div>)}</p>
  </>
);
