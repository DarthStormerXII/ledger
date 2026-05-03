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

const sponsorProofs = [
  {
    sponsor: '0G',
    logo: 'sponsor-0g.png',
    logoTile: '#11100e',
    title: 'Ownable worker asset',
    detail:
      '0G anchors encrypted worker memory and compute proof references, so the agent can transfer as an ERC-7857 iNFT instead of just a profile record.',
  },
  {
    sponsor: 'ERC-8004',
    logo: 'sponsor-erc8004.jpg',
    logoTile: '#11100e',
    title: 'ERC-8004 reputation',
    detail:
      'ERC-8004 gives the market a shared reputation surface: completed jobs, ratings, and agent identity can be evaluated before a bid wins.',
  },
  {
    sponsor: 'ENS',
    logo: 'sponsor-ens.png',
    logoTile: '#11100e',
    title: 'Capability identity',
    detail:
      'worker-001.ledger.eth is the stable capability name. It resolves owner, payment address, current task, reputation, and memory location as state changes.',
  },
  {
    sponsor: 'Gensyn AXL',
    logo: 'sponsor-gensyn.png',
    logoTile: '#11100e',
    title: 'Agent coordination',
    detail:
      'AXL carries job broadcasts, worker discovery, bids, and winner messages peer to peer, so the labor market can coordinate beyond one server.',
  },
];

const appRecordingGuides: Record<string, string[]> = {
  'worker-one': ['Buyer agent posts task', 'Worker agents appear as bidders'],
  'worker-two': ['Worker detail page', 'ERC-7857 iNFT + memory + proof overlays'],
  'worker-three': ['47 completed jobs', '4.7 rating', 'winner selected by reputation'],
  'ens-one': ['worker-001.ledger.eth', 'who / pay / tx / rep / mem records'],
  'ens-two': ['Stable name', 'Changing answers as state changes'],
  'market-pause': ['Silent beat', 'Hold before market mechanics'],
  'market-one': ['Task broadcast', 'Workers discover, bid, winner selected'],
  'inheritance-one': ['Transfer begins', 'Old owner -> new owner'],
  'inheritance-two': ['Same agent', 'Same name', 'Same reputation'],
  'inheritance-three': ['ENS owner flip', 'Escrow checks current owner'],
  'inheritance-four': ['Earnings route', 'New owner receives future payments'],
};

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

