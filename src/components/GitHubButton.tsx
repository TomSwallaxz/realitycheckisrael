import { Github } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { GITHUB_REPO_URL } from "@/lib/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function GitHubButton() {
  const { t } = useI18n();

  const handleClick = () => {
    window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            aria-label={t("contribute_github")}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border/60 bg-card/50 text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Github className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          <p>{t("contribute_github")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
