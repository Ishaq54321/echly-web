import { AnnoteLogo } from "./AnnoteLogo";
import { ArrowIcon } from "./icons";

export function AnnouncementBar() {
  return (
    <div className="annc">
      <div className="annc-inner">
        <span className="annc-mark">
          <AnnoteLogo width={16} height={20} />
        </span>
        <span className="annc-text">
          New: Voice-to-ticket with full page context
        </span>
        <a className="annc-btn" href="#whats-new">
          Learn more <ArrowIcon size={11} />
        </a>
      </div>
    </div>
  );
}
