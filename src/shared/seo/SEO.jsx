import { Head } from 'vite-react-ssg';
import { useLocation } from 'react-router-dom';

export default function SEO({
  title,
  description,
  schema,
  schemas,
  noIndex = false,
  ogType = 'website',
  imageAlt,
}) {
  const { pathname } = useLocation();
  const canonicalPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
  const canonicalUrl = `https://solithx.com${canonicalPath || '/'}`;
  const shareImageUrl = 'https://solithx.com/og-image.svg';
  const allSchemas = [
    ...(schema ? [schema] : []),
    ...(schemas ?? []),
  ];

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Solithx" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={shareImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt ?? title} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={shareImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt ?? title} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {allSchemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Head>
  );
}
