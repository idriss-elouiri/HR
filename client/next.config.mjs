/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/hr",
        destination: "/EmployeesHrAuth",
        permanent: true,
      },
      {
        source: "/employee",
        destination: "/EmployeesAuth",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
