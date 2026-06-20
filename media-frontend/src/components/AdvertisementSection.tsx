import React from 'react';

interface Advertisement {
  id: string;
  title: string;
  image: string;
  url: string;
  type: 'banner' | 'native';
}

interface AdvertisementSectionProps {
  advertisements?: Advertisement[];
}

const AdvertisementSection: React.FC<AdvertisementSectionProps> = ({
  advertisements = [],
}) => {
  // Mock data for demonstration
  const mockAds: Advertisement[] = [
    {
      id: '1',
      title: 'Publicité 1',
      image: '/images/ad1.png',
      url: '#',
      type: 'banner',
    },
  ];

  const displayAds = advertisements.length > 0 ? advertisements : mockAds;

  return (
    <section className="advertisement-section">
      <div className="advertisement-container">
        {displayAds.map((ad) => (
          <a
            key={ad.id}
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            className="advertisement-banner"
          >
            <img src={ad.image} alt={ad.title} className="ad-image" />
          </a>
        ))}
      </div>
    </section>
  );
};

export default AdvertisementSection;
