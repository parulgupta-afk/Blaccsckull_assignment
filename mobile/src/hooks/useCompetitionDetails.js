import { useQuery } from '@tanstack/react-query';
import { competitionApi } from '../api/competitionApi';

/**
 * Polling (not sockets) is a deliberate, scoped trade-off for this
 * assignment -- see README. 20s is frequent enough that "spots left"
 * feels live without hammering the read endpoint at thousands-of-users
 * scale (which is also why the read path has its own generous, separate
 * rate limit and is index-backed / cheap to compute on the server).
 */
export function useCompetitionDetails(competitionId, locale) {
  return useQuery({
    queryKey: ['competition', competitionId, locale],
    queryFn: () => competitionApi.getDetails(competitionId, locale),
    refetchInterval: 20_000,
    staleTime: 5_000,
  });
}
