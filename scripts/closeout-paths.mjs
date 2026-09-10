import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Fresh release evidence has a separate private root; historical records are immutable.
export const closeoutRoot = path.join(repositoryRoot, "docs/release/OZ-RELEASE-CLOSEOUT");
export const migrationOutput = process.env.OZ_MIGRATION_GENERATED_DIR
  ? path.resolve(process.env.OZ_MIGRATION_GENERATED_DIR)
  : path.join(closeoutRoot, "generated/migration");
export const performanceOutput = path.join(closeoutRoot, "generated/performance");
export const browserOutput = path.join(closeoutRoot, "browser");
