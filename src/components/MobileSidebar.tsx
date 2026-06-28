import React from 'react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  categoryCounts: Record<string, number>;
  onCategoryClick: (category: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  activeCategory,
  categoryCounts,
  onCategoryClick,
  onExpandAll,
  onCollapseAll,
}) => {
  const categoriesList = [
    { name: 'AI', cleanKey: 'ai', icon: 'fas fa-brain' },
    { name: 'UI / UX', cleanKey: 'uiux', icon: 'fas fa-pen-nib' },
    { name: 'React JS', cleanKey: 'react', icon: 'fab fa-react', matchKey: 'React' },
    { name: 'JavaScript', cleanKey: 'javascript', icon: 'fab fa-js' },
    { name: 'Next.js', cleanKey: 'nextjs', icon: 'fas fa-square' },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-[1040] transition-opacity duration-300 md:hidden"
        ></div>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-80 max-w-[80vw] bg-white z-[1050] border-r border-border-custom shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-custom">
          <h5 className="font-bold flex items-center gap-2 text-text-primary text-sm sm:text-base">
            <i className="fas fa-graduation-cap text-primary text-lg"></i> Interview Preparation Guide
          </h5>
          <button
            onClick={onClose}
            type="button"
            className="text-text-muted hover:text-text-primary text-lg font-bold flex items-center justify-center w-8 h-8 rounded-full hover:bg-border-light transition-colors"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h6 className="font-bold text-uppercase text-text-muted text-[0.8rem] tracking-wider uppercase mb-3">
            Categories
          </h6>
          <nav className="flex flex-col mb-6">
            {categoriesList.map((cat) => {
              const countKey = cat.matchKey || cat.name;
              const count = categoryCounts[countKey] || 0;
              const isCategoryActive = activeCategory.toLowerCase() === (cat.matchKey || cat.name).toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

              return (
                <a
                  key={cat.cleanKey}
                  onClick={() => {
                    onCategoryClick(countKey);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-[1.2rem] py-[0.8rem] mb-2 font-medium rounded-md transition-all duration-150 cursor-pointer border border-transparent select-none no-underline ${
                    isCategoryActive
                      ? 'bg-primary text-white font-semibold'
                      : 'text-text-secondary hover:bg-primary-light hover:text-primary'
                  }`}
                  style={{ opacity: count === 0 ? 0.5 : 1 }}
                >
                  <span>
                    <i className={`${cat.icon} mr-2`}></i> {cat.name}
                  </span>
                  <span
                    className={`text-[0.75rem] px-2.5 py-0.5 rounded-full font-semibold ${
                      isCategoryActive
                        ? 'bg-white/20 text-white'
                        : 'bg-border-light text-text-primary border border-border-custom'
                    }`}
                  >
                    {count}
                  </span>
                </a>
              );
            })}
          </nav>

          <h6 className="font-bold text-uppercase text-text-muted text-[0.8rem] tracking-wider uppercase mb-3">
            Actions
          </h6>
          <div className="grid gap-2">
            <button
              onClick={() => {
                onExpandAll();
                onClose();
              }}
              className="btn bg-primary text-white hover:bg-primary/95 text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors border-0"
            >
              <i className="fas fa-expand-arrows-alt"></i> Expand All Answers
            </button>
            <button
              onClick={() => {
                onCollapseAll();
                onClose();
              }}
              className="btn bg-white hover:bg-border-light text-text-secondary border border-border-custom text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <i className="fas fa-compress-arrows-alt"></i> Collapse All Answers
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
