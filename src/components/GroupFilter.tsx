import { PERSONNEL_GROUPS } from '../groups';

interface GroupFilterProps {
  value: string;
  onChange: (nextGroupId: string) => void;
}

function GroupFilter({ value, onChange }: GroupFilterProps) {
  return (
    <div className="group-filter">
      <label className="group-filter__label" htmlFor="group-filter-select">
        Personnel group
      </label>
      <select
        id="group-filter-select"
        className="group-filter__select"
        value={value}
        onChange={(changeEvent) => onChange(changeEvent.target.value)}
      >
        {PERSONNEL_GROUPS.map((group) => (
          <option key={group.id} value={group.id}>
            {group.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default GroupFilter;
