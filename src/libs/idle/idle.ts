import useConfig from 'src/config/useConfig';

const { activityReport, useIdle } = useConfig();

const EVENTS_ARRAY = [
  'keypress',
  'keydown',
  'click',
  'contextmenu',
  'dblclick',
  'mousemove',
  'scroll',
  'touchmove',
  'touchstart',
];

export const enum ReportMode {
  Standard = 1,
  Advanced = 2,
}

export interface Options {
  activityReportInSec?: number;
  activityReportMode?: ReportMode;
  detectFramesInSec?: number;
  onActivity?: () => void;
  onEnterFrame?: () => void;
  onReportUserIsActive?: () => void;
  onReportUserIsIdle?: () => void;
  onResumeFromIdle?: () => void;
}

export class Idle {
  isIdle = false;
  userReportedActive = false; // used for advanced mode
  userIsActive = false; //used for standard mode
  userMouseIsInFrame = false;
  attachedFrames: HTMLElement[] = [];
  activityReportMode: ReportMode = ReportMode.Advanced;
  activityReportInSec: number = activityReport;
  detectFramesInSec = -1;
  timer: NodeJS.Timeout | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onActivity: () => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onEnterFrame: () => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReportUserIsActive: () => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReportUserIsIdle: () => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onResumeFromIdle: () => void = () => {};

  constructor(options: Options) {
    if (!useIdle) return;
    this.overrideDefaultsWithOptions(options);

    EVENTS_ARRAY.forEach((event) => {
      window.addEventListener(event, this.onUserActivity, false);
    });

    this.setTimer();

    if (this.detectFramesInSec > 0) {
      setInterval(
        this.attachListenerToNewFrames,
        this.detectFramesInSec * 1000
      );
    }

    // activity signal is sent when the page loaded
    this.reportActivity();
  }

  /// external

  setTimer = (interval: number = this.activityReportInSec * 1000) => {
    if (!useIdle) return;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (interval < 10000) interval = 10000;
    this.timer = setInterval(this.onTimerTick.bind(this), interval);
  };

  attachListenerToNewFrames = () => {
    const frames = Array.prototype.slice.call(
      window.document.getElementsByTagName('frame')
    );
    const iframes = Array.prototype.slice.call(
      window.document.getElementsByTagName('iframe')
    );
    const allFrames = frames.concat(iframes);
    for (const _frame of allFrames) {
      const frame = _frame as HTMLElement;
      if (this.attachedFrames.indexOf(frame) < 0) {
        frame.addEventListener(
          'mouseenter',
          this.onMouseEntersFrame.bind(this)
        );
        this.attachedFrames.push(frame);
        // We can't know if the mouse is within the new frame already, so we guess it is.
        // If its not we would find out upon any user activity
        this.userMouseIsInFrame = true;
      }
    }
  };

  onUserResumeFromIdle = () => {
    this.onResumeFromIdle();
  };

  onUserActivity = () => {
    this.onActivity();
    this.userIsActive = true;
    if (
      this.activityReportMode === ReportMode.Advanced &&
      !this.userReportedActive
    ) {
      this.reportActivity();
    }
    // user is active => user is not in a frame
    this.userMouseIsInFrame = false;
  };

  public onMouseEntersFrame() {
    this.onEnterFrame();
    this.userMouseIsInFrame = true;
  }

  private onTimerTick() {
    console.log('onTimerTick');
    if (this.userReportedActive && this.isIdle) {
      this.isIdle = false;
      this.onUserResumeFromIdle();
    }
    if (!this.userReportedActive && !this.isIdle) {
      this.isIdle = true;
      this.onReportUserIsIdle();
    }
    this.userReportedActive = false;
    if (
      (this.activityReportMode === ReportMode.Standard && this.userIsActive) ||
      (this.userMouseIsInFrame && this.isPageVisible())
    ) {
      this.reportActivity();
    }
    console.log(this.isIdle);
  }

  private reportActivity() {
    this.onReportUserIsActive();
    this.userReportedActive = true;
    this.userIsActive = false;
    if (this.isIdle) {
      this.isIdle = false;
      this.onUserResumeFromIdle();
    }
  }

  private overrideDefaultsWithOptions(options: Options) {
    this.activityReportInSec =
      options.activityReportInSec || this.activityReportInSec;
    this.activityReportMode =
      options.activityReportMode || this.activityReportMode;
    this.detectFramesInSec =
      options.detectFramesInSec || this.detectFramesInSec;
    this.onActivity = options.onActivity || this.onActivity;
    this.onEnterFrame = options.onEnterFrame || this.onEnterFrame;
    this.onReportUserIsActive =
      options.onReportUserIsActive || this.onReportUserIsActive;
    this.onReportUserIsIdle =
      options.onReportUserIsIdle || this.onReportUserIsIdle;

    this.onResumeFromIdle = options.onResumeFromIdle || this.onResumeFromIdle;
  }

  public isPageVisible() {
    // return true for "visible" / "prerender" / "undefined" (unsupported browsers)
    return document.visibilityState !== 'hidden';
  }
}
