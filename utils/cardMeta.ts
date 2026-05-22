// Visual + label metadata per card type, shared by avatars, lists, dialogs
// and the match form so the colour/icon language stays consistent. Auto-
// imported by Nuxt from the utils/ directory.
import type { Aspect, CardType, Difficulty } from "~/types/cards";

export const cardTypeMeta: Record<
  CardType,
  { label: string; plural: string; icon: string; color: string }
> = {
  hero: {
    label: "Hero",
    plural: "Heroes",
    icon: "mdi-shield-account",
    color: "primary",
  },
  scenario: {
    label: "Scenario",
    plural: "Scenarios",
    icon: "mdi-skull",
    color: "deep-purple-lighten-1",
  },
  encounter: {
    label: "Encounter Set",
    plural: "Encounter Sets",
    icon: "mdi-cards",
    color: "secondary",
  },
};

// Each aspect's signature colour (mirrors the game's aspect identity).
export const aspectMeta: Record<Aspect, { color: string; icon: string }> = {
  Justice: { color: "amber-darken-2", icon: "mdi-scale-balance" },
  Leadership: { color: "blue-darken-1", icon: "mdi-account-group" },
  Aggression: { color: "red-darken-1", icon: "mdi-sword" },
  Protection: { color: "green-darken-1", icon: "mdi-shield" },
};

export const difficultyMeta: Record<Difficulty, { color: string }> = {
  Standard: { color: "success" },
  Expert: { color: "warning" },
  Heroic: { color: "error" },
};
