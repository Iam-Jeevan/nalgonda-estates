// app/property/[id]/page.js
import PropertyClient from './PropertyClient';
import { connectMongo } from '@/lib/mongodb';
import Property from '@/models/Property';

export async function generateMetadata({ params }) {
  // 1. Await params for Next.js 15+ compatibility
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  
  // 2. Default fallback values
  let title = "Nalgonda Estates — Premium Land, Plots & Homes";
  let desc = "Hyper-local real estate listings in and around Nalgonda.";
  let imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

  // 3. Connect directly to MongoDB to fetch the specific property
  try {
    await connectMongo();
    
    // Find the property where the 'id' field matches the URL parameter
    const property = await Property.findOne({ id: id }).lean();

    if (property) {
      // Safely extract Title (handling i18n objects if present)
      const propTitle = property.title?.en || property.title || 'Premium Property';
      title = `${propTitle} | Nalgonda Estates`;
      
      // Safely extract Description
      desc = property.description?.en || property.description || desc;
      
      // Safely extract the first Image URL based on your normalizeImages logic
      if (property.images && property.images.length > 0) {
        const firstImg = property.images[0];
        // Checks if the image is stored as a simple string or an object with a 'url' property
        imageUrl = typeof firstImg === 'string' ? firstImg : (firstImg?.url || imageUrl);
      }
    }
  } catch (error) {
    console.error("Error fetching property for metadata:", error);
  }

  // 4. Return the generated Open Graph Tags
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
  return <PropertyClient params={params} />;
}
