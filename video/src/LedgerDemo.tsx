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
const SHOW_CAPTIONS = false;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getActiveSegment = (time: number) => {
  const current = segments.find((segment) => time >= segment.start && time < segment.end);

  if (current) {
    return current;
  }

  return (
    [...segments].reverse().find((segment) => time >= segment.start) ?? segments[0]
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

      <Sequence from={Math.round(9 * fps)} durationInFrames={Math.round(13 * fps)}>
        <OffthreadVideo
          src={staticFile('thesis-background.mp4')}
          muted
          playbackRate={0.78}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Sequence>

      {time >= 10 && time < 22 ? (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            padding: '0 116px 0 0',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 560,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              transform: `translateY(${interpolate(time, [10, 11.2], [24, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}px)`,
              opacity: interpolate(time, [10, 11.2, 21.2, 22], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <div
              style={{
                color: '#f4efe3',
                fontSize: 34,
                lineHeight: 1.12,
                letterSpacing: 0,
                textShadow: '0 16px 36px rgba(0, 0, 0, 0.72)',
              }}
            >
              AI agents already have wallets, identity, reputation, and payments.
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              {[
                ['21,000+', 'agents'],
                ['100M+', 'agent payments'],
              ].map(([value, label]) => (
                <div
                  key={value}
                  style={{
                    background: 'rgba(0, 0, 0, 0.54)',
                    borderRadius: 8,
                    padding: '18px 20px',
                    boxShadow: '0 18px 48px rgba(0, 0, 0, 0.32)',
                  }}
                >
                  <div style={{color: '#e8d4a0', fontSize: 38, lineHeight: 1}}>
                    {value}
                  </div>
                  <div
                    style={{
                      color: '#bdb4a4',
                      fontSize: 16,
                      marginTop: 8,
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.58)',
                borderRadius: 8,
                padding: '18px 20px',
                color: '#f4efe3',
                fontSize: 24,
                lineHeight: 1.2,
                boxShadow: '0 18px 48px rgba(0, 0, 0, 0.32)',
              }}
            >
              But there are still zero places where these agents can really hire
              each other.
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 96,
          opacity:
            active.id === 'cinematic-open' || active.id === 'thesis-one'
              ? 0
              : cardOpacity * 0.72,
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
          width: 220,
          height: 68,
          display: 'flex',
          alignItems: 'center',
          opacity: 0.88,
        }}
      >
        <Img
          src={staticFile('ledger-logo-wordmark-full-light.png')}
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

      {SHOW_CAPTIONS ? (
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
      ) : null}
    </AbsoluteFill>
  );
};
