import { useEffect, useMemo, useState } from 'react';
import { getColleagueShifts } from '../services/schedule.service';

export default function useColleagueSwapShifts(colleagueId, requestingAssignmentId) {
  const lookup = useMemo(
    () => colleagueId && requestingAssignmentId ? { colleagueId, requestingAssignmentId } : null,
    [colleagueId, requestingAssignmentId],
  );
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!lookup) return;

    let cancelled = false;
    const finish = (shifts, error = false) => {
      if (!cancelled) {
        setResult({ lookup, shifts, error, selectedId: '' });
      }
    };

    getColleagueShifts(lookup.colleagueId, lookup.requestingAssignmentId)
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          finish(res.data);
        } else {
          finish([], true);
        }
      })
      .catch(() => finish([], true));

    return () => { cancelled = true; };
  }, [lookup]);

  const current = result?.lookup === lookup ? result : null;
  return {
    colleagueShifts: current?.shifts ?? [],
    loadingColleagueShifts: Boolean(lookup && !current),
    colleagueShiftsError: current?.error ?? false,
    selectedTargetAssignmentId: current?.selectedId ?? '',
    setSelectedTargetAssignmentId: (selectedId) => {
      setResult((previous) => previous?.lookup === lookup ? { ...previous, selectedId } : previous);
    },
  };
}
