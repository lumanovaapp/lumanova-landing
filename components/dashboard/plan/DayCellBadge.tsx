import { DAY_CELL_STYLES, DayCellState } from "@/lib/day-cell-styles";

interface DayCellBadgeProps {
  state: DayCellState;
  // "full" — icon + text pill, for roomy cells (the weekly strip).
  // "compact" — icon only, no text/pill, for the dense 90-day map (its
  // meaning is decoded once via the legend shown above the map instead).
  variant: "full" | "compact";
  // compact only — lets a caller reposition the icon to dodge another
  // badge already occupying the default corner (see PlanCalendar, where
  // the frozen icon takes the milestone star's usual spot).
  className?: string;
}

// The state indicator shared by the week strip and the full 90-day map —
// one definition keeps both in sync with lib/day-cell-styles.ts instead of
// duplicating the pill/icon markup in each cell component.
export default function DayCellBadge({ state, variant, className }: DayCellBadgeProps) {
  const styles = DAY_CELL_STYLES[state];
  const Icon = styles.badgeIcon;

  if (variant === "compact") {
    if (!Icon) return null;
    return (
      <Icon
        className={`${className ?? "absolute -top-1 -left-1"} w-2.5 h-2.5 ${styles.badgeIconColor}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${styles.badgeBg} ${styles.badgeTextColor}`}
    >
      {Icon && <Icon className={`w-2.5 h-2.5 ${styles.badgeIconColor}`} />}
      {styles.badgeText}
    </span>
  );
}
