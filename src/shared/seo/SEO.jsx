import { Head } from 'vite-react-ssg';
import { useLocation } from 'react-router-dom';

export default function SEO({ title, description, schema, noIndex = false }) {
  const { pathname } = useLocation();
  const canonicalPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
  const canonicalUrl = `https://solithx.com${canonicalPath || '/'}`;
  const shareImageUrl = 'https://solithx.com/og-image.svg';

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={shareImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={shareImageUrl} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Head>
  );
}
