import { useState, useEffect } from 'https://unpkg.com/haunted/haunted.js';

const defaultState = {
  data: null,
  pending: false,
  completed: false,
  succeeded: false,
  error: false,
};

// hook that updates the component that calls this at various states of a
// request lifecycle
export default function useFetch(url, options) {
  const [requestState, setRequestState] = useState(defaultState);

  useEffect(async () => {
    setRequestState({
      data: null,
      pending: true,
      completed: false,
      succeeded: false,
      error: false,
    });

    try {
      const response = await fetch(url, options);
      setRequestState({
        data: await response.json(),
        pending: false,
        completed: true,
        succeeded: true,
        error: false
      })
    } catch (e) {
      setRequestState({
        data: null,
        pending: false,
        completed: true,
        succeeded: false,
        error: e.message,
      });
    }
  }, [url, JSON.stringify(options)]);

  return requestState
}