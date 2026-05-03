"use client";

import { useEffect, useRef } from "react";

import { siteConfig } from "@/config/site";
import type { AdZone } from "@/lib/types";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

interface AdSlotProps {
  zone: AdZone | null | undefined;
  className?: string;
  /** AdSense ad unit slot ID. Overrides responsive auto if provided. */
  adSlotId?: string;
}

export function AdSlot({ zone, className, adSlotId }: AdSlotProps) {
  const campaign = zone?.campaigns?.[0];
  const impressionFired = useRef(false);
  const adsensePushed = useRef(false);

  useEffect(() => {
    if (!campaign || impressionFired.current) return;
    impressionFired.current = true;
    fetch(campaign.impression_tracking_url, { method: "POST" }).catch(() => {});
  }, [campaign]);

  // Push AdSense ad on mount when no in-house campaign
  useEffect(() => {
    if (campaign || adsensePushed.current) return;
    adsensePushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not loaded — no-op
    }
  }, [campaign]);

  // In-house campaign
  if (zone && campaign) {
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

  // AdSense fallback
  const w = zone?.width ?? 300;
  const h = zone?.height ?? 250;

  return (
    <div className={`ad-slot ${className ?? ""}`} style={{ width: w, height: h }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={siteConfig.adsensePublisherId}
        data-ad-slot={adSlotId ?? ""}
        data-ad-format={adSlotId ? undefined : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
}
