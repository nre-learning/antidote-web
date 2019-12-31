import { useState, useEffect } from 'haunted';

const defaultState = {
  data: null,
  pending: false,
  completed: false,
  succeeded: false,
  error: false,
};

// hook that updates the component that calls this at various states of a
// request lifecycle
export default function useFetch(path, options) {
  const url = `${window.location.protocol}//${path}`;
  const [requestState, setRequestState] = useState(defaultState);

  useEffect(async () => {
    if (path) { // only start request after path variable is defined, this allows consuming hooks/components to determine when a request is started
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
          data: options && options.text ? await response.text() : await response.json(),
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
    }
  }, [url, JSON.stringify(options)]);

  return requestState
}