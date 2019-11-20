import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { State, useState, useEffect, useContext, useRef, createContext, component } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import useFetch from './use-fetch.js';

// provides the state of a request done by sending a request to one endpoint to
// begin an activity then polling another endpoint to monitor the progress of
// the activity
export default function usePollingRequest({
  initialRequestURL,
  initialRequestOptions,
  progressRequestURL, // string, or if a function is provided, it's passed the initial request response and should return the url
  progressRequestOptions,
  isProgressComplete, // predicate indicating if backend activity is still ongoing, passed the progress response body
}) {
  const initialRequestState = useFetch(initialRequestURL, initialRequestOptions);
  const [progressRequestState, setProgressRequestState] = useState({
    data: null,
    pending: false,
    completed: false,
    succeeded: false,
    error: false,
  });

  useEffect(()=> {
    if (initialRequestState.error) {
      setProgressRequestState({
        data: null,
        pending: false,
        completed: true,
        succeeded: false,
        error: initialRequestState.error,
      });
    } else if (initialRequestState.succeeded) {
      let attemptCount = 0;
      let requestOngoing = false;  // prevent interval from queueing new request if previous request hasn't finished

      if (typeof progressRequestURL === 'function') {
        progressRequestURL = progressRequestURL(initialRequestState.data);
      }

      setProgressRequestState({
        data: null,
        pending: true,
        completed: false,
        succeeded: false,
        error: false,
      });

      const fetchLoop = setInterval(async () => {
        if (requestOngoing) return;
        requestOngoing = true;

        if (attemptCount++ === 1200) {
          setProgressRequestState({
            data: null,
            pending: false,
            completed: true,
            succeeded: false,
            error: 'Polling request exceeded maximum attempts.'
          });
          clearInterval(fetchLoop);
        }

        try {
          const response = await fetch(progressRequestURL);
          const data = await response.json();

          if (isProgressComplete(data)) {
            setProgressRequestState({
              data,
              pending: false,
              completed: true,
              succeeded: true,
              error: false
            });
            clearInterval(fetchLoop);
          } else {
            setProgressRequestState({
              data,
              pending: true,
              completed: false,
              succeeded: false,
              error: false
            });
          }
        } catch (e) {
          setProgressRequestState({
            data: null,
            pending: false,
            completed: true,
            succeeded: false,
            error: e.message,
          });
          clearInterval(fetchLoop);
        } finally {
          requestOngoing = false;
        }
      }, 500);
    }
  }, [JSON.stringify(progressRequestOptions), initialRequestState.succeeded, initialRequestState.error]);

  return progressRequestState;
}