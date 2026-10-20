"""Every number in the escalator (stand on both sides) how-to episode.
Source: TfL, "Report on Holborn Station Pilot" (FOI 2015-1920), section 5.1 and 7.2."""
import random

ok = True
def check(name, got, want, tol=0.0):
    global ok
    good = abs(got - want) <= tol if isinstance(want, (int, float)) and not isinstance(want, bool) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# TfL's numbers: escalator speed 0.75 m/s, step depth 0.4 m, walking speed on top 0.5 m/s,
# standers leave one empty step, walkers two; Holborn rise 24 m -> ~40% willing to walk.
v, step, u = 0.75, 0.4, 0.5
steps_per_min = 60 / (step / v)
check("seconds per step", round(step / v, 3), 0.533)
check("a step passes about every half second", round(step / v, 1), 0.5)
check("steps passing per minute", steps_per_min, 112.5)
stand_lane = steps_per_min * 0.5            # one person every other step
check("standing lane, one empty step: people a minute (said 56)", int(stand_lane), 56)
walk_steps = (v + u) * 60 / step            # steps a walker passes per minute
walk_lane = walk_steps / 3                  # one walker, two empty steps
check("steps a walker covers a minute", walk_steps, 187.5)
check("full walking lane: people a minute (said 62)", int(walk_lane), 62)
both_stand = 2 * stand_lane
check("both sides standing: people a minute (said 112)", int(both_stand), 112)
check("24 m is about 8 floors at 3 m a floor", 24 / 3, 8)

# Walking lane only used by the 40% who will climb 24 m: the standing queue (60%) is the bottleneck.
p_walk = 0.40
walkers_flow = stand_lane * p_walk / (1 - p_walk)
mixed = stand_lane + walkers_flow
print(f"theory with 40% walkers: {stand_lane:.2f} + {walkers_flow:.2f} = {mixed:.2f} a minute; "
      f"both standing {both_stand:.1f} = +{100 * (both_stand / mixed - 1):.0f}%")
check("walking lane runs well under full (37.5 of 62.5)", walkers_flow < walk_lane, True)

# simulate a rush-hour crowd of 100,000 people, each a walker with chance 0.4, all queued at once
rng = random.Random(2026)
N = 100_000
walkers = sum(rng.random() < p_walk for _ in range(N))
standers = N - walkers
t_mixed = max(standers / stand_lane, walkers / walk_lane)    # minutes until both queues clear
t_both = N / both_stand
print(f"sim: {walkers:,} walkers, {standers:,} standers; walk-left clears in {t_mixed:.0f} min, "
      f"all-stand in {t_both:.0f} min ({100 * (t_mixed / t_both - 1):.0f}% more people per minute standing)")
check("sim: standing both sides moves more people", t_both < t_mixed, True)
check("sim: walking lane is idle part of the time", walkers / walk_lane < t_mixed, True)

# The measured result (section 7.2): escalator 5, same 1-hour peak test, walk-left vs stand-only
before, after = 12_745, 16_220
gain = 100 * (after / before - 1)
check("Holborn measured gain, % (said 27%)", round(gain), 27)
# Canary Wharf (10 m rise): forcing standing cut throughput by about 10% (report section 4)
print("Canary Wharf: making everyone stand reduced throughput ~10% (TfL report, Harley 2015)")
print("ALL OK" if ok else "SOME CHECKS FAILED")
