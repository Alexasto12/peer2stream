'use client'

import React, { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical } from "react-icons/fa";
import styles from "./NotificationCard.module.css";
import Link from "next/link";

function NotificationCard({ notification, onDelete, style, selected, onSelect, dragHandleProps, isDragging }) {
  const msg = notification.message || '';
  let variant = styles.default;
  if (msg.includes("removed")) variant = styles.removed;
  else if (msg.includes("added")) variant = styles.added;
  let before = msg;
  let after = '';
  const idx = msg.indexOf(' has been ');
  if (idx !== -1) {
    before = msg.slice(0, idx);
    after = msg.slice(idx);
  }
  return (
    <div
      className={[
        styles.notificationCard,
        variant,
        isDragging ? styles.isDragging : ''
      ].join(' ')}
      style={style}
    >
      <div className={styles.notificationCardContent}>
        <span {...dragHandleProps} style={{ display: 'flex', alignItems: 'center' }}>
          <FaGripVertical style={{ cursor: "grab", opacity: 0.7, fontSize: "2.1rem" }} />
        </span>
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          style={{ accentColor: msg.includes("removed") ? "#e53935" : msg.includes("added") ? "#00e676" : "#1976d2", width: 22, height: 22 }}
        />
        <span>
          <span className={styles.notificationCardTitle}>{before}</span>
          <span className={styles.notificationCardAfter}>{after}</span>
        </span>
      </div>
      <button
        onClick={() => onDelete(notification._id)}
        className={styles.notificationCardButton}
        aria-label="Eliminar notificación"
        title="Eliminar"
      >
        ×
      </button>
    </div>
  );
}

function SortableNotification({ notification, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: notification._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <NotificationCard
        notification={notification}
        {...props}
        dragHandleProps={{ ...listeners, ...attributes }}
        isDragging={isDragging}
      />
    </div>
  );
}

export default function NotificationsPage({ setNotificationCount }) {
  const [notifications, setNotifications] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isLogged, setIsLogged] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setIsLogged(true);
          return res.json();
        } else {
          setIsLogged(false);
          return null;
        }
      })
      .then(data => {
        console.log(data)
        // Corregido: ahora toma el username correctamente del objeto devuelto y pone la primera letra en mayúscula
        if (data && data.user && data.user.username) {
          const username = data.user.username;
          setUsername(username.charAt(0).toUpperCase() + username.slice(1));
        }
      })
      .catch(() => setIsLogged(false));
  }, []);

  useEffect(() => {
    fetch("/api/user/notifications", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          const savedOrder = JSON.parse(localStorage.getItem("notificationOrder") || "null");
          if (savedOrder && Array.isArray(savedOrder)) {
            const ordered = [...data.notifications].sort((a, b) => {
              const ia = savedOrder.indexOf(a._id);
              const ib = savedOrder.indexOf(b._id);
              if (ia === -1 && ib === -1) return 0;
              if (ia === -1) return 1;
              if (ib === -1) return -1;
              return ia - ib;
            });
            setNotifications(ordered);
            setNotificationCount && setNotificationCount(ordered.length);
          } else {
            setNotifications(data.notifications);
            setNotificationCount && setNotificationCount(data.notifications.length);
          }
        }
      });
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(
        "notificationOrder",
        JSON.stringify(notifications.map(n => n._id))
      );
      setNotificationCount && setNotificationCount(notifications.length);
    } else {
      setNotificationCount && setNotificationCount(0);
    }
  }, [notifications]);

  const handleDelete = async (_id) => {
    setPendingDelete(_id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      await fetch("/api/user/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _id: pendingDelete }),
      });
      setNotifications((prev) => {
        const updated = prev.filter((n) => n._id !== pendingDelete);
        setNotificationCount && setNotificationCount(updated.length);
        window.dispatchEvent(new Event('notificationUpdate'));
        return updated;
      });
      setSelected((prev) => prev.filter((id) => id !== pendingDelete));
    }
    setShowConfirm(false);
    setPendingDelete(null);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selected.length > 0) {
      setPendingDelete([...selected]);
      setShowConfirm(true);
    }
  };

  const confirmDeleteSelected = async () => {
    if (Array.isArray(pendingDelete)) {
      for (const id of pendingDelete) {
        await fetch("/api/user/notifications", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ _id: id }),
        });
      }
      setNotifications((prev) => {
        const updated = prev.filter((n) => !pendingDelete.includes(n._id));
        setNotificationCount && setNotificationCount(updated.length);
        window.dispatchEvent(new Event('notificationUpdate'));
        return updated;
      });
      setSelected([]);
    }
    setShowConfirm(false);
    setPendingDelete(null);
  };

  // Drag and drop handlers
  function handleDragStart(event) {
    setActiveId(event.active.id);
  }
  function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = notifications.findIndex((n) => n._id === active.id);
      const newIndex = notifications.findIndex((n) => n._id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setNotifications((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  }

  if (isLogged === false) {
    return (
      <main className={styles.centeredMain}>
        <div className={styles.centeredBox}>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.centeredMsg}>You must log in to view your Notifications</p>
          <Link href="/login" className={styles.loginBtn}>Log in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.notificationsMain}>
      <div className={styles.notificationsHeaderBox}>
        {isLogged && (
          <h1 className={styles.notificationsHeaderTitle}><strong>{username}</strong> Notifications</h1>
        )}
        <p className={styles.notificationsHeaderDesc}>
          Here you&apos;ll see your important notifications and can easily manage them.
        </p>
      </div>
      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
        <div
          className={`${styles.notificationsScroll} ${styles.notificationsScrollCustom}`}
        >
          {notifications.length > 0 && (
            <div className={styles.notificationsToolbar}>
              <button
                onClick={() => {
                  if (selected.length === notifications.length) setSelected([]);
                  else setSelected(notifications.map(n => n._id));
                }}
                className={`${styles.notificationsBtn} ${selected.length === notifications.length ? styles.notificationsBtnSelectAll : styles.notificationsBtnSelect}`}
              >
                {selected.length === notifications.length ? "Deselect all" : "Select all"}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selected.length === 0}
                className={`${styles.notificationsBtn} ${selected.length === 0 ? styles.notificationsBtnDeleteDisabled : styles.notificationsBtnDelete}`}
              >
                Delete selected
              </button>
            </div>
          )}
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={notifications.map(n => n._id)}>
              {notifications.map((n) => (
                <SortableNotification
                  key={n._id}
                  notification={n}
                  onDelete={handleDelete}
                  selected={selected.includes(n._id)}
                  onSelect={() => handleSelect(n._id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          {notifications.length === 0 && (
            <div className={styles.notificationsEmpty}>
              You don&apos;t have any Notifications
            </div>
          )}
        </div>
      </div>
      {showConfirm && (
        <div className={styles.notificationsModalOverlay}>
          <div className={styles.notificationsModalBox}>
            <h2 className={styles.notificationsModalTitle}>
              ¿Surely you want to delete {Array.isArray(pendingDelete) ? `this ${pendingDelete.length} notifications` : 'this notification'}?
            </h2>
            <div className={styles.notificationsModalActions}>
              <button
                onClick={() => {
                  if (Array.isArray(pendingDelete)) confirmDeleteSelected();
                  else confirmDelete();
                }}
                className={styles.notificationsModalBtnDelete}
              >
                Yes, delete
              </button>
              <button
                onClick={() => { setShowConfirm(false); setPendingDelete(null); }}
                className={styles.notificationsModalBtnCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
