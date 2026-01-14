import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.$isOpen ? 'var(--primary)' : 'white'};
  border: 2px solid ${props => props.$isOpen ? 'var(--primary)' : 'var(--border)'};
  border-radius: ${props => props.$isOpen ? '10px 10px 0 0' : '10px'};
  font-weight: 600;
  font-size: 0.85rem;
  color: ${props => props.$isOpen ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  svg {
    color: ${props => props.$isOpen ? 'white' : 'currentColor'};
  }

  &:hover {
    background: ${props => props.$isOpen ? 'var(--accent)' : 'var(--bg-secondary)'};
    border-color: var(--primary);
  }

  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
`;

const DropdownContainer = styled(motion.div)`
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  width: 100%;
  min-width: 300px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #f5f7fa 100%);
  border: 2px solid var(--primary);
  border-top: none;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: 968px) {
    max-height: 60vh;
    min-width: auto;
  }

  @media (max-width: 480px) {
    max-height: 50vh;
    border-radius: 0 0 12px 12px;
    border-width: 1px;
  }

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 0 0 16px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 5px;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--accent);
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

const MenuGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 10px;
  }
`;

const GroupTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary);
`;

const CategoryItem = styled.button`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: translateX(6px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 480px) {
    padding: 0.65rem 0.85rem;
    font-size: 0.9rem;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
`;

export default function CategoryMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories/groups');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error('Erro ao buscar categorias:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setIsOpen(false);
    // Navegar para página de busca com o serviço selecionado
    navigate(`/search?service=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <MenuButton onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
        <MenuIcon size={20} />
        Todos Serviços
        <ChevronDown
          size={18}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />
      </MenuButton>

      <AnimatePresence>
        {isOpen && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
            <DropdownContainer
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Carregando categorias...
                  </p>
                </div>
              ) : (
                <MenuGrid>
                  {Object.entries(categories).map(([group, items]) => (
                    <MenuGroup key={group}>
                      <GroupTitle>{group}</GroupTitle>
                      {items.map((cat) => (
                        <CategoryItem
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.slug)}
                        >
                          {cat.name}
                        </CategoryItem>
                      ))}
                    </MenuGroup>
                  ))}
                </MenuGrid>
              )}
            </DropdownContainer>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
