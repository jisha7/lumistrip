/* ============================================
   LumiStrip — Template Grid
   Responsive grid of template cards
   ============================================ */

import { TEMPLATES } from '../../constants/templates';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  selectedId: string;
  category: string;
  onSelect: (id: string) => void;
}

export function TemplateGrid({ selectedId, category, onSelect }: TemplateGridProps) {
  const filteredTemplates =
    category === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === category);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px',
        padding: '0 24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      {filteredTemplates.map((template, index) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedId === template.id}
          onSelect={onSelect}
          index={index}
        />
      ))}
    </div>
  );
}
