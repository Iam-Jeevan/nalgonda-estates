// app/property/[id]/page.js
import PropertyClient from './PropertyClient';

export async function generateMetadata({ params }) {
  const { id } = params;
  
  // 1. Set default fallback values so the link never looks "broken"
  let title = "Nalgonda Estates — Premium Land, Plots & Homes";
  let desc = "Hyper-local real estate listings in and around Nalgonda.";
  let imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

  // 2. ATTEMPT TO FETCH REAL DATA ON THE SERVER
  // Since your app uses a client-side store (usePropertyStore), the server doesn't know about it.
  // You must connect your actual data source here.
  try {
    
    // 👉 OPTION A: If you have a static properties array in your lib folder:
    // const { properties } = await import('@/lib/properties');
    // const property = properties.find(p => p.id === id);

    // 👉 OPTION B: If you have an API endpoint or database (like Firebase/Supabase):
    // const res = await fetch(`https://nalgonda-estates.vercel.app/api/properties/${id}`);
    // const property = await res.json();
    
    // Temporarily setting to null until you uncomment one of the options above
    const property = null; 

    // If the server successfully found the property, overwrite the defaults
    if (property) {
      title = `${property.title?.en || 'Premium Property'} | Nalgonda Estates`;
      desc = property.description?.en || desc;
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
