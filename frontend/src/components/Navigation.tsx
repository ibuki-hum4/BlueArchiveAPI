'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowUpRight, BookOpen, Code2, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteName } from '@/lib/site';

const INTERNAL_LINKS = [
  { href: '/', label: '生徒一覧', shortLabel: '生徒', icon: Users },
  { href: '/overview', label: '概要', shortLabel: '概要', icon: BookOpen },
  { href: '/api-docs', label: 'API使用方法', shortLabel: 'API', icon: Code2 },
  { href: '/terms', label: '利用規約', shortLabel: '規約', icon: FileText },
];

const STATIC_PATHS = new Set(INTERNAL_LINKS.map(({ href }) => href));

// ---- スマホ用タブバーのピル（数値だけで挙動を調整できるようにまとめている） ----

/** 指の速度の平滑化係数（EMA）。0〜1。大きいほど最新の動きに敏感、小さいほど伸びが滑らかになる */
const VELOCITY_SMOOTHING = 0.3;
/** 指を止めている間の速度の減衰率（60fps換算の1フレームあたり）。小さいほど早く縮む */
const VELOCITY_DECAY_PER_FRAME = 0.8;
/** 指が止まったとみなすまでの時間（ms）。これを過ぎると速度の減衰を始める */
const IDLE_BEFORE_DECAY_MS = 32;
/** 速度 1px/ms あたりの伸び量（scaleX に加算される） */
const STRETCH_PER_VELOCITY = 0.45;
/** 伸びの上限（scaleX） */
const MAX_STRETCH = 1.6;
/** 伸びる向きの切り替わりの鋭さ（px/ms）。この速さで伸縮の基準点がほぼ進行方向と逆の端に寄る */
const ORIGIN_VELOCITY_REF = 0.35;
/** これ未満の横移動（px）はタップとみなし、Link の通常の遷移に任せる */
const DRAG_THRESHOLD_PX = 6;
/** 指を離したときにタブへ着地するバネ。stiffness を上げると速く、damping を下げると弾む */
const SNAP_SPRING = { stiffness: 520, damping: 40, mass: 1 };
/** 伸縮のバネ。追従中の伸びと、着地時に 1 へ戻る動きの両方に使う */
const STRETCH_SPRING = { stiffness: 700, damping: 45, mass: 1 };

