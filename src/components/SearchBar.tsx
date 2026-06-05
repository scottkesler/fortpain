interface SearchBarProps {
  value: string;
  onChange: (nextValue: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="search"
        className="search-bar__input"
        value={value}
        onChange={(changeEvent) => onChange(changeEvent.target.value)}
        placeholder="Search players by name, position, hometown…"
        aria-label="Search players"
      />
    </div>
  );
}

export default SearchBar;
