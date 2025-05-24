/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname:
                'niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com',
              pathname: '/**',          // allow every object in the bucket
            },
            {
                protocol: 'https',
                hostname: 'niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.amazonaws.com',
                pathname: '/**',          // allow every object in this bucket
              },
          ],
      }
};

export default nextConfig;
