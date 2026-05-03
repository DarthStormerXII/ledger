import type {Caption} from '@remotion/captions';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import captionsData from './captions.json';
import {segments} from './segments';

const captions = captionsData satisfies Caption[];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getActiveSegment = (time: number) => {
  return (
    segments.find((segment) => time >= segment.start && time < segment.end) ??
    segments[segments.length - 1]
  );
};

const getActiveCaption = (time: number) => {
  const ms = time * 1000;
  return (
    captions.find((caption) => ms >= caption.startMs && ms < caption.endMs) ??
    null
  );
};

export const LedgerDemo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const active = getActiveSegment(time);
  const activeCaption = getActiveCaption(time);
  const segmentProgress = Math.max(
    0,
    Math.min(1, (time - active.start) / Math.max(0.01, active.end - active.start)),
  );
  const cardOpacity = interpolate(segmentProgress, [0, 0.08, 0.92, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        color: '#f5f0e6',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Audio src={staticFile('audio-narration-with-pause.m4a')} />

      <Sequence durationInFrames={Math.round(9 * fps)}>
        <OffthreadVideo
          src={staticFile('cinematic-open.mp4')}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Sequence>

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 96,
          opacity: active.id === 'cinematic-open' ? 0 : cardOpacity * 0.72,
        }}
      >
        <div
          style={{
            maxWidth: 980,
            textAlign: 'center',
            color: '#746f66',
            letterSpacing: 0,
            fontSize: 30,
            lineHeight: 1.35,
          }}
        >
          <div
            style={{
              color: '#a99b78',
              fontSize: 18,
              textTransform: 'uppercase',
              marginBottom: 22,
            }}
          >
            Placeholder Visual
          </div>
          {active.visual}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 44,
          width: 176,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          opacity: 0.88,
        }}
      >
        <Img
          src={staticFile('ledger-logo-horizontal.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'left center',
            filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.55))',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 44,
          top: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 7,
          color: '#a9a39a',
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
        }}
      >
        <div
          style={{
            color: '#e8d4a0',
            fontSize: 18,
            lineHeight: 1.15,
            maxWidth: 360,
            textShadow: '0 10px 24px rgba(0, 0, 0, 0.7)',
          }}
        >
          {active.title}
        </div>
        <div
          style={{
            color: '#8d887f',
            fontSize: 17,
            lineHeight: 1,
            textShadow: '0 10px 24px rgba(0, 0, 0, 0.7)',
          }}
        >
          {formatTime(time)}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 44,
          transform: 'translateX(-50%)',
          width: 'min(1180px, 82%)',
          opacity: cardOpacity,
          padding: '12px 22px',
          borderRadius: 8,
          background: 'rgba(0, 0, 0, 0.62)',
          boxShadow: '0 18px 60px rgba(0, 0, 0, 0.38)',
        }}
      >
        <div
          style={{
            color: '#f4efe3',
            textAlign: 'center',
            fontSize: 23,
            lineHeight: 1.32,
            letterSpacing: 0,
            textWrap: 'balance',
          }}
        >
          {activeCaption?.text ?? ''}
        </div>
      </div>
    </AbsoluteFill>
  );
};
