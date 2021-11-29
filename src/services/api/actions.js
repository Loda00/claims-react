export const fetch = (promise, body) => ({
  type: 'FETCH',
  payload: {
    promise,
    body
  }
});
