"use client";

import { useEffect, useRef } from "react";

import type { AdZone } from "@/lib/types";

interface AdSlotProps {
  zone: AdZone | null | undefined;
  className?: string;
}

/**
 * Renders the first active campaign in an ad zone.
 * Fires impression tracking on mount, click tracking on click.
 */
export function AdSlot({ zone, className }: AdSlotProps) {
  const campaign = zone?.campaigns?.[0];
  const impressionFired = useRef(false);

  useEffect(() => {
    if (!campaign || impressionFired.current) return;
    impressionFired.current = true;
    fetch(campaign.impression_tracking_url, { method: "POST" }).catch(() => {});
  }, [campaign]);

  if (!zone || !campaign) {
    return (
      <div
        className={`ad-slot ${className ?? ""}`}
        style={{ width: zone?.width ?? 300, height: zone?.height ?? 250 }}
        aria-hidden="true"
      >
        <span className="ad-slot-label">Advertisement</span>
      </div>
    );
  }

  return (
    <div
      className={`ad-slot ${className ?? ""}`}
      style={{ width: zone.width, height: zone.height }}
    >
      <a
        href={campaign.click_tracking_url}
        rel="noopener noreferrer nofollow"
        target="_blank"
        aria-label={campaign.alt_text || "Advertisement"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={campaign.creative_url}
          alt={campaign.alt_text}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
        />
      </a>
    </div>
  );
}
