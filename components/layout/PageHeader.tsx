"use client";

import React from "react";
import { Menu } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, breadcrumb, actions, className = "" }: PageHeaderProps) {
  const openMobileMenu = () => {
    const trigger = document.getElementById("echly-mobile-menu-trigger");
    trigger?.click();
  };

  return (
    <header
      className={`flex items-center justify-between shrink-0 px-6 border-b border-[var(--border-muted)] bg-[var(--surface-card)] ${className}`}
      style={{ height: "var(--topbar-height)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={openMobileMenu}
          className="md:hidden w-[38px] h-[38px] flex items-center justify-center rounded-[var(--radius-btn)] hover:bg-[var(--gray-100)] transition-colors shrink-0"
          aria-label="Open navigation"
        >
          <Menu style={{ width: 16, height: 16, color: "var(--text-secondary)" }} aria-hidden />
        </button>

        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <div
              className="flex items-center gap-1 mb-0.5"
              style={{ fontSize: "var(--font-size-sm)", color: "var(--text-tertiary)" }}
            >
              {breadcrumb.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span aria-hidden>›</span>}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="hover:text-[var(--text-primary)] transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          <h1
            className="font-semibold truncate leading-tight"
            style={{ fontSize: "var(--font-size-xl)", color: "var(--text-primary)" }}
          >
            {title}
          </h1>
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {actions}
        </div>
      )}
    </header>
  );
}
