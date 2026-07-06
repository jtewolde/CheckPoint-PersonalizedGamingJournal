'use client';

import { useState, useEffect } from "react";
import { MultiSelect, Select, Drawer, Stack, Button, ActionIcon, Tooltip, Divider, SegmentedControl } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Funnel, RotateCcw } from "lucide-react";
import classes from './JournalFilters.module.css';

type JournalFiltersVariant = 'default' | 'small'

// Define the props for the JournalFilters component
interface JournalFilterProps {
    color: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    variant: JournalFiltersVariant;
    availableGames: { id: string; name: string }[];

    sortOption: 'asc' | 'desc';
    selectedGameId: string;
    selectedEntryType: string;
    selectedTags: string[];

    onSortChange: (value: 'asc' | 'desc') => void;
    onGameIdChange: (value: string) => void;
    onEntryTypeChange: (value: string) => void;
    onTagsChange: (value: string[]) => void;
}

// Create the JournalFilters component with the defined props to handle journal entry filtering/sorting
export default function JournalFilters({
    color,
    size = "lg",
    radius = 'md',
    className,
    variant,
    sortOption,
    selectedEntryType,
    selectedTags,
    selectedGameId,
    availableGames,
    onSortChange,
    onGameIdChange,
    onEntryTypeChange,
    onTagsChange
} : JournalFilterProps) {

  // States for managing the drawer visibility
  const [opened, { toggle, close }] = useDisclosure(false);

  // States for keeping track of sorting and filtering
  const [draftSort, setDraftSort] = useState(sortOption);
  const [draftEntryType, setDraftEntryType] = useState(selectedEntryType);
  const [draftTags, setDraftTags] = useState(selectedTags);
  const [draftGameId, setDraftGameId] = useState(selectedGameId);

  // Function to handle filters/sorting with the update filters button
  const handleApplyFilters = () => {
      onSortChange(draftSort);
      onEntryTypeChange(draftEntryType);
      onTagsChange(draftTags);
      onGameIdChange(draftGameId);
      close();
  };

  // Function to clear all of the filters/sorting to be used in clear filters button
  const handleClearFilters = () => {
      setDraftSort('asc');
      setDraftEntryType('');
      setDraftTags([]);
      setDraftGameId('');
  };

  // Determine if any filters are active and count them
  const activeFilters =
      draftEntryType.length > 0 ||
      draftTags.length > 0;

  const numberOfActiveFilters =
      draftEntryType.length +
      draftTags.length;

  return (
    <div className={classes.filterContainer}>
      <div className={classes.filterTopRow}>
        {variant === 'default' && (
          <Tooltip label='Apply Filters' position="top">
              <Button 
              className={className}
              size={size} 
              radius={radius} 
              color={color} 
              leftSection={<Funnel size={30} />} 
              onClick={toggle}>
                  Filters ({numberOfActiveFilters})
              </Button>
          </Tooltip>
      )}

      {variant === 'small' && (
          <Tooltip label='Apply Filters' position="top">
              <ActionIcon
              size={size}
              radius={radius}
              color={color}
              onClick={toggle}
              >
                  <Funnel size={30} />
              </ActionIcon>
          </Tooltip>
      )}
      </div>

      {/* Drawer component to hold the filter options, slides in from left */}
      <Drawer
          opened={opened}
          onClose={close}
          position='left'
          size="300px"
          title='Sort and Filter'
          className={classes.drawer}
          styles={{
              header: {
                  borderBottom: '1px solid gray',
                  marginBottom: '10px'
              },
              body: {
                  display: 'flex',
                  flexDirection: 'column',
                  height: '90%',
              },
              title: {
                  fontSize: '24px',
                  color: 'white',
                  fontFamily: 'Noto Sans',
                  fontWeight: 300
              },
              close: {
                  color: 'white'
              }
          }}
      >
          <Stack justify='space-between' h='100%'>
              <Stack gap='md'>
                  <Select
                      styles={{
                          dropdown: {
                              background: '#212121',
                              color: 'whitesmoke'
                          },
                          input: {
                              background: '#212121',
                              fontFamily: 'Noto Sans',
                              color: 'white'
                          },
                          option: {
                              fontFamily: 'Noto Sans',
                              fontSize: '16px',
                              fontWeight: 330
                          },
                          label: {
                              fontFamily: 'Noto Sans',
                              color: 'white',
                              fontSize: '20px',
                              fontWeight: 300
                          }
                      }}
                      label="Filter by Game"
                      placeholder="Select Game"
                      checkIconPosition='right'
                      scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                      data={[
                          { value: 'all', label: 'All Games' },
                          ...availableGames.map((game) => ({
                              value: game.id,
                              label: game.name
                          }))
                      ]}
                      value={draftGameId}
                      onChange={(value) => setDraftGameId(value || 'all')}
                      className={classes.filterDropdown}
                      mb="md"
                  />

                  <Select
                      label="Filter by Entry Type"
                      placeholder="Select Entry Type"
                      styles={{
                          dropdown: {
                              background: '#212121',
                              color: 'whitesmoke'
                          },
                          input: {
                              background: '#212121',
                              fontFamily: 'Noto Sans',
                              color: 'white'
                          },
                          option: {
                              fontFamily: 'Noto Sans',
                              fontSize: '16px',
                              fontWeight: 330
                          },
                          label: {
                              fontFamily: 'Noto Sans',
                              color: 'white',
                              fontSize: '20px',
                              fontWeight: 300
                          }
                      }}
                      data={[
                          "First Impressions",
                          "Progress Update",
                          "Boss Fight",
                          "Achievement",
                          "Story Reaction",
                          "Review",
                          "Ending Thoughts",
                          "General",
                      ]}
                      value={draftEntryType}
                      onChange={(value) => setDraftEntryType(value || '')}
                      className={classes.filterDropdown}
                      mb="md"
                      clearable
                  />

                  <MultiSelect
                      label="Filter by Tags"
                      placeholder="Select Tags"
                      styles={{
                          dropdown: {
                              background: '#212121',
                              color: 'whitesmoke'
                          },
                          input: {
                              background: '#212121',
                              fontFamily: 'Noto Sans',
                              color: 'white'
                          },
                          option: {
                              fontFamily: 'Noto Sans',
                              fontSize: '16px',
                              fontWeight: 330
                          },
                          label: {
                              fontFamily: 'Noto Sans',
                              color: 'white',
                              fontSize: '20px',
                              fontWeight: 300
                          }
                          }}
                          checkIconPosition='left'
                          data={[
                              "Story",
                              "Boss Fight",
                              "Exploration",
                              "Multiplayer",
                              "Grinding",
                              "Side Quest",
                              "Achievement",
                              "Review",
                          ]}
                          value={draftTags}
                          onChange={(value) => setDraftTags(value || [])}
                          scrollAreaProps={{ type: 'auto', scrollbarSize: 10, scrollbars: 'y', classNames: { scrollbar: classes.scrollBar }}}
                          className={classes.filterDropdown}
                          mb="md"
                  />

                  <SegmentedControl
                      fullWidth
                      value={draftSort}
                      size='md'
                      mb="md"
                      onChange={(value) => setDraftSort(value)}
                      data={[
                          { label: 'Newest', value: 'desc' },
                          { label: 'Oldest', value: 'asc' }
                      ]}
                  />
              </Stack>
              
              <Stack gap='sm'>
                  <div style={{ borderTop: '1px solid #6c6c6c', paddingTop: '0.5rem', gap: '0.5rem'}}>
                      <Button
                          fullWidth
                          variant='subtle'
                          color='white'
                          leftSection={<RotateCcw size={18} />}
                          mb='sm'
                          onClick={handleClearFilters}
                      >
                          Clear Filters
                      </Button>

                      <Button
                          fullWidth
                          variant='filled'
                          color="blue"
                          onClick={handleApplyFilters}
                      >
                          Apply Filters
                      </Button>

                  </div>
              </Stack>
          </Stack>
      </Drawer>
    </div>
  ) 

}