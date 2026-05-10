import type { Exercise, ModuleWithExercices } from "@/types/exercise";
import type { ADSnapshot } from "@/lib/ad/types";
import { StatementPane } from "@/components/exercise/statement-pane";
import { ProgressionSidebar } from "@/components/exercise/progression-sidebar";
import { PowerShellRunner } from "@/components/exercise/powershell-runner";
import { QcmForm } from "@/components/exercise/qcm-form";
import { HintsPanel } from "@/components/exercise/hints-panel";
import { runAndValidate, validateAnswer } from "./actions";

export function ExerciseWorkspace({
  exercise,
  modules,
  completedIds,
  isAdmin = false,
  snapshot,
}: {
  exercise: Exercise;
  modules: ModuleWithExercices[];
  completedIds: string[];
  isAdmin?: boolean;
  snapshot: ADSnapshot | null;
}) {
  const isInteractive =
    exercise.type === "compare-output" ||
    exercise.type === "compare-state" ||
    exercise.type === "syntax-match";

  return (
    <div className="flex flex-col md:h-[calc(100vh-2.75rem)] md:min-h-[600px] md:flex-row">
      <div className="hidden lg:flex">
        <ProgressionSidebar
          modules={modules}
          completedIds={completedIds}
          currentId={exercise.id}
          isAdmin={isAdmin}
        />
      </div>

      <section className="min-w-0 flex-1 md:overflow-y-auto md:border-r md:border-stone-800">
        <StatementPane exercise={exercise} snapshot={snapshot} />
      </section>

      <section className="w-full shrink-0 border-t border-stone-800 md:w-[460px] md:overflow-y-auto md:border-t-0 xl:w-[520px]">
        <div className="space-y-8 px-4 py-5 md:px-6 md:py-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              ta réponse
            </p>
            <div className="mt-3">
              {isInteractive ? (
                <PowerShellRunner
                  exercise={exercise}
                  validateAction={runAndValidate}
                />
              ) : (
                <QcmForm exercise={exercise} validateAction={validateAnswer} />
              )}
            </div>
          </div>
          <div className="border-t border-stone-800 pt-6">
            <HintsPanel indices={exercise.indices} />
          </div>
        </div>
      </section>
    </div>
  );
}
