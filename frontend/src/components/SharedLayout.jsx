import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import ProfessionalLayout from './ProfessionalLayout';
import ClientLayout from './ClientLayout';

// Papel de quem está logado, lido do token na primeira renderização
const readIsProfessional = () => {
    try {
        const token = localStorage.getItem('token');
        return token ? !!JSON.parse(atob(token.split('.')[1])).is_professional : null;
    } catch {
        return null;
    }
};

export default function SharedLayout({ children }) {
    const [isProfessional] = useState(readIsProfessional);
    const location = useLocation();

    // Sem login (ou token ilegível): entra e volta para cá
    if (isProfessional === null) {
        return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    }

    return isProfessional ? (
        <ProfessionalLayout>{children}</ProfessionalLayout>
    ) : (
        <ClientLayout>{children}</ClientLayout>
    );
}
