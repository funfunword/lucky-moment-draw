"use client";

import { useMemo, useState } from "react";

const ROUND_COUNTS = [8, 8, 6, 8, 7, 6, 2, 2, 2, 2];
const TOTAL = 51;

function secureIndex(max: number) {
  if (typeof crypto === "undefined") return Math.floor(Math.random() * max);
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

export default function Home() {
  const [results, setResults] = useState<number[][]>(() => ROUND_COUNTS.map(() => []));
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [displayNumber, setDisplayNumber] = useState("--");

  const winners = useMemo(() => results.flat(), [results]);
  const activeRound = results.findIndex((items, index) => items.length < ROUND_COUNTS[index]);
  const completed = activeRound === -1;

  const draw = (roundIndex: number) => {
    if (isRevealing || completed || roundIndex !== activeRound) return;
    const available = Array.from({ length: TOTAL }, (_, index) => index + 1).filter(
      (number) => !winners.includes(number),
    );
    if (!available.length) return;

    setIsRevealing(true);
    let ticks = 0;
    const timer = window.setInterval(() => {
      const candidate = available[secureIndex(available.length)];
      setDisplayNumber(String(candidate).padStart(2, "0"));
      ticks += 1;
      if (ticks >= 12) {
        window.clearInterval(timer);
        const winner = available[secureIndex(available.length)];
        setDisplayNumber(String(winner).padStart(2, "0"));
        setCurrentNumber(winner);
        setResults((previous) =>
          previous.map((items, index) => (index === roundIndex ? [...items, winner] : items)),
        );
        setIsRevealing(false);
      }
    }, 55);
  };

  const reset = () => {
    if (isRevealing) return;
    if (!window.confirm("确定要清空全部中奖号码，重新开始抽奖吗？")) return;
    setResults(ROUND_COUNTS.map(() => []));
    setCurrentNumber(null);
    setDisplayNumber("--");
  };

  const activeProgress = completed ? 0 : results[activeRound].length;
  const activeTarget = completed ? 0 : ROUND_COUNTS[activeRound];

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="幸运时刻抽奖台首页">
          <span className="brand-mark">幸</span>
          <span>
            <strong>幸运时刻</strong>
            <small>LUCKY MOMENT</small>
          </span>
        </a>
        <div className="event-title">
          <span className="spark">✦</span>
          <p>年度幸运抽奖</p>
          <span>2026</span>
        </div>
        <button className="reset-button" onClick={reset} disabled={winners.length === 0 || isRevealing}>
          <span aria-hidden="true">↻</span> 重新开始
        </button>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> GOOD LUCK <span /></div>
        <h1>{completed ? "幸运圆满收官" : `第 ${activeRound + 1} 轮抽奖`}</h1>
        <p className="hero-copy">
          {completed
            ? "51 份幸运已全部送出，感谢每一次相遇"
            : `本轮将产生 ${activeTarget} 位幸运得主 · 每次点击揭晓一个号码`}
        </p>

        <div className={`number-stage ${isRevealing ? "is-revealing" : ""} ${currentNumber ? "has-winner" : ""}`}>
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <div className="number-halo">
            <span className="label">LUCKY NUMBER</span>
            <strong>{displayNumber}</strong>
            <span className="blessing">{isRevealing ? "幸运正在降临…" : currentNumber ? "恭喜中奖" : "等待揭晓"}</span>
          </div>
          {currentNumber && !isRevealing && <div className="celebration" aria-hidden="true">✦　·　✦</div>}
        </div>

        <button
          className="draw-button"
          onClick={() => !completed && draw(activeRound)}
          disabled={isRevealing || completed}
        >
          <span className="button-shine" />
          <span className="gift-icon" aria-hidden="true">✦</span>
          {completed ? "抽奖已完成" : isRevealing ? "正在抽取…" : currentNumber ? "继续抽取" : "开启幸运"}
          {!completed && <small>{activeProgress + 1} / {activeTarget}</small>}
        </button>
      </section>

      <section className="rounds-panel" aria-label="抽奖轮次">
        <div className="section-heading">
          <div><span>ROUND SCHEDULE</span><h2>抽奖进度</h2></div>
          <p>已揭晓 <strong>{winners.length}</strong> / {TOTAL} 个幸运号码</p>
        </div>
        <div className="round-grid">
          {ROUND_COUNTS.map((target, index) => {
            const done = results[index].length === target;
            const active = index === activeRound;
            const locked = index > activeRound && activeRound !== -1;
            return (
              <button
                key={index}
                className={`round-card ${done ? "done" : ""} ${active ? "active" : ""}`}
                onClick={() => draw(index)}
                disabled={!active || isRevealing}
                aria-label={`第${index + 1}轮，已抽取${results[index].length}名，共${target}名`}
              >
                <span className="round-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="round-name">第 {index + 1} 轮</span>
                <span className="round-count">{results[index].length}<small> / {target} 名</small></span>
                <span className="progress-track"><i style={{ width: `${(results[index].length / target) * 100}%` }} /></span>
                <span className="round-status">{done ? "✓ 已完成" : active ? "点击抽取" : locked ? "待开启" : "已完成"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="winners-panel">
        <div className="section-heading">
          <div><span>WINNERS</span><h2>幸运名单</h2></div>
          <p>每个号码仅会出现一次</p>
        </div>
        {winners.length === 0 ? (
          <div className="empty-state"><span>✦</span><p>幸运席位虚位以待</p><small>点击「开启幸运」揭晓第一位幸运得主</small></div>
        ) : (
          <div className="winner-groups">
            {results.map((items, index) => items.length > 0 && (
              <div className="winner-row" key={index}>
                <div className="winner-round"><span>ROUND</span><strong>{String(index + 1).padStart(2, "0")}</strong></div>
                <div className="winner-numbers">
                  {items.map((number) => <span className={number === currentNumber ? "latest" : ""} key={number}>{String(number).padStart(2, "0")}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer><span>✦</span><p>愿每一份期待，都与幸运不期而遇</p><span>✦</span></footer>
    </main>
  );
}
