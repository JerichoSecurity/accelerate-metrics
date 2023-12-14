import { Interval, DateTime, DurationLikeObject } from "luxon";

export const windowPerTimePoint =
  (windowDuration: DurationLikeObject) =>
  (interval: Interval): Interval => {
    if (interval.end === null) {
      // Handle the case where interval.end is null
      // For example, throw an error or return a default value
      throw new Error("Interval end is null");
    }

    return Interval.before(interval.end, windowDuration);
  };

export interface RollingWindowInputs {
  reportStart: DateTime;
  reportEnd: DateTime;
  samplingFrequency: DurationLikeObject;
  sampleWindowSize: DurationLikeObject;
}

export const rollingWindows = ({
  reportStart,
  reportEnd,
  samplingFrequency,
  sampleWindowSize,
}: RollingWindowInputs): Interval[] => {
  const interval = Interval.fromDateTimes(reportStart, reportEnd);
  return interval
    .splitBy(samplingFrequency)
    .map(windowPerTimePoint(sampleWindowSize));
};
