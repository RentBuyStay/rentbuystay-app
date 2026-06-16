import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // QoreID's liveness (FaceTec) runs in a cross-origin iframe. The default
        // Permissions-Policy is `camera=(self)`, which blocks that iframe from
        // accessing the camera even after the user grants browser permission —
        // surfacing as "Camera permissions disabled". Delegate camera/microphone
        // so the embedded liveness component can start.
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