const fade = (time: number, start: number, end: number) =>
  interpolate(time, [start, start + 0.45, end - 0.45, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const ThesisTitleCard = ({time}: {time: number}) => {
  const opacity = fade(time, 22, 28);
  const local = time - 22;
  const reveal = interpolate(local, [0.25, 1.25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wordmarkScale = interpolate(local, [0.7, 1.8, 5.3, 6], [0.94, 1, 1, 0.985], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineWidth = interpolate(local, [0.45, 1.6], [0, 1040], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(local, [1.65, 2.45], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 132px',
        background:
          'radial-gradient(circle at 50% 52%, rgba(232, 212, 160, 0.18), transparent 34%), radial-gradient(circle at 18% 18%, rgba(82, 143, 255, 0.13), transparent 24%), #000',
        opacity,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 1120,
          minHeight: 520,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            color: '#bdb4a4',
            fontSize: 17,
            textTransform: 'uppercase',
            letterSpacing: 0,
            marginBottom: 34,
            opacity: interpolate(local, [0.45, 1.05], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Introducing the agent labor market
        </div>
        <div
          style={{
            width: lineWidth,
            height: 1,
            background:
              'linear-gradient(90deg, transparent, rgba(232, 212, 160, 0.84), transparent)',
            marginBottom: 32,
          }}
        />
        <div
          style={{
            width: 520,
            height: 170,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${wordmarkScale})`,
            opacity: interpolate(local, [0.85, 1.55], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            filter: 'drop-shadow(0 28px 72px rgba(232, 212, 160, 0.25))',
          }}
        >
          <Img
            src={staticFile('ledger-logo-wordmark-full-light.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
        <div
          style={{
            color: '#f4efe3',
            fontSize: 48,
            lineHeight: 1.06,
            marginTop: 22,
            textAlign: 'center',
            transform: `translateY(${subtitleY}px)`,
            opacity: interpolate(local, [1.75, 2.45], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          The hiring hall where AI workers become ownable assets.
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 36,
            opacity: interpolate(local, [2.65, 3.4], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {['Hire', 'Verify', 'Transfer', 'Own'].map((label, index) => (
            <div
              key={label}
              style={{
                color: index === 3 ? '#000' : '#e8d4a0',
                background: index === 3 ? '#e8d4a0' : '#11100e',
                borderRadius: 8,
                padding: '12px 18px',
                fontSize: 18,
                textTransform: 'uppercase',
                letterSpacing: 0,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SponsorProofCards = ({time}: {time: number}) => {
  const opacity = fade(time, 176, 201);

  return (
    <AbsoluteFill
      style={{
        background: '#000',
        padding: '116px 88px 72px',
        opacity,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          color: '#f4efe3',
          fontSize: 42,
          lineHeight: 1.08,
          marginBottom: 26,
          flexShrink: 0,
        }}
      >
        Sponsor proof, not sponsor mentions.
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 22,
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        {sponsorProofs.map((proof, index) => {
          const cardOpacity = interpolate(
            time,
            [176 + index * 2.5, 176.8 + index * 2.5],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
          );
          const y = interpolate(time, [176 + index * 2.5, 176.8 + index * 2.5], [24, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={proof.sponsor}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${y}px)`,
                background:
                  'linear-gradient(135deg, rgba(244, 239, 227, 0.08), rgba(244, 239, 227, 0.02)), #0f0e0c',
                borderRadius: 8,
                padding: '28px 32px 30px',
                height: '100%',
                boxShadow: '0 26px 70px rgba(0, 0, 0, 0.42)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  marginBottom: 24,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 170,
                    height: 86,
                    borderRadius: 8,
                    background: proof.logoTile,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    flexShrink: 0,
                  }}
                >
                  <Img
                    src={staticFile(proof.logo)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <div style={{color: '#e8d4a0', fontSize: 24}}>{proof.sponsor}</div>
              </div>
              <div style={{color: '#f4efe3', fontSize: 31, lineHeight: 1.08}}>
                {proof.title}
              </div>
              <div
                style={{
                  color: '#bdb4a4',
                  fontSize: 23,
                  lineHeight: 1.27,
                  marginTop: 18,
                }}
              >
                {proof.detail}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const RecordingSlotOverlay = ({
  time,
  activeId,
}: {
  time: number;
  activeId: string;
}) => {
  const guide = appRecordingGuides[activeId];

  if (!guide) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        bottom: 82,
        width: 470,
        background: 'rgba(0, 0, 0, 0.82)',
        borderRadius: 8,
        padding: '22px 24px',
        opacity: fade(time, 29, 176),
      }}
    >
      <div
        style={{
          color: '#e8d4a0',
          fontSize: 17,
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        Recording Slot
      </div>
      {guide.map((item) => (
        <div
          key={item}
          style={{
            color: '#f4efe3',
            fontSize: 24,
            lineHeight: 1.18,
            marginTop: 9,
          }}
        >
          {item}
        </div>
      ))}
    </div>
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

      <Sequence from={Math.round(201 * fps)} durationInFrames={Math.round(10 * fps)}>
        <OffthreadVideo
          src={staticFile('outro.mp4')}
          muted
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
            justifyContent: 'stretch',
            alignItems: 'flex-end',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '40%',
              minWidth: 620,
              height: '100%',
              background: '#000',
              padding: '138px 76px 88px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 22,
              boxShadow: '-36px 0 80px rgba(0, 0, 0, 0.86)',
              transform: `translateX(${interpolate(time, [10, 11.2], [56, 0], {
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
                fontSize: 38,
                lineHeight: 1.12,
                letterSpacing: 0,
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
                    background: '#12100d',
                    borderRadius: 8,
                    padding: '22px 22px',
                  }}
                >
                  <div style={{color: '#e8d4a0', fontSize: 48, lineHeight: 1}}>
                    {value}
                  </div>
                  <div
                    style={{
                      color: '#bdb4a4',
                      fontSize: 17,
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
                background: '#17130f',
                borderRadius: 8,
                padding: '22px 24px',
                color: '#f4efe3',
                fontSize: 28,
                lineHeight: 1.2,
              }}
            >
              But there are still zero places where these agents can really hire
              each other.
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {time >= 22 && time < 28 ? <ThesisTitleCard time={time} /> : null}

      {time >= 176 && time < 201 ? <SponsorProofCards time={time} /> : null}

      <RecordingSlotOverlay time={time} activeId={active.id} />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 96,
          opacity:
            active.id === 'cinematic-open' || active.id === 'thesis-one'
              || active.id === 'thesis-two'
              || active.id === 'sponsor-proofs'
              || active.id === 'closing'
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
