// maybe tack derivations onto the response objects to prevent recalc?

export function derivePresentationsFromLessonDetails(detailsRequest) {
  const endpoints = detailsRequest.succeeded ? detailsRequest.data.LiveEndpoints : [];

  return Object.values(endpoints).reduce((acc, ep) => {
    if (ep.Presentations) {
      ep.Presentations.forEach((pres) => {
        const name = ep.Presentations.length > 1
          ? `${ep.Name} - ${pres.Name}`
          : `${ep.Name}`;

        acc.push({
          name,
          endpoint: ep.Name,
          type: pres.Type,
          host: ep.Host,
          port: pres.Port,
        });
      });
    }

    return acc;
  }, []);
}