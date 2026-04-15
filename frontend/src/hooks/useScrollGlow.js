import { useEffect } from 'react';

export default function useScrollGlow() {
  useEffect(() => {
    const update = (clientX, clientY) => {
      document.querySelectorAll('.glow-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        // position of cursor relative to card center
        const x = clientX - (rect.left + rect.width / 2);
        const y = clientY - (rect.top + rect.height / 2);
        // normalize to -1..1
        const nx = x / (rect.width / 2);
        const ny = y / (rect.height / 2);
        // max offset for the glow
        const ox = nx * 8;
        const oy = ny * 8;
        // intensity based on distance (closer = brighter)
        const dist = Math.sqrt(x * x + y * y);
        const maxDist = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 2;
        const intensity = Math.max(0.08, 1 - dist / maxDist);
        const alpha = (intensity * 0.18).toFixed(2);

        card.style.boxShadow = `inset ${ox}px ${oy}px 18px rgba(255,255,255,${alpha})`;
        card.style.borderColor = `rgba(255,255,255,${(intensity * 0.18).toFixed(2)})`;
      });
    };

    const onMouseMove = (e) => update(e.clientX, e.clientY);
    const onScroll = () => update(window.innerWidth / 2, window.innerHeight / 2);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
