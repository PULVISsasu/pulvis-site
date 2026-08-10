import "server-only";
import { runDiscover, type DiscoverParams } from "./discover";
import { runNormalize } from "./normalize";
import { runMatch } from "./match";
import { runEnrich } from "./enrich";
import { runResolveEntities } from "./resolveEntities";
import { runDetectOwnership } from "./detectOwnership";
import { runScore } from "./score";

/**
 * DISCOVER → NORMALIZE → MATCH → ENRICH → RESOLVE ENTITIES → DETECT
 * OWNERSHIP → SCORE → STORE → DISPLAY.
 *
 * IDENTIFY_DECISION_MAKERS n'est pas une étape séparée dans cette
 * implémentation : les dirigeants sont peuplés dès MATCH (dirigeants fournis
 * par le connecteur légal avec la société) et affinés par DETECT_OWNERSHIP
 * (rôle "multi_franchise" sur les groupes). STORE/DISPLAY ne sont pas des
 * jobs : chaque étape ci-dessus écrit directement en base (STORE) et le
 * dashboard lit toujours l'état courant (DISPLAY).
 *
 * Chaque étape est indépendante et rejouable : voir §22 de
 * docs/fitness-intelligence-architecture.md.
 */
export const PIPELINE_STAGES = [
  "discover",
  "normalize",
  "match",
  "enrich",
  "resolve_entities",
  "detect_ownership",
  "score",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export async function runPipelineStage(stage: string, params: Record<string, unknown> = {}) {
  switch (stage as PipelineStage) {
    case "discover":
      if (!params.brandName || typeof params.brandName !== "string") {
        throw new Error("discover requiert brandName");
      }
      return runDiscover({
        connector: (params.connector as string) ?? "recherche-entreprises",
        brandName: params.brandName,
        department: params.department as string | undefined,
        naf: params.naf as string | undefined,
      } satisfies DiscoverParams);
    case "normalize":
      return runNormalize((params.limit as number) ?? 200);
    case "match":
      return runMatch((params.limit as number) ?? 100);
    case "enrich":
      return runEnrich((params.limit as number) ?? 100);
    case "resolve_entities":
      return runResolveEntities();
    case "detect_ownership":
      return runDetectOwnership();
    case "score":
      return runScore();
    default:
      throw new Error(`Étape de pipeline inconnue: ${stage}. Valeurs valides: ${PIPELINE_STAGES.join(", ")}`);
  }
}
