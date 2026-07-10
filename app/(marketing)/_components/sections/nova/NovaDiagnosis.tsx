/**
 * NovaDiagnosis — the "already diagnosed" flagship band, back by request.
 *
 * This mounts the original AiDiagnosisCard (EvidenceTrust.tsx): the dark inset
 * band with drifting log columns and the live-diagnosis timeline (analyse →
 * verdict → stream the cause token by token → snap evidence chips → tabbed
 * console/network/actions panel). All of its interaction code is untouched.
 *
 * What the new system changes is only the CHROME, via `.nv-root .dxflag`
 * overrides in nova.css: the band is recolored from deep indigo to the
 * system's near-black (#121317 family), the corner radius and inset width are
 * aligned to the nv container, and the band header adopts the mono-eyebrow +
 * Google Sans Flex treatment.
 */

import { AiDiagnosisCard } from "../EvidenceTrust";

export function NovaDiagnosis() {
  return <AiDiagnosisCard />;
}
