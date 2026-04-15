import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { getSkillIcon } from '../utils/skillIcons';

const categoryColors = {
  'Frontend': '#6366f1',
  'Backend': '#a855f7',
  'Database': '#22c55e',
  'DevOps': '#f59e0b',
  'Tools': '#ec4899',
  'Languages': '#06b6d4',
  'AI/ML': '#f97316',
  'Programming': '#6366f1',
  'Frameworks': '#a855f7',
  'Libraries': '#22c55e',
  'Tools & Platforms': '#ec4899',
};

export default function Skills() {
  const { data } = usePortfolio();
  const skillsData = data?.skills || [];

  // Support both array (frontend) and object (frontend copy) formats
  let grouped = {};
  if (Array.isArray(skillsData)) {
    skillsData.forEach((skill) => {
      const cat = skill.category || 'Tools & Platforms';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(skill);
    });
  } else {
    grouped = skillsData;
  }

  return (
    <section id="skills" className="py-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Skills</h2>
          <div className="w-16 h-1 rounded-full" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }} />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(grouped).map(([category, categorySkills], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.1 }}
              className="glow-card p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColors[category] || '#6366f1' }}
                />
                <h3 className="text-lg font-semibold text-white">{category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(categorySkills) ? categorySkills : []).map((skill) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name;
                  const iconUrl = getSkillIcon(skillName);
                  return (
                    <span
                      key={skillName}
                      className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-gray-300 hover:bg-white/20 transition-colors cursor-default flex items-center gap-2"
                    >
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={skillName}
                          className="w-4 h-4 object-contain flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: '#fff' }}
                        >
                          {skillName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
