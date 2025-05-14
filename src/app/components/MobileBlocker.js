'use client';
import { useEffect, useState } from "react";

export default function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      // Detecta dispositivos móviles y tablets o pantallas pequeñas
      const isMob = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    (window.innerWidth < 800 && window.innerHeight < 900);
      setIsMobile(isMob);
      
      if (isMob) {
        document.body.classList.add('mobile-blocked');
      } else {
        document.body.classList.remove('mobile-blocked');
      }
    };
    
    // Comprueba al cargar y cuando cambia el tamaño
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.classList.remove('mobile-blocked');
    };
  }, []);

  if (!isMobile) return null;
  
  return (
    <div className="mobile-blocker" style={{
      position: 'fixed',
      zIndex: 99999,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #181a2a 0%, #23244a 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2.5rem 1.2rem',
      fontSize: '1.18rem',
      fontFamily: 'inherit',
      backdropFilter: 'blur(2px)'
    }}>      <img src="/favicon.ico" alt="Peer2Stream logo" style={{ 
        width: 96, 
        height: 96, 
        marginBottom: 24, 
        borderRadius: 16,
        boxShadow: '0 2px 16px #000a' 
      }} />
      <h1 style={{ 
        fontSize: '2.1rem', 
        fontWeight: 700, 
        marginBottom: '1.1rem', 
        color: '#a78bfa',
        textShadow: '0 2px 12px #000a' 
      }}>
        Peer2Stream is not available on mobile
      </h1>
      <p style={{ 
        maxWidth: 420, 
        margin: '0 auto', 
        color: '#e0e0e0', 
        fontSize: '1.08rem',
        lineHeight: 1.6
      }}>
        This application is designed exclusively for desktop browsers.<br />
        Mobile devices and tablets are not supported.<br /><br />
        <b>Please access Peer2Stream from a desktop or laptop computer for the best experience.</b>
      </p>
    </div>
  );
}
