"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import Link from "next/link";
import type { SeekerListing } from "./SeekerPropertyCard";

function priceDivIcon(listing: SeekerListing) {
  const text = `${listing.price}${listing.priceSuffix ?? ""}`;
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);font-family:var(--font-geist),Geist,system-ui,sans-serif;">
      <span style="background:#FFAE00;color:#FFFFFF;padding:4px 10px;border-radius:20px;font-size:12px;line-height:16px;font-weight:500;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.18);">${text}</span>
      <span style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #FFAE00;margin-top:-1px;"></span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "rbs-price-pin",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function BrowseLeafletMap({ listings }: { listings: SeekerListing[] }) {
  const pinned = listings.filter(
    (l) => typeof l.lat === "number" && typeof l.lng === "number"
  );

  return (
    <MapContainer
      center={[6.5, 3.42]}
      zoom={11}
      scrollWheelZoom
      style={{ width: "100%", height: "100%", borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pinned.map((l) => (
        <Marker key={l.id} position={[l.lat!, l.lng!]} icon={priceDivIcon(l)}>
          <Popup minWidth={260} maxWidth={300} closeButton={false} className="rbs-pin-popup">
            <PopupCard listing={l} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function PopupCard({ listing }: { listing: SeekerListing }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "260px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "16px", lineHeight: "20px", fontWeight: 700, color: "#305E82" }}>
          {listing.price}
          {listing.priceSuffix && (
            <span style={{ fontSize: "13px", fontWeight: 400, color: "#121212" }}>
              {listing.priceSuffix}
            </span>
          )}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
            {listing.title}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Image src="/icons/dash/card-location.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: "12px", lineHeight: "20px", color: "#305E82" }}>
              {listing.location}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", color: "#807E7E" }}>
        <span>{listing.sqft}</span>
        <span style={{ fontWeight: 300 }}>·</span>
        <span>{listing.beds} Beds</span>
        <span style={{ fontWeight: 300 }}>·</span>
        <span>{listing.baths} {listing.baths === 1 ? "Bath" : "Baths"}</span>
      </div>

      <Link
        href={`/dashboard/browse/${listing.id}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          fontWeight: 500,
          color: "#305E82",
          textDecoration: "none",
        }}
      >
        View Details
        <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={16} height={16} />
      </Link>
    </div>
  );
}
