"use client";

import { useEffect, useRef } from "react";

const LAUNCH_DURATION_MS = 3500; // 持續發射煙火的時間
const LAUNCH_INTERVAL_MS = 280;
const GRAVITY = 0.06;
const FRICTION = 0.975;

type Rocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  hue: number;
};

type Particle = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  hue: number;
  size: number;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * 全螢幕煙火特效。每當 trigger 改變（且大於 0）就放一輪煙火。
 * canvas 不攔截滑鼠事件，放完後自動清空。
 */
export default function Fireworks({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (trigger <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    const startedAt = performance.now();
    let lastLaunch = -Infinity;
    let lastFrame = startedAt;
    let frameId = 0;

    function launch() {
      rockets.push({
        x: random(width * 0.12, width * 0.88),
        y: height,
        vx: random(-1.2, 1.2),
        vy: random(-15, -11),
        targetY: random(height * 0.12, height * 0.45),
        hue: random(0, 360),
      });
    }

    function explode(rocket: Rocket) {
      const count = Math.round(random(70, 110));
      // 一半的煙火用單色，一半用彩色，看起來比較有變化
      const multicolor = Math.random() < 0.5;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + random(-0.05, 0.05);
        const speed = random(2, 7);
        particles.push({
          x: rocket.x,
          y: rocket.y,
          px: rocket.x,
          py: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: random(0.011, 0.02),
          hue: multicolor ? random(0, 360) : rocket.hue + random(-15, 15),
          size: random(1.5, 2.8),
        });
      }
    }

    function frame(now: number) {
      // 以 60fps 為基準換算，避免高更新率螢幕上動畫變快
      const step = Math.min((now - lastFrame) / 16.67, 3);
      lastFrame = now;

      const launching = now - startedAt < LAUNCH_DURATION_MS;
      if (launching && now - lastLaunch > LAUNCH_INTERVAL_MS) {
        launch();
        if (Math.random() < 0.35) launch();
        lastLaunch = now;
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        const prevX = r.x;
        const prevY = r.y;
        r.x += r.vx * step;
        r.y += r.vy * step;
        r.vy += GRAVITY * 0.6 * step;

        ctx!.strokeStyle = `hsla(${r.hue}, 100%, 75%, 0.9)`;
        ctx!.lineWidth = 2.5;
        ctx!.beginPath();
        ctx!.moveTo(prevX, prevY + 12);
        ctx!.lineTo(r.x, r.y);
        ctx!.stroke();

        if (r.y <= r.targetY || r.vy >= 0) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.px = p.x;
        p.py = p.y;
        p.vx *= Math.pow(FRICTION, step);
        p.vy = p.vy * Math.pow(FRICTION, step) + GRAVITY * step;
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.alpha -= p.decay * step;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx!.strokeStyle = `hsla(${p.hue}, 100%, 62%, ${p.alpha})`;
        ctx!.lineWidth = p.size;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(p.px - p.vx * 2, p.py - p.vy * 2);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();
      }

      ctx!.globalCompositeOperation = "source-over";

      if (launching || rockets.length > 0 || particles.length > 0) {
        frameId = requestAnimationFrame(frame);
      } else {
        ctx!.clearRect(0, 0, width, height);
      }
    }

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
