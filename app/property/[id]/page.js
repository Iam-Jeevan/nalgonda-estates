// app/property/[id]/page.js
import PropertyClient from './PropertyClient';

export async function generateMetadata({ params }) {
  const { id } = params;
  
  // 1. Default fallback values
  let title = "Nalgonda Estates — Premium Land, Plots & Homes";
  let desc = "Hyper-local real estate listings in and around Nalgonda.";
  let imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

  // 2. Fetch the specific property data on the server
  try {
    // Importing your properties array from lib/properties
    const { properties } = await import('@/lib/properties');
    
    // Find the specific property based on the URL parameter 'id'
    const property = properties?.find(p => p.id === id);

    // If the server successfully found the property, overwrite the defaults
    if (property) {
      title = `${property.title?.en || property.title || 'Premium Property'} | Nalgonda Estates`;
      desc = property.description?.en || property.description || desc;
      imageUrl = property.images?.[0] || imageUrl;
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
  };
}

export default function Page({ params }) {
  // Pass control to your interactive client component
  return <PropertyClient params={params} />;
}
