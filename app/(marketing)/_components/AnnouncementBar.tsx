import { ArrowIcon } from "./icons";

export function AnnouncementBar() {
  return (
    <div className="annc">
      <div className="annc-inner">
        <span className="annc-text">
          New: Voice-to-ticket with full page context
        </span>
        <a className="annc-btn" href="#whats-new" aria-label="Learn more">
          <ArrowIcon size={11} />
        </a>
      </div>
    </div>
  );
}
