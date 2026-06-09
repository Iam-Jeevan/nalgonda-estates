// app/property/[id]/page.js
import PropertyClient from './PropertyClient';

export async function generateMetadata({ params }) {
  // 1. Await params for Next.js 15+ compatibility
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  
  // 2. Instant, hardcoded fallback values (No API fetching)
  const title = "Nalgonda Estates — Premium Land, Plots & Homes";
  const desc = "Hyper-local real estate listings in and around Nalgonda.";
  const imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";

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
