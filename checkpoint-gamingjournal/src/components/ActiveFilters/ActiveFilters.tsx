"use client";

import { Group, Pill, Chip, Button } from "@mantine/core";
import classes from "./ActiveFilters.module.css";

// Define the props for the GameFilter component
interface ActiveFiltersProps {
  selectedTypes: string[];
  selectedGenres: string[];
  selectedModes: string[];
  selectedThemes: string[];
  selectedPlatforms: string[];
  onTypeChange: (values: string[]) => void;
  onGenresChange: (values: string[]) => void;
  onModesChange: (values: string[]) => void;
  onThemesChange: (values: string[]) => void;
  onPlatformsChange: (values: string[]) => void;
  onClearAll: () => void;
}

// Create the ActiveFilters component to display the filters that the user has active on the games page
export default function ActiveFilters({
  selectedTypes,
  selectedGenres,
  selectedModes,
  selectedThemes,
  selectedPlatforms,
  onTypeChange,
  onGenresChange,
  onModesChange,
  onThemesChange,
  onPlatformsChange,
  onClearAll,
}: ActiveFiltersProps) {
  // Determine if any filters are active and count them
  const activeFilters =
    selectedTypes.length > 0 ||
    selectedGenres.length > 0 ||
    selectedModes.length > 0 ||
    selectedThemes.length > 0 ||
    selectedPlatforms.length > 0;
  const numberOfActiveFilters =
    selectedGenres.length +
    selectedTypes.length +
    selectedModes.length +
    selectedThemes.length +
    selectedPlatforms.length;

  const filters = [
    {
      values: selectedTypes,
      setter: onTypeChange,
    },
    {
      values: selectedGenres,
      setter: onGenresChange,
    },
    {
      values: selectedThemes,
      setter: onThemesChange,
    },
    {
      values: selectedModes,
      setter: onModesChange,
    },
    {
      values: selectedPlatforms,
      setter: onPlatformsChange,
    },
  ];

  if (!activeFilters) {
    return null;
  }

  return (
    <div className={classes.container}>
      <Group gap="xs">
        {filters.flatMap(({ values, setter }) =>
          values.map((value) => (
            <Pill
              key={value}
              withRemoveButton
              size="md"
              onRemove={() => setter(values.filter((v) => v !== value))}
            >
              {value}
            </Pill>
          )),
        )}
      </Group>

      <Button variant="subtle" color="white" size="xs" onClick={onClearAll}>
        Clear All ({numberOfActiveFilters})
      </Button>
    </div>
  );
}
