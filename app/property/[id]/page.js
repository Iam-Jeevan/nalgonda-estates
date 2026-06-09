// app/property/[id]/page.js
import PropertyClient from './PropertyClient';

export async function generateMetadata({ params }) {
  const { id } = params;
  
  // 1. Set default fallback values so the link never looks "broken"
  let title = "Nalgonda Estates — Premium Land, Plots & Homes";
  let desc = "Hyper-local real estate listings in and around Nalgonda.";
  let imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

  // 2. Fetch the specific property data on the server via your API
  try {
    // Calling the exact API route your usePropertyStore uses, but with an absolute URL
    const res = await fetch('https://nalgonda-estates.vercel.app/api/properties', {
      next: { revalidate: 30 } // Caches the response for 30 seconds to keep your site fast
    });
    
    if (res.ok) {
      const data = await res.json();
      
      // Find the specific property based on the URL parameter 'id'
      const property = data.properties?.find((p) => p.id === id);

      // If the server successfully found the property, overwrite the defaults
      if (property) {
        title = `${property.title?.en || property.title || 'Premium Property'} | Nalgonda Estates`;
        desc = property.description?.en || property.description || desc;
        imageUrl = property.images?.[0] || imageUrl;
      }
    }
  } catch (error) {
    console.error("Error fetching property on server:", error);
  }

  // 3. Return the generated Open Graph Tags
  return {
    title: title,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: `https://nalgonda-estates.vercel.app/property/${id}`,
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
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default function Page({ params }) {
  // Pass control to your interactive client component
  return <PropertyClient params={params} />;
}
