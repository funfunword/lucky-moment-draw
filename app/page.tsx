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
  const activeProgress = completed ? 0 : results[activeRound].length;
  const activeTarget = completed ? 0 : ROUND_COUNTS[activeRound];

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

  return (
    <main className="app-shell" id="top">
      <div className="sunburst" aria-hidden="true" />
      <div className="festive-pattern" aria-hidden="true" />
      <div className="confetti confetti-left" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>
      <div className="confetti confetti-right" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="鸿运抽奖台首页">
          <span className="brand-mark">鸿</span>
          <span className="brand-copy">
            <strong>鸿运抽奖台</strong>
            <small>LUCKY MOMENT</small>
          </span>
        </a>
        <div className="event-title">
          <span aria-hidden="true">✦</span>
          <p>2026 欢乐相聚 · 好运加倍</p>
          <span aria-hidden="true">✦</span>
        </div>
        <button className="reset-button" onClick={reset} disabled={winners.length === 0 || isRevealing}>
          <span aria-hidden="true">↻</span> 重新开始
        </button>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="lantern lantern-left" aria-hidden="true"><i /><span>喜</span><i /></div>
        <div className="lantern lantern-right" aria-hidden="true"><i /><span>乐</span><i /></div>

        <div className="hero-kicker"><span>福</span> LUCKY MOMENT 2026 <span>喜</span></div>
        <h1 id="hero-title"><span>鸿运当头</span><b>幸运开席</b></h1>
        <p className="hero-copy">
          {completed
            ? "十轮好运圆满揭晓 · 感谢每一位欢聚的朋友"
            : `第 ${activeRound + 1} 轮 · 本轮抽取 ${activeTarget} 位幸运嘉宾 · 每次点击揭晓 1 个号码`}
        </p>

        <div className={`number-stage ${isRevealing ? "is-revealing" : ""} ${currentNumber ? "has-winner" : ""}`}>
          <div className="stage-bulbs" aria-hidden="true" />
          <span className="cloud cloud-one" aria-hidden="true">☁</span>
          <span className="cloud cloud-two" aria-hidden="true">☁</span>
          <span className="stage-badge">{completed ? "圆满收官" : `第 ${activeRound + 1} 轮`}</span>
          <div className="number-medallion">
            <span className="number-label">LUCKY NUMBER</span>
            <strong aria-live="polite">{displayNumber}</strong>
            <span className="blessing">
              {isRevealing ? "好运正在奔来" : currentNumber ? "恭喜！好运到" : "准备接好运"}
            </span>
          </div>
          {currentNumber && !isRevealing && (
            <div className="celebration" aria-hidden="true">
              <span>✦</span><span>彩</span><span>✦</span><span>喜</span><span>✦</span>
            </div>
          )}
        </div>

        <button
          className="draw-button"
          onClick={() => !completed && draw(activeRound)}
          disabled={isRevealing || completed}
        >
          <span className="button-glow" aria-hidden="true" />
          <span className="gift-icon" aria-hidden="true">✦</span>
          <span>{completed ? "好运圆满送达" : isRevealing ? "好运滚滚来…" : currentNumber ? "继续抽好运" : "开启第一份好运"}</span>
          {!completed && <small>{activeProgress + 1} / {activeTarget}</small>}
        </button>
        <p className="draw-tip">每个号码只会中奖一次 · 共 10 轮 51 个幸运席位</p>
      </section>

      <section className="rounds-panel" aria-label="抽奖轮次">
        <div className="panel-ribbon"><span>好运排期</span></div>
        <div className="section-heading">
          <div><span>ROUND SCHEDULE</span><h2>十轮好运接力</h2></div>
          <p>已经送出 <strong>{winners.length}</strong> / {TOTAL} 份好运</p>
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
                <span className="round-status">{done ? "✓ 好运送达" : active ? "点击抽取" : locked ? "即将开席" : "圆满完成"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="winners-panel">
        <div className="panel-ribbon"><span>幸运名单</span></div>
        <div className="section-heading">
          <div><span>LUCKY GUESTS</span><h2>好运高光榜</h2></div>
          <p>掌声送给每一位幸运嘉宾</p>
        </div>
        {winners.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">囍</span>
            <p>红红火火，好运就位</p>
            <small>点击上方按钮，揭晓第一位幸运嘉宾</small>
          </div>
        ) : (
          <div className="winner-groups">
            {results.map((items, index) => items.length > 0 && (
              <div className="winner-row" key={index}>
                <div className="winner-round"><span>ROUND</span><strong>{String(index + 1).padStart(2, "0")}</strong></div>
                <div className="winner-numbers">
                  {items.map((number) => (
                    <span className={number === currentNumber ? "latest" : ""} key={number}>
                      {String(number).padStart(2, "0")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer><span>✦</span><p>今晚尽兴 · 好事发生 · 好运常在</p><span>✦</span></footer>
    </main>
  );
}
