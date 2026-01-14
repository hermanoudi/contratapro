import { useEffect } from 'react';

/**
 * Componente para adicionar Structured Data (Schema.org) ao HEAD
 * Melhora SEO e aparência nos resultados de busca do Google
 */
export default function StructuredData({ type = 'website', data = {} }) {
    useEffect(() => {
        let schema = {};

        switch (type) {
            case 'website':
                schema = {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "ContrataPro",
                    "url": "https://contratapro.com.br",
                    "description": "Plataforma para conectar clientes com profissionais autônomos de serviços residenciais",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://contratapro.com.br/search?service={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    }
                };
                break;

            case 'organization':
                schema = {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "ContrataPro",
                    "url": "https://contratapro.com.br",
                    "logo": "https://contratapro.com.br/logo.png",
                    "description": "Encontre o profissional certo para cada serviço",
                    "address": {
                        "@type": "PostalAddress",
                        "addressCountry": "BR"
                    },
                    "sameAs": [
                        // Adicionar redes sociais quando criadas
                        // "https://www.facebook.com/contratapro",
                        // "https://www.instagram.com/contratapro",
                        // "https://www.linkedin.com/company/contratapro"
                    ]
                };
                break;

            case 'service':
                schema = {
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "serviceType": "Professional Services Marketplace",
                    "provider": {
                        "@type": "Organization",
                        "name": "ContrataPro"
                    },
                    "areaServed": {
                        "@type": "Country",
                        "name": "Brasil"
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "BRL"
                    }
                };
                break;

            case 'breadcrumb':
                schema = data; // Data passada diretamente para breadcrumb
                break;

            case 'professional':
                // Schema para perfil de profissional
                schema = {
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": data.name || "Profissional",
                    "description": data.bio || "",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": data.city || "",
                        "addressRegion": data.state || "",
                        "postalCode": data.cep || "",
                        "addressCountry": "BR"
                    },
                    "telephone": data.whatsapp || "",
                    "priceRange": "$$",
                    "aggregateRating": data.rating ? {
                        "@type": "AggregateRating",
                        "ratingValue": data.rating,
                        "reviewCount": data.reviewCount || 0
                    } : undefined
                };
                break;

            default:
                return;
        }

        // Criar ou atualizar script tag
        const scriptId = `structured-data-${type}`;
        let scriptTag = document.getElementById(scriptId);

        if (scriptTag) {
            scriptTag.textContent = JSON.stringify(schema);
        } else {
            scriptTag = document.createElement('script');
            scriptTag.id = scriptId;
            scriptTag.type = 'application/ld+json';
            scriptTag.textContent = JSON.stringify(schema);
            document.head.appendChild(scriptTag);
        }

        // Cleanup ao desmontar
        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [type, data]);

    return null; // Component doesn't render anything
}
