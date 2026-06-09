// app/property/[id]/page.js
import PropertyClient from './PropertyClient';

// 1. Hook up your server-side data source here
async function getPropertyDataOnServer(id) {
  try {
    // OPTION A: If you have an API endpoint that returns a single property, uncomment below:
    // const res = await fetch(`https://nalgonda-estates.vercel.app/api/properties/${id}`);
    // if (res.ok) return await res.json();

    // OPTION B: If your properties are imported from a static array file, you can filter it here:
    // import { staticProperties } from '@/lib/properties';
    // return staticProperties.find(p => p.id === id);

    return null; 
  } catch (error) {
    console.error("Error fetching property on server:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const property = await getPropertyDataOnServer(params.id);

  // SMART FALLBACK: If the server hasn't fetched the property data yet, 
  // do not show "Property Not Found". Show your main site branding and image instead.
  if (!property) {
    return {
      title: 'Nalgonda Estates — Premium Land, Plots & Homes',
      description: 'Hyper-local real estate listings in and around Nalgonda.',
      openGraph: {
        title: 'Nalgonda Estates — Premium Land, Plots & Homes',
        description: 'Hyper-local real estate listings in and around Nalgonda.',
        url: `https://nalgonda-estates.vercel.app/property/${params.id}`,
        siteName: 'Nalgonda Estates',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200', // Your main showcase house image
            width: 1200,
            height: 630,
            alt: 'Nalgonda Estates',
          },
        ],
        type: 'website',
      },
    };
  }

  // Dynamic Metadata if the server successfully finds the property
  const title = property.title?.en || 'Premium Property';
  const desc = property.description?.en || 'View details for this premium listing.';
  const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200';

  return {
    title: `${title} | Nalgonda Estates`,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: `https://nalgonda-estates.vercel.app/property/${params.id}`,
      siteName: 'Nalgonda Estates',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
  };
}

export default function Page({ params }) {
  // Pass control over to your client-side file which correctly handles the actual page view
  return <PropertyClient params={params} />;
}
