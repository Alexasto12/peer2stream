"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./Dashboard.module.css";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({ notifications: true });
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [securityMsg, setSecurityMsg] = useState("");
  const [userMsgType, setUserMsgType] = useState(null); // 'success' | 'error'
  const [settingsMsgType, setSettingsMsgType] = useState(null);
  const [securityMsgType, setSecurityMsgType] = useState(null);
  const [userMsgHide, setUserMsgHide] = useState(false);
  const [settingsMsgHide, setSettingsMsgHide] = useState(false);
  const [securityMsgHide, setSecurityMsgHide] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const usernameInputRef = useRef(null);
  const router = useRouter();

  // Orden de las cards (guardado en localStorage)
  const defaultOrder = ['user', 'preferences', 'security'];
  const [cardOrder, setCardOrder] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardCardOrder');
      if (saved) return JSON.parse(saved);
    }
    return defaultOrder;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardCardOrder', JSON.stringify(cardOrder));
    }
  }, [cardOrder]);

  // Estado para colapsar/expandir cada card
  const [collapsed, setCollapsed] = useState({ user: false, preferences: false, security: false });

  const handleCollapse = (id) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Drag and drop handlers
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // SortableCard component
  function SortableCard({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      cursor: 'default',
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
      width: '100%',
      height: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
    };
    return (
      <section ref={setNodeRef} style={style} {...attributes} className={styles.settingsSection}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <button
            type="button"
            className={styles.dragHandle}
            aria-label="Mover"
            tabIndex={0}
            {...listeners}
            style={{ marginRight: 8 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <circle cx="6" cy="6" r="2" fill="#7b2ff2"/>
              <circle cx="6" cy="12" r="2" fill="#7b2ff2"/>
              <circle cx="6" cy="18" r="2" fill="#7b2ff2"/>
              <circle cx="12" cy="6" r="2" fill="#7b2ff2"/>
              <circle cx="12" cy="12" r="2" fill="#7b2ff2"/>
              <circle cx="12" cy="18" r="2" fill="#7b2ff2"/>
              <circle cx="18" cy="6" r="2" fill="#7b2ff2"/>
              <circle cx="18" cy="12" r="2" fill="#7b2ff2"/>
              <circle cx="18" cy="18" r="2" fill="#7b2ff2"/>
            </svg>
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 38 }}>
            {children.title}
          </div>
          {children.collapseBtn}
        </div>
        {children.content}
      </section>
    );
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setError("No se pudo cargar el usuario");
        }
      } catch {
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
    }
  }, [user]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/user/settings/getSettings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || { notifications: true });
        }
      } catch {}
    }
    fetchSettings();
  }, []);

  const handleToggleNotifications = async () => {
    const newValue = !settings.notifications;
    setSettings((prev) => ({ ...prev, notifications: newValue }));
    setSaving(true);
    setSettingsMsg("");
    const res = await fetch("/api/user/settings/updateSettings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications: newValue }),
    });
    if (res.ok) {
      setSettingsMsg("Ajuste guardado");
      setSettingsMsgType("success");
    } else {
      setSettingsMsg("Error al guardar");
      setSettingsMsgType("error");
    }
    setTimeout(() => setSettingsMsgHide(true), 5000);
    setSaving(false);
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUserMsg("");
    setUserMsgType(null);
    setUserMsgHide(false);
    const body = {};
    if (username && username !== user.username) body.username = username;
    if (oldPassword && newPassword) {
      body.oldPassword = oldPassword;
      body.password = newPassword;
    }
    if (Object.keys(body).length === 0) {
      setUserMsg("No hay cambios para guardar");
      setUserMsgType("error");
      setTimeout(() => setUserMsgHide(true), 5000);
      setSaving(false);
      return;
    }
    const res = await fetch("/api/auth/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setUserMsg("Datos actualizados");
      setUserMsgType("success");
      setOldPassword("");
      setNewPassword("");
    } else {
      setUserMsg(data.error || "Error al actualizar");
      setUserMsgType("error");
    }
    setTimeout(() => setUserMsgHide(true), 5000);
    setSaving(false);
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSettingsMsg("");
    setSettingsMsgType(null);
    setSettingsMsgHide(false);
    const res = await fetch("/api/user/settings/updateSettings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prefered_lang: settings.prefered_lang,
        prefered_quality: settings.prefered_quality,
        notifications: settings.notifications,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSettingsMsg("Preferencias guardadas");
      setSettingsMsgType("success");
    } else {
      setSettingsMsg(data.error || "Error al guardar preferencias");
      setSettingsMsgType("error");
    }
    setTimeout(() => setSettingsMsgHide(true), 5000);
    setSaving(false);
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSecurityMsg("");
    setSecurityMsgType(null);
    setSecurityMsgHide(false);
    const body = {};
    if (oldPassword && newPassword) {
      body.oldPassword = oldPassword;
      body.password = newPassword;
    }
    if (Object.keys(body).length === 0) {
      setSecurityMsg("No hay cambios para guardar");
      setSecurityMsgType("error");
      setTimeout(() => setSecurityMsgHide(true), 5000);
      setSaving(false);
      return;
    }
    const res = await fetch("/api/auth/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setSecurityMsg("Contraseña actualizada");
      setSecurityMsgType("success");
      setOldPassword("");
      setNewPassword("");
    } else {
      setSecurityMsg(data.error || "Error al actualizar");
      setSecurityMsgType("error");
    }
    setTimeout(() => setSecurityMsgHide(true), 5000);
    setSaving(false);
  };

  if (loading) return <main className={styles.dashboardMain}><p>Cargando...</p></main>;
  if (error) return <main className={styles.dashboardMain}><p className={styles.errorMsg}>{error}</p></main>;
  if (!user) return null;

  return (
    <main className={styles.dashboardMain}>
      <div className={styles.dashboardCard}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
            <div className={styles.cardsGrid}>
              {cardOrder.map((id) => {
                const isCollapsed = collapsed[id];
                if (id === 'user') return (
                  <SortableCard id="user" key="user">
                    {{
                      title: <h2 className={styles.sectionTitle}>Usuario</h2>,
                      collapseBtn: (
                        <button
                          className={styles.collapseBtn}
                          type="button"
                          onClick={() => handleCollapse('user')}
                          aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
                          tabIndex={0}
                        >
                          {isCollapsed ? (
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M7 10l5 5 5-5z"/></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M7 14l5-5 5 5z"/></svg>
                          )}
                        </button>
                      ),
                      content: !isCollapsed && (
                        <>
                          <form className={styles.settingsForm} onSubmit={handleUserUpdate}>
                            <div className={styles.formGroup} style={{flexDirection: 'row', alignItems: 'center', gap: '0.5rem'}}>
                              <label htmlFor="username" style={{flex: '0 0 90px'}}>Usuario</label>
                              <input
                                id="username"
                                name="username"
                                type="text"
                                className={styles.input}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoComplete="username"
                                disabled={!editUsername}
                                style={{flex: 1}}
                                ref={usernameInputRef}
                              />
                              <button
                                type="button"
                                className={styles.editIconBtn}
                                onClick={() => {
                                  setEditUsername(e => {
                                    const next = !e;
                                    setTimeout(() => {
                                      if (!e && usernameInputRef.current) {
                                        usernameInputRef.current.focus();
                                        usernameInputRef.current.select();
                                      }
                                    }, 0);
                                    return next;
                                  });
                                }}
                                aria-label={editUsername ? "Cancelar edición" : "Editar usuario"}
                                tabIndex={0}
                                style={{marginLeft: 8, background: editUsername ? '#351effb9' : 'transparent'}}
                              >
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25Zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg>
                              </button>
                            </div>
                            <button className={styles.dashboardBtn} type="submit" disabled={saving}>
                              {saving ? "Guardando..." : "Guardar usuario"}
                            </button>
                            {userMsg && (
                              <div className={
                                `${styles.userMsg} ${userMsgType === 'success' ? styles['userMsg--success'] : ''} ${userMsgType === 'error' ? styles['userMsg--error'] : ''} ${userMsgHide ? styles['userMsg--hide'] : ''}`
                              }>
                                {userMsg}
                              </div>
                            )}
                          </form>
                        </>
                      )
                    }}
                  </SortableCard>
                );
                if (id === 'preferences') return (
                  <SortableCard id="preferences" key="preferences">
                    {{
                      title: <h2 className={styles.sectionTitle}>Preferencias de usuario</h2>,
                      collapseBtn: (
                        <button
                          className={styles.collapseBtn}
                          type="button"
                          onClick={() => handleCollapse('preferences')}
                          aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
                          tabIndex={0}
                        >
                          {isCollapsed ? (
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M7 10l5 5 5-5z"/></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M7 14l5-5 5 5z"/></svg>
                          )}
                        </button>
                      ),
                      content: !isCollapsed && (
                        <>
                          <form className={styles.settingsForm} onSubmit={handleSettingsUpdate}>
                            <div className={styles.formGroup}>
                              <label htmlFor="prefered_lang">Idioma preferido</label>
                              <select
                                id="prefered_lang"
                                name="prefered_lang"
                                className={styles.input}
                                value={settings.prefered_lang || "es"}
                                onChange={e => setSettings(s => ({ ...s, prefered_lang: e.target.value }))}
                              >
                                <option value="es">Español</option>
                                <option value="en">Inglés</option>
                              </select>
                            </div>
                            <div className={styles.formGroup}>
                              <label htmlFor="prefered_quality">Calidad preferida</label>
                              <select
                                id="prefered_quality"
                                name="prefered_quality"
                                className={styles.input}
                                value={settings.prefered_quality || "1080p"}
                                onChange={e => setSettings(s => ({ ...s, prefered_quality: e.target.value }))}
                              >
                                <option value="1080p">1080p</option>
                                <option value="720p">720p</option>
                                <option value="480p">480p</option>
                              </select>
                            </div>
                            <div className={styles.formGroup}>
                              <label htmlFor="notifications">Notificaciones</label>
                              <div className={styles.toggleWrapper}>
                                <input
                                  id="notifications"
                                  name="notifications"
                                  type="checkbox"
                                  checked={!!settings.notifications}
                                  onChange={handleToggleNotifications}
                                  className={styles.toggle}
                                />
                                <span className={styles.toggleLabel}>{settings.notifications ? "Activadas" : "Desactivadas"}</span>
                              </div>
                            </div>
                            <button className={styles.dashboardBtn} type="submit" disabled={saving}>
                              {saving ? "Guardando..." : "Guardar preferencias"}
                            </button>
                            {settingsMsg && (
                              <div className={
                                `${styles.userMsg} ${settingsMsgType === 'success' ? styles['userMsg--success'] : ''} ${settingsMsgType === 'error' ? styles['userMsg--error'] : ''} ${settingsMsgHide ? styles['userMsg--hide'] : ''}`
                              }>
                                {settingsMsg}
                              </div>
                            )}
                          </form>
                        </>
                      )
                    }}
                  </SortableCard>
                );
                if (id === 'security') return (
                  <SortableCard id="security" key="security">
                    {{
                      title: <h2 className={styles.sectionTitle}>Seguridad y cuenta</h2>,
                      collapseBtn: (
                        <button
                          className={styles.collapseBtn}
                          type="button"
                          onClick={() => handleCollapse('security')}
                          aria-label={isCollapsed ? 'Expandir' : 'Colapsar'}
                          tabIndex={0}
                        >
                          {isCollapsed ? (
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M7 10l5 5 5-5z"/></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M7 14l5-5 5 5z"/></svg>
                          )}
                        </button>
                      ),
                      content: !isCollapsed && (
                        <>
                          <form className={styles.settingsForm} onSubmit={handleSecurityUpdate}>
                            <div className={styles.formGroup}>
                              <label htmlFor="oldPassword">Contraseña actual</label>
                              <input
                                id="oldPassword"
                                name="oldPassword"
                                type="password"
                                className={styles.input}
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                autoComplete="current-password"
                              />
                            </div>
                            <div className={styles.formGroup}>
                              <label htmlFor="newPassword">Nueva contraseña</label>
                              <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                className={styles.input}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                              />
                            </div>
                            <button className={styles.dashboardBtn} type="submit" disabled={saving}>
                              {saving ? "Guardando..." : "Guardar cambios"}
                            </button>
                            {securityMsg && (
                              <div className={
                                `${styles.userMsg} ${securityMsgType === 'success' ? styles['userMsg--success'] : ''} ${securityMsgType === 'error' ? styles['userMsg--error'] : ''} ${securityMsgHide ? styles['userMsg--hide'] : ''}`
                              }>
                                {securityMsg}
                              </div>
                            )}
                          </form>
                        </>
                      )
                    }}
                  </SortableCard>
                );
                return null;
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </main>
  );
}
