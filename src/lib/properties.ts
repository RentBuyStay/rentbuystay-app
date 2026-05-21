export type Status = "Active" | "Awaiting Approval" | "Archived" | "Rejected";
export type Tag = "For Rent" | "For Sale" | "Shortlet";

export type Property = {
  id: string;
  propertyId: string;
  title: string;
  location: string;
  price: string;
  priceSuffix?: string;
  tag: Tag;
  status: Status;
  sqft: string;
  beds: number;
  baths: number;
  image: string;
  images: string[];
  views: number;
  listedAgo: string;
  listedOn: string;
  type: string;
  description: string;
  amenities: string[];
  serviceCharge: string;
  bookingCharge: string;
  mapBbox: string;
  mapMarker: string;
};

export const PROPERTIES: Property[] = [
  {
    id: "p1",
    propertyId: "RBS-L-004821",
    title: "3-Bedroom Flat, Lekki Phase 1",
    location: "Lekki Phase 1, Lagos",
    price: "₦2,800,000",
    priceSuffix: "/yr",
    tag: "For Rent",
    status: "Active",
    sqft: "3500 sqft",
    beds: 3,
    baths: 4,
    image: "/images/prop1.jpg",
    images: ["/images/prop1.jpg", "/images/prop2.jpg", "/images/prop3.jpg", "/images/prop4.jpg", "/images/prop5.jpg"],
    views: 529,
    listedAgo: "Listed 3 days ago",
    listedOn: "28 Mar 2025",
    type: "Apartment and Flat",
    description:
      "This stunning 3-bedroom apartment is situated in the heart of Lekki Phase 1, Lagos, offering breathtaking views and top-tier finishes throughout. The property features an open-plan living and dining area, a fully fitted kitchen, and spacious bedrooms with built-in wardrobes.",
    amenities: [
      "Gated Compound", "24/7 Security", "Air Conditioning",
      "Parking Space", "Water Treatment", "Furnished",
      "Gym Facility", "Underground Parking", "Smart Home System",
      "Swimming Pool", "Solar Panels", "Pet Friendly",
      "Community Hall", "Backup Generator", "High Speed Internet",
    ],
    serviceCharge: "₦1,000,000",
    bookingCharge: "₦300,000",
    mapBbox: "3.4500%2C6.4350%2C3.4900%2C6.4650",
    mapMarker: "6.4500%2C3.4700",
  },
  {
    id: "p2",
    propertyId: "RBS-L-004822",
    title: "2-Bedroom Apartment, Victoria Island",
    location: "Victoria Island, Lagos",
    price: "₦450,000",
    priceSuffix: "/night",
    tag: "Shortlet",
    status: "Active",
    sqft: "1800 sqft",
    beds: 3,
    baths: 2,
    image: "/images/prop2.jpg",
    images: ["/images/prop2.jpg", "/images/prop1.jpg", "/images/prop5.jpg", "/images/prop4.jpg"],
    views: 287,
    listedAgo: "Listed 1 week ago",
    listedOn: "21 Mar 2025",
    type: "Apartment",
    description:
      "Elegant 2-bedroom apartment located in the heart of Victoria Island, perfect for short-stay visitors. Fully furnished with modern interiors, premium appliances, and panoramic city views.",
    amenities: [
      "Gated Compound", "24/7 Security", "Air Conditioning",
      "Parking Space", "Water Treatment", "Furnished",
      "Swimming Pool", "Backup Generator", "High Speed Internet",
    ],
    serviceCharge: "₦500,000",
    bookingCharge: "₦150,000",
    mapBbox: "3.4100%2C6.4250%2C3.4450%2C6.4500",
    mapMarker: "6.4300%2C3.4250",
  },
  {
    id: "p3",
    propertyId: "RBS-L-004824",
    title: "Office Space, Ikeja GRA",
    location: "Ikeja GRA, Lagos",
    price: "₦3,400,000",
    priceSuffix: "/yr",
    tag: "For Rent",
    status: "Archived",
    sqft: "1200 sqft",
    beds: 2,
    baths: 1,
    image: "/images/prop3.jpg",
    images: ["/images/prop3.jpg", "/images/prop1.jpg", "/images/prop4.jpg"],
    views: 122,
    listedAgo: "Listed 2 months ago",
    listedOn: "21 Jan 2025",
    type: "Commercial",
    description:
      "Premium commercial office space in Ikeja GRA, fully partitioned with reception, meeting rooms, and an open-plan work area. Ideal for small to medium enterprises.",
    amenities: [
      "Gated Compound", "24/7 Security", "Air Conditioning",
      "Parking Space", "Backup Generator", "High Speed Internet",
    ],
    serviceCharge: "₦600,000",
    bookingCharge: "₦200,000",
    mapBbox: "3.3300%2C6.5750%2C3.3700%2C6.6050",
    mapMarker: "6.5950%2C3.3500",
  },
  {
    id: "p4",
    propertyId: "RBS-L-004823",
    title: "4-bedroom Duplex, Ikoyi",
    location: "Ikoyi, Lagos",
    price: "₦260,000,000",
    tag: "For Sale",
    status: "Awaiting Approval",
    sqft: "5000 sqft",
    beds: 5,
    baths: 6,
    image: "/images/prop4.jpg",
    images: ["/images/prop4.jpg", "/images/prop1.jpg", "/images/prop2.jpg", "/images/prop3.jpg", "/images/prop5.jpg"],
    views: 396,
    listedAgo: "Listed 2 weeks ago",
    listedOn: "10 Mar 2025",
    type: "Duplex",
    description:
      "Luxurious 4-bedroom duplex in upscale Ikoyi, featuring private pool, expansive garden, smart-home automation, and dedicated staff quarters.",
    amenities: [
      "Gated Compound", "24/7 Security", "Air Conditioning",
      "Parking Space", "Water Treatment", "Furnished",
      "Gym Facility", "Smart Home System", "Swimming Pool",
      "Solar Panels", "Pet Friendly", "High Speed Internet",
    ],
    serviceCharge: "₦2,500,000",
    bookingCharge: "₦5,000,000",
    mapBbox: "3.4250%2C6.4400%2C3.4650%2C6.4700",
    mapMarker: "6.4500%2C3.4400",
  },
  {
    id: "p5",
    propertyId: "RBS-L-004826",
    title: "2-Bedroom Flat, Jibowu, Yaba",
    location: "Yaba, Lagos",
    price: "₦1,800,000",
    priceSuffix: "/yr",
    tag: "For Rent",
    status: "Active",
    sqft: "2000 sqft",
    beds: 3,
    baths: 3,
    image: "/images/prop5.jpg",
    images: ["/images/prop5.jpg", "/images/prop1.jpg", "/images/prop2.jpg", "/images/prop4.jpg"],
    views: 462,
    listedAgo: "Listed 3 days ago",
    listedOn: "28 Mar 2025",
    type: "Apartment and Flat",
    description:
      "Comfortable 2-bedroom flat in the heart of Jibowu, Yaba. Close to schools, transport hubs, and tech hubs. Perfect for young professionals.",
    amenities: [
      "Gated Compound", "24/7 Security", "Parking Space",
      "Water Treatment", "Backup Generator", "High Speed Internet",
    ],
    serviceCharge: "₦400,000",
    bookingCharge: "₦100,000",
    mapBbox: "3.3650%2C6.5050%2C3.3900%2C6.5250",
    mapMarker: "6.5150%2C3.3750",
  },
];

export function getProperty(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}
