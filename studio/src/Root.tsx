import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import Scene from "./episode/Scene";
import { Backdrop, Captions, Plan, PlanContext } from "./kit";

const Main: React.FC<{ plan: Plan; captions: boolean }> = ({ plan, captions }) => (
  <PlanContext.Provider value={plan}>
    <AbsoluteFill>
      <Backdrop />
      <Scene />
      {captions ? <Captions /> : null}
    </AbsoluteFill>
  </PlanContext.Provider>
);

const emptyPlan: Plan = { fps: 30, total: 2, beats: [], chunks: [], format: "short" };

export const Root: React.FC = () => (
  <Composition
    id="Episode"
    component={Main as any}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={60}
    defaultProps={{ plan: emptyPlan, captions: true }}
    calculateMetadata={({ props }: any) => {
      const p = props.plan as Plan;
      const long = p.format === "long";
      return {
        durationInFrames: Math.max(1, Math.round(p.total * p.fps)),
        fps: p.fps,
        width: long ? 1920 : 1080,
        height: long ? 1080 : 1920,
      };
    }}
  />
);
