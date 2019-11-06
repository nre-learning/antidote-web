// maybe tack derivations onto the response objects to prevent recalc?

export function derivePresentationsFromLessonDetails(detailsRequest) {
  const endpoints = detailsRequest.completed ? detailsRequest.data.LiveEndpoints : [];

  return Object.values(endpoints).reduce((acc, ep) => {
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
    return acc;
  }, []);
}