export default function Navigation() {
  const pathname = usePathname();

  // 生徒詳細（/{id}）は「生徒一覧」の配下として扱う
  const isActive = (href: string) =>
    pathname === href || (href === '/' && !!pathname && !STATIC_PATHS.has(pathname));

  return (
    <>
      {/* 上部に浮かぶガラスのバー */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <nav
          aria-label="メインナビゲーション"
          className="glass mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full pl-5 pr-2"
        >
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-gray-900">
            {siteName}
          </Link>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 md:flex">
              {INTERNAL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-sm transition-colors',
                    isActive(href)
                      ? 'bg-gray-900/[0.06] font-medium text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
            {/* /api は Next のページではなく Go API へ転送されるため Link ではなく a を使う */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api"
              className="inline-flex items-center gap-0.5 rounded-full bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              API
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      {/* スマホ: 画面下に浮かぶガラスのタブバー */}
      <MobileTabBar activeIndex={INTERNAL_LINKS.findIndex(({ href }) => isActive(href))} />
    </>
  );
}

type TabGesture = {
  pointerId: number;
  /** 押した時点のタブ列の位置。ジェスチャー中は再計測しない */
  rect: DOMRect;
  startX: number;
  lastX: number;
  /** 最後に指が動いた時刻（PointerEvent.timeStamp と同じ performance.now 基準） */
  lastTime: number;
  /** 平滑化した指の速度（px/ms、右向きが正） */
  velocity: number;
  dragging: boolean;
};

function MobileTabBar({ activeIndex }: { activeIndex: number }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const tabCount = INTERNAL_LINKS.length;

  // ピルの位置は「何番目のタブか」の小数で持ち、translateX の割合に変換する。
  // ピルの幅はタブ1個分なので 100% = タブ1個分の移動になり、幅の計測なしで SSR 時点から現在地に置ける
  const position = useSpring(activeIndex, SNAP_SPRING);
  const pillX = useTransform(position, (p) => `${p * 100}%`);
  const stretch = useSpring(1, STRETCH_SPRING);
  const stretchOrigin = useMotionValue(0.5);

  // 追従中に指の下にあるタブ。文字色の強調だけに使い、タブが変わったときだけ再描画される
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const gestureRef = useRef<TabGesture | null>(null);
  const suppressClickRef = useRef(false);

  // タップや戻る操作でページが変わったら、ピルをそのタブへ移動する
  useEffect(() => {
    if (!gestureRef.current) {
      position.set(activeIndex);
    }
  }, [activeIndex, position]);

  // 速度から伸びを計算する。指が止まっても伸びが残らないよう、毎フレーム速度を減衰させる
  useAnimationFrame((_, delta) => {
    const gesture = gestureRef.current;
    if (!gesture?.dragging) return;

    if (performance.now() - gesture.lastTime > IDLE_BEFORE_DECAY_MS) {
      gesture.velocity *= Math.pow(VELOCITY_DECAY_PER_FRAME, delta / (1000 / 60));
    }
    const speed = Math.abs(gesture.velocity);
    stretch.set(reduceMotion ? 1 : Math.min(1 + speed * STRETCH_PER_VELOCITY, MAX_STRETCH));
    // 右へ動くほど基準点が左端（0）に寄り、進行方向側へ伸びる
    stretchOrigin.set(0.5 - 0.5 * Math.tanh(gesture.velocity / ORIGIN_VELOCITY_REF));
  });

  const positionAt = (gesture: TabGesture, clientX: number) => {
    const tabWidth = gesture.rect.width / tabCount;
    const p = (clientX - gesture.rect.left) / tabWidth - 0.5;
    return Math.min(Math.max(p, 0), tabCount - 1);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch' || gestureRef.current) return;
    suppressClickRef.current = false;
    gestureRef.current = {
      pointerId: e.pointerId,
      rect: e.currentTarget.getBoundingClientRect(),
      startX: e.clientX,
      lastX: e.clientX,
      lastTime: e.timeStamp,
      velocity: 0,
      dragging: false,
    };
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || e.pointerId !== gesture.pointerId) return;

    if (!gesture.dragging) {
      if (Math.abs(e.clientX - gesture.startX) < DRAG_THRESHOLD_PX) return;
      gesture.dragging = true;
      // タブバーの外まで指が出ても追従を続ける
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    const dt = e.timeStamp - gesture.lastTime;
    if (dt > 0) {
      const instantVelocity = (e.clientX - gesture.lastX) / dt;
      gesture.velocity += VELOCITY_SMOOTHING * (instantVelocity - gesture.velocity);
    }
    gesture.lastX = e.clientX;
    gesture.lastTime = e.timeStamp;

    // 追従中はバネを通さず指の位置へ直接置く
    const p = positionAt(gesture, e.clientX);
    position.jump(p);
    setPreviewIndex(Math.round(p));
  };

  const endGesture = (e: PointerEvent<HTMLDivElement>, commit: boolean) => {
    const gesture = gestureRef.current;
    if (!gesture || e.pointerId !== gesture.pointerId) return;
    gestureRef.current = null;
    setPreviewIndex(null);
    stretch.set(1);

    // 動かさずに離した場合はタップなので、Link の遷移に任せる
    if (!gesture.dragging) return;

    // ドラッグ後に発生する click で二重に遷移しないようにする
    suppressClickRef.current = true;
    const target = commit ? Math.round(position.get()) : activeIndex;
    if (reduceMotion) {
      position.jump(target);
    } else {
      position.set(target);
    }
    if (target !== activeIndex) {
      router.push(INTERNAL_LINKS[target].href);
    }
  };

  const highlightIndex = previewIndex ?? activeIndex;

  return (
    <nav
      aria-label="モバイルナビゲーション"
      className="glass fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50 rounded-full p-1.5 md:hidden"
    >
      {/* touch-action: none でスクロールや戻るジェスチャーに奪われないようにし、長押しのリンクプレビューと選択も止める */}
      <div
        className="relative touch-none select-none [-webkit-touch-callout:none]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => endGesture(e, true)}
        onPointerCancel={(e) => endGesture(e, false)}
        onClickCapture={(e) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gray-900/[0.06]"
          style={{ width: `${100 / tabCount}%`, x: pillX, scaleX: stretch, originX: stretchOrigin }}
        />
        <ul className="relative grid grid-cols-4">
          {INTERNAL_LINKS.map(({ href, shortLabel, icon: Icon }, index) => {
            const highlighted = index === highlightIndex;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={index === activeIndex ? 'page' : undefined}
                  draggable={false}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition-colors duration-200',
                    highlighted ? 'text-ba-blue-600' : 'text-gray-500'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={highlighted ? 2.25 : 1.75} aria-hidden="true" />
                  {shortLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
