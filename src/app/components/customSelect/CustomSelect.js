import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CustomSelect.module.css";

export default function CustomSelect({ options, value, onChange, label, id, className = "", renderOption, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options.find(opt => opt.value === value);

  return (
    <div className={`${styles.selectWrapper} ${className}`} ref={ref}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <button
        type="button"
        id={id}
        className={styles.selectButton}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected ? selected.label : placeholder || "Select..."}</span>
        <span className={styles.arrow} aria-hidden>▼</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            className={styles.optionsList}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            role="listbox"
            tabIndex={-1}
            style={{ maxHeight: options.length > 5 ? 220 : 'auto', overflowY: options.length > 5 ? 'auto' : 'visible' }}
          >
            {options.map(opt => (
              <li
                key={opt.value}
                className={styles.option + (opt.value === value ? ' ' + styles.selected : '')}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {renderOption ? renderOption(opt) : opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
