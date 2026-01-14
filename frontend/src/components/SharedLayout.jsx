import { useState, useEffect } from 'react';
import ProfessionalLayout from './ProfessionalLayout';
import ClientLayout from './ClientLayout';

export default function SharedLayout({ children }) {
    const [isProfessional, setIsProfessional] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setIsProfessional(payload.is_professional);
        }
    }, []);

    if (isProfessional === null) return null;

    return isProfessional ? (
        <ProfessionalLayout>{children}</ProfessionalLayout>
    ) : (
        <ClientLayout>{children}</ClientLayout>
    );
}
