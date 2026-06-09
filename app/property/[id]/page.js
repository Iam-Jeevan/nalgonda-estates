// app/property/[id]/page.js
import PropertyClient from './PropertyClient';
import { connectMongo } from '@/lib/mongodb';
import Property from '@/models/Property';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  
  // Default fallback values
  let title = "Nalgonda Estates — Premium Land, Plots & Homes";
  let desc = "Hyper-local real estate listings in and around Nalgonda.";
  let imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

  try {
    await connectMongo();
    const property = await Property.findOne({ id: id }).lean();

    if (property) {
      // 1. Safely extract Title (Fix for [object Object])
      let propTitle = 'Premium Property';
      if (typeof property.title === 'string' && property.title.trim() !== '') {
        propTitle = property.title;
      } else if (property.title && typeof property.title.en === 'string') {
        propTitle = property.title.en;
      }
      title = `${propTitle} | Nalgonda Estates`;
      
      // 2. Safely extract Description (Fix for [object Object])
      if (typeof property.description === 'string' && property.description.trim() !== '') {
        desc = property.description;
      } else if (property.description && typeof property.description.en === 'string' && property.description.en.trim() !== '') {
        desc = property.description.en;
      }
      
      // 3. Safely extract Image URL
      if (property.images && Array.isArray(property.images) && property.images.length > 0) {
        const firstImg = property.images[0];
        let parsedImgUrl = '';
        
        // Handle both string arrays and object arrays from your database
        if (typeof firstImg === 'string') {
          parsedImgUrl = firstImg;
        } else if (firstImg && typeof firstImg.url === 'string') {
          parsedImgUrl = firstImg.url;
        }

        // Ensure the image URL is absolute (required by WhatsApp)
        if (parsedImgUrl && parsedImgUrl.startsWith('http')) {
          imageUrl = parsedImgUrl;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching property for metadata:", error);
  }

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
