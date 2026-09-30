import styled from 'styled-components';
import { PAPER } from './tokens';

const perforationTile = (color) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='18' height='12'><circle cx='9' cy='0' r='5.5' fill='${color}'/></svg>`
  )}")`;

/* Picote entre duas vias: a borda de baixo da folha de cima fica picotada,
   como um talão destacado. Uso: <Seam $from="amarela" $to="rosa" aria-hidden="true" /> */
export const Seam = styled.div`
  height: 12px;
  background-color: ${({ $to }) => PAPER[$to]};
  background-image: ${({ $from }) => perforationTile(PAPER[$from])};
  background-repeat: repeat-x;
  background-position: top center;
`;
