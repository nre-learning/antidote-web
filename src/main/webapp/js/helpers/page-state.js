function makeId() {
  let text = "";
  // must only be lower-case alphanumeric, since this will form
  // part of the kubernetes namespace name
  const possible = "0123456789abcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 16; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export const [serviceHost, syringeServiceRoot, sshServiceHost] = (() => {
  switch (window.ENVIRONMENT) {
    case "mock":
      return ['127.0.0.1:8086', '127.0.0.1:8086', '127.0.0.1:30010'];
    case "self-medicate":
      return ['antidote-local:30001', 'antidote-local:30001/syringe', 'antidote-local:30010'];
    case "production":
    default:
      // todo: confirm with Matthew that this path will host the socket server
      return [window.location.origin, window.location.origin+'/syringe', window.location.origin+'/ssh'];
  }
})();

// This function generates a unique session ID so we can make sure you
// consistently connect to your lab resources on the back-end. We're not doing
// anything nefarious with this ID - this is just to make sure you have a good
// experience on the front-end.
export const sessionId = (() => {
  var sessionCookie = document.cookie.replace(/(?:(?:^|.*;\s*)nreLabsSession\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  if (sessionCookie === '') {
    const sessionId = makeId();
    document.cookie = "nreLabsSession=" + sessionId;
    return sessionId;
  }
  return sessionCookie;
})();

// get params from page url query parameters
export const [lessonId, lessonStage, collectionId] = (() => {
  const url = new URL(window.location.href);
  const id = url.searchParams.get("lessonId");
  const stage = url.searchParams.get("lessonStage");
  const collection = url.searchParams.get("collectionId");

  return [
    id && id.length > 0 ? parseInt(id) : null,
    stage && stage.length > 0 ? parseInt(stage) : null,
    collection && collection.length > 0 ? parseInt(collection) : null,
  ]
})();
