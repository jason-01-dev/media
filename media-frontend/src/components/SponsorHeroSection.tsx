import React from 'react';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  url: string;
  description?: string;
}

interface SponsorHeroSectionProps {
  sponsors?: Sponsor[];
}

const SponsorHeroSection: React.FC<SponsorHeroSectionProps> = ({
  sponsors = [],
}) => {
  // Mock data for demonstration
  const mockSponsors: Sponsor[] = [
    {
      id: '1',
      name: 'Sponsor 1',
      logo: '/images/sponsor1.png',
      url: '#',
      description: 'Partenaire Premium',
    },
    {
      id: '2',
      name: 'Sponsor 2',
      logo: '/images/sponsor2.png',
      url: '#',
      description: 'Partenaire Premium',
    },
    {
      id: '3',
      name: 'Sponsor 3',
      logo: '/images/sponsor3.png',
      url: '#',
      description: 'Partenaire Premium',
    },
  ];

  const displaySponsors = sponsors.length > 0 ? sponsors : mockSponsors;

  return (
    <section className="sponsor-hero-section">
      <div className="sponsor-hero-container">
        <div className="sponsor-hero-header">
          <h3>Nos Partenaires Premium</h3>
          <p>Découvrez nos sponsors qui soutiennent qualité du contenu</p>
        </div>

        <div className="sponsors-grid">
          {displaySponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-card"
            >
              <div className="sponsor-logo-box">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="sponsor-logo"
                />
              </div>
              <div className="sponsor-info">
                <h4>{sponsor.name}</h4>
                {sponsor.description && <p>{sponsor.description}</p>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorHeroSection;
