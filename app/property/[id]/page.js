// app/property/[id]/page.js
import PropertyClient from './PropertyClient';

// 1. You must fetch the specific property data on the server side
// Replace this with however you actually fetch data from your database/API
async function getPropertyDataOnServer(id) {
  // Example:
  // const res = await fetch(`https://your-api.com/properties/${id}`);
  // return res.json();
  
  // If you are using a static file for data, import it directly here.
  return null; 
}

export async function generateMetadata({ params }) {
  const property = await getPropertyDataOnServer(params.id);

  if (!property) {
    return { title: 'Property Not Found' };
  }

  const title = property.title?.en || 'Nalgonda Estates Property';
  const desc = property.description?.en || 'View details for this premium property.';
  
  // 2. The image URL MUST be an absolute URL (starting with https://)
  const imageUrl = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200';

  return {
    title: title,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
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
  // Pass the params down to your existing interactive client component
  return <PropertyClient params={params} />;
}
