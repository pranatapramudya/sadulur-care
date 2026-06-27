const nextConfig = {
  //output: "export", // 🚀 NYALA DULU SEMENTARA BUAT BIKIN APK
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@clerk/clerk-react"],
  typescript: {
    ignoreBuildErrors: true,
  },
  // 🔥 Cheat eslint gue hapus biar terminal lu bersih dari warning kuning
};

export default nextConfig;
