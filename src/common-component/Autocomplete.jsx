import { useEffect, useRef, useState } from "react";
import { LOCATIONS_COUNTRY } from "../utility/consts";

export default function Autocomplete({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);

  const matches = LOCATIONS_COUNTRY.filter((name) => {
    const unused = !value.includes(name);
    const text = query.trim().toLowerCase();
    return unused && (!text || name.toLowerCase().includes(text));
  });

  useEffect(() => {
    function handleClick(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addLocation(name) {
    if (!value.includes(name)) {
      onChange([...value, name]);
    }
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }

  function removeLocation(name) {
    onChange(value.filter((item) => item !== name));
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(matches.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (matches[activeIndex]) {
        addLocation(matches[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Backspace" && !query && value.length) {
      removeLocation(value[value.length - 1]);
    }
  }

  return (
    <div className="autocomplete" ref={wrapRef}>
      <div className="autocomplete-box" onClick={() => setOpen(true)}>
        {value.map((name) => (
          <span className="tag" key={name}>
            {name}
            <button type="button" onClick={() => removeLocation(name)} aria-label={`Remove ${name}`}>
              ×
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length ? "Add another location..." : "Search country or city..."}
        />
      </div>
      {open ? (
        <ul className="autocomplete-list">
          {matches.length === 0 ? (
            <li className="empty">No matching location</li>
          ) : (
            matches.map((name, index) => (
              <li key={name}>
                <button
                  type="button"
                  className={index === activeIndex ? "active" : ""}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    addLocation(name);
                  }}
                >
                  {name}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
