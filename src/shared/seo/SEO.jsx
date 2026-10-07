import { Head } from 'vite-react-ssg';
import { useLocation } from 'react-router-dom';

export default function SEO({ title, description, schema }) {
  const { pathname } = useLocation();
  const canonicalPath = pathname === '/' ? '' : pathname.replace(/\/+$/, '');
  const canonicalUrl = `https://solithx.com${canonicalPath}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Head>
  );
}
