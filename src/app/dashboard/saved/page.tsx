"use client";

import SeekerPropertyCard from "@/components/SeekerPropertyCard";
import {
  useGetSavedPropertiesQuery,
  useUnsavePropertyMutation,
} from "@/services/propertyApi";
import { toSeekerListing } from "@/lib/property";
import { useToast } from "@/components/Toast";

export default function SavedPropertiesPage() {
  const { data: page, isLoading, isError } = useGetSavedPropertiesQuery({ page: 0, size: 100 });
  const [unsaveProperty] = useUnsavePropertyMutation();
  const { toast } = useToast();
  const listings = (page?.content ?? []).map(toSeekerListing);

  if (isLoading) {
    return (
      <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", color: "#807E7E", fontSize: "14px" }}>
        Loading saved properties…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", color: "#807E7E", fontSize: "14px" }}>
        Couldn&rsquo;t load saved properties.
      </div>
    );
  }
  if (listings.length === 0) {
    return (
      <div className="bg-white flex items-center justify-center" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "80px", color: "#807E7E", fontSize: "14px" }}>
        You haven&rsquo;t saved any properties yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "24px 16px" }}>
      {listings.map((listing) => (
        <SeekerPropertyCard
          key={listing.id}
          listing={listing}
          saved
          onToggleSave={(id) =>
            unsaveProperty(id)
              .unwrap()
              .then(() => toast("Removed from saved", "info"))
              .catch(() => toast("Couldn’t remove from saved.", "error"))
          }
        />
      ))}
    </div>
  );
}
