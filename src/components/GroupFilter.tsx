import { PERSONNEL_UNIT_ORDER, groupsInUnit } from '../groups';
import type { PersonnelUnit } from '../groups';

interface GroupFilterProps {
  value: string;
  onChange: (nextGroupId: string) => void;
}

const UNIT_LABELS: Record<PersonnelUnit, string> = {
  offense: 'Offense',
  defense: 'Defense',
  other: 'Other groups',
};

/**
 * Personnel groups as rows of toggle buttons — offense on top, then defense,
 * then everything else. Buttons rather than a dropdown so every group is
 * visible and one tap away.
 */
function GroupFilter({ value, onChange }: GroupFilterProps) {
  return (
    <div className="group-filter" role="group" aria-label="Personnel group">
      <span className="group-filter__label">Personnel group</span>

      {PERSONNEL_UNIT_ORDER.map((unit) => (
        <div
          key={unit}
          className="group-filter__row"
          role="group"
          aria-label={UNIT_LABELS[unit]}
        >
          {groupsInUnit(unit).map((group) => {
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
      ))}
    </div>
  );
}

export default GroupFilter;
