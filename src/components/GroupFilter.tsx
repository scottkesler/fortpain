import { groupsInUnit } from '../groups';
import type { PersonnelGroup } from '../groups';

interface GroupFilterProps {
  value: string;
  onChange: (nextGroupId: string) => void;
}

const OFFENSE_GROUPS = groupsInUnit('offense');
const DEFENSE_GROUPS = groupsInUnit('defense');
const OTHER_GROUPS = groupsInUnit('other');

/** Whether the active group belongs to this dropdown's unit. */
function selectValueFor(groups: PersonnelGroup[], activeGroupId: string): string {
  return groups.some((group) => group.id === activeGroupId) ? activeGroupId : '';
}

/**
 * Personnel groups as an Offense dropdown and a Defense dropdown — a phone
 * screen can't fit a row of buttons per position without wrapping into a wall
 * of chips, so each side of the ball collapses into a single select. The
 * handful of remaining groups (All Players, Special Teams) stay as buttons.
 */
function GroupFilter({ value, onChange }: GroupFilterProps) {
  function selectGroup(nextGroupId: string) {
    if (nextGroupId !== '') {
      onChange(nextGroupId);
    }
  }

  return (
    <div className="group-filter" role="group" aria-label="Personnel group">
      <span className="group-filter__label">Personnel group</span>

      <div className="group-filter__dropdowns">
        <select
          className="group-filter__select"
          aria-label="Offense position group"
          value={selectValueFor(OFFENSE_GROUPS, value)}
          onChange={(changeEvent) => selectGroup(changeEvent.target.value)}
        >
          <option value="">Offense</option>
          {OFFENSE_GROUPS.map((group) => (
            <option key={group.id} value={group.id}>
              {group.label}
            </option>
          ))}
        </select>

        <select
          className="group-filter__select"
          aria-label="Defense position group"
          value={selectValueFor(DEFENSE_GROUPS, value)}
          onChange={(changeEvent) => selectGroup(changeEvent.target.value)}
        >
          <option value="">Defense</option>
          {DEFENSE_GROUPS.map((group) => (
            <option key={group.id} value={group.id}>
              {group.label}
            </option>
          ))}
        </select>
      </div>

      <div className="group-filter__row" role="group" aria-label="Other groups">
        {OTHER_GROUPS.map((group) => {
          const isSelected = group.id === value;
          return (
            <button
              key={group.id}
              type="button"
              className={
                isSelected
                  ? 'group-filter__button group-filter__button--selected'
                  : 'group-filter__button'
              }
              aria-pressed={isSelected}
              onClick={() => onChange(group.id)}
            >
              {group.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GroupFilter;
