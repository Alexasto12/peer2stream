import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./RegisterModal.module.css";

export default function RegisterModal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